# Node.js 线上问题排查实战（Node.js 24+）

> 本文档基于 Node.js 24+ 版本，聚焦线上环境的问题排查与生产实践。

---

## 目录

1. [进程崩溃处理](#1-进程崩溃处理)
2. [内存问题线上排查](#2-内存问题线上排查)
3. [CPU 高负载排查](#3-cpu-高负载排查)
4. [请求延迟问题](#4-请求延迟问题)
5. [连接问题排查](#5-连接问题排查)
6. [日志与监控](#6-日志与监控)
7. [容器化环境特有问题](#7-容器化环境特有问题)
8. [实战案例集](#8-实战案例集)

---

## 1. 进程崩溃处理

### 1.1 uncaughtException 处理策略

**核心原则：uncaughtException 发生后应该尽快退出进程。**

原因：
- V8 引擎在抛出未捕获异常后处于不确定状态
- 内存可能已损坏，继续运行会产生不可预期的行为
- 可能导致数据不一致

```javascript
// crash-handler.js
import { writeFileSync } from 'fs';

// 记录崩溃次数，防止无限重启
let crashCount = 0;
const MAX_CRASHES = 5;
const CRASH_WINDOW_MS = 60000;
const crashTimestamps = [];

function shouldExit() {
  const now = Date.now();
  crashTimestamps.push(now);

  // 只保留最近一分钟的崩溃记录
  while (crashTimestamps.length > 0 && crashTimestamps[0] < now - CRASH_WINDOW_MS) {
    crashTimestamps.shift();
  }

  return crashTimestamps.length >= MAX_CRASHES;
}

process.on('uncaughtException', (err, origin) => {
  crashCount++;

  // 记录错误信息
  const crashInfo = {
    timestamp: new Date().toISOString(),
    pid: process.pid,
    crashCount,
    origin,
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack,
      code: err.code,
      syscall: err.syscall
    },
    memory: process.memoryUsage(),
    uptime: process.uptime()
  };

  // 同步写入日志（确保在退出前写入）
  try {
    writeFileSync(
      `./crashes/crash-${Date.now()}.json`,
      JSON.stringify(crashInfo, null, 2)
    );
  } catch (e) {
    console.error('无法写入崩溃日志:', e.message);
  }

  console.error(`[FATAL] 未捕获异常 (#${crashCount}):`, err);

  // 如果短时间内崩溃太多次，直接退出不再尝试优雅关闭
  if (shouldExit()) {
    console.error('崩溃频率过高，强制退出');
    process.exit(1);
  }

  // 尝试优雅关闭
  gracefulShutdown(1);
});

// 未处理的 Promise 拒绝
process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的 Promise 拒绝:', reason);

  // 记录 promise 信息
  promise.catch(err => {
    console.error('Promise 错误详情:', err);
  });

  // 建议：根据业务决定是否退出
  // 对于非关键错误，可以只记录不退出
  // 但对于数据库连接失败等关键错误，应该退出
});

// 优雅退出
function gracefulShutdown(exitCode = 0) {
  console.log('开始优雅退出...');

  const shutdownTimeout = setTimeout(() => {
    console.error('优雅退出超时，强制退出');
    process.exit(exitCode);
  }, 30000);  // 30秒超时

  shutdownTimeout.unref();

  // 关闭服务器（停止接受新连接）
  if (global.server) {
    global.server.close(() => {
      console.log('HTTP 服务器已关闭');
    });
  }

  // 关闭数据库连接
  if (global.db) {
    global.db.end().then(() => {
      console.log('数据库连接已关闭');
    }).catch(err => {
      console.error('数据库关闭错误:', err);
    });
  }

  // 等待所有连接处理完成
  // 实际实现中需要跟踪活跃连接数
  setImmediate(() => {
    process.exit(exitCode);
  });
}

// 监听退出信号
process.on('SIGTERM', () => gracefulShutdown(0));
process.on('SIGINT', () => gracefulShutdown(0));

// 报告信号触发诊断报告
process.on('SIGQUIT', () => {
  if (process.report) {
    process.report.writeReport(`./diagnostics/report-sigquit-${Date.now()}.json`);
  }
});
```

### 1.2 优雅退出实现

```javascript
// graceful-shutdown.js
import http from 'http';

class GracefulShutdown {
  constructor(options = {}) {
    this.server = options.server;
    this.connections = new Set();
    this.shuttingDown = false;
    this.timeout = options.timeout || 30000;
    this.onShutdown = options.onShutdown || (() => Promise.resolve());
  }

  setup() {
    if (!this.server) return;

    // 追踪所有连接
    this.server.on('connection', (socket) => {
      this.connections.add(socket);

      socket.on('close', () => {
        this.connections.delete(socket);
      });
    });

    // 处理升级连接（WebSocket）
    this.server.on('upgrade', (req, socket) => {
      this.connections.add(socket);
      socket.on('close', () => this.connections.delete(socket));
    });

    // 监听信号
    process.on('SIGTERM', () => this.shutdown('SIGTERM'));
    process.on('SIGINT', () => this.shutdown('SIGINT'));
  }

  async shutdown(signal) {
    if (this.shuttingDown) {
      console.log('已经在关闭中...');
      return;
    }

    this.shuttingDown = true;
    console.log(`收到 ${signal} 信号，开始优雅退出...`);

    // 设置超时
    const timeout = setTimeout(() => {
      console.error('优雅退出超时，强制关闭剩余连接');
      this.forceClose();
      process.exit(1);
    }, this.timeout);

    try {
      // 1. 停止接受新连接
      this.server.close(() => {
        console.log('HTTP 服务器已停止接受新连接');
      });

      // 2. 执行自定义清理
      await this.onShutdown();

      // 3. 等待现有连接完成
      await this.closeConnections();

      clearTimeout(timeout);
      console.log('优雅退出完成');
      process.exit(0);
    } catch (error) {
      console.error('优雅退出出错:', error);
      clearTimeout(timeout);
      process.exit(1);
    }
  }

  async closeConnections() {
    const promises = [];

    for (const socket of this.connections) {
      promises.push(new Promise((resolve) => {
        // 设置 socket 超时，让客户端有机会完成
        socket.setTimeout(5000, () => {
          socket.destroy();
          resolve();
        });

        socket.on('close', resolve);
        socket.end();  // 发送 FIN，优雅关闭
      }));
    }

    // 等待所有连接关闭或超时
    await Promise.all(promises);
  }

  forceClose() {
    for (const socket of this.connections) {
      socket.destroy();
    }
    this.connections.clear();
  }
}

// 使用示例
const server = http.createServer((req, res) => {
  // 如果正在关闭，返回 503
  if (shutdownManager?.shuttingDown) {
    res.statusCode = 503;
    res.setHeader('Connection', 'close');
    res.end('Service Unavailable');
    return;
  }

  // 正常处理请求...
  res.end('OK');
});

const shutdownManager = new GracefulShutdown({
  server,
  timeout: 30000,
  onShutdown: async () => {
    // 关闭数据库连接池
    await dbPool.end();
    // 刷新日志
    await logger.flush();
    // 关闭 Redis 连接
    await redisClient.quit();
  }
});

shutdownManager.setup();

export { GracefulShutdown };
```

### 1.3 使用 PM2 / Systemd 自动重启

**PM2 配置：**

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'api-server',
    script: './server.js',
    instances: 'max',  // 使用所有 CPU 核心
    exec_mode: 'cluster',

    // 重启策略
    max_restarts: 10,           // 15分钟内最多重启10次
    min_uptime: '10s',          // 运行10秒以上才算成功启动
    max_memory_restart: '512M', // 内存超过512MB自动重启

    // 崩溃处理
    kill_timeout: 30000,        // 等待优雅关闭的时间
    listen_timeout: 10000,      // 等待应用就绪的时间
    shutdown_with_message: true, // 使用消息通知关闭

    // 日志
    log_file: './logs/combined.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',

    // 环境变量
    env: {
      NODE_ENV: 'production',
      NODE_OPTIONS: '--max-old-space-size=512'
    },

    // 监控
    monitoring: true,

    // 自动重启
    autorestart: true,
    restart_delay: 4000,  // 崩溃后等待4秒再重启

    // 健康检查
    health_check_grace_period: 30000
  }]
};
```

```bash
# PM2 常用命令
pm2 start ecosystem.config.js
pm2 reload api-server        # 零停机重启
pm2 scale api-server +2      # 增加2个实例
pm2 monit                    # 实时监控
pm2 logs api-server --lines 100
```

**Systemd 配置：**

```ini
# /etc/systemd/system/node-app.service
[Unit]
Description=Node.js API Server
After=network.target

[Service]
Type=simple
User=nodeuser
Group=nodeuser
WorkingDirectory=/opt/app

ExecStart=/usr/local/bin/node --max-old-space-size=512 server.js

# 重启策略
Restart=always
RestartSec=5
StartLimitInterval=60s
StartLimitBurst=3

# 优雅退出
TimeoutStopSec=30
KillSignal=SIGTERM

# 环境变量
Environment="NODE_ENV=production"
Environment="PORT=3000"
EnvironmentFile=/opt/app/.env

# 资源限制
LimitNOFILE=65535
LimitNPROC=4096

# 日志
StandardOutput=journal
StandardError=journal
SyslogIdentifier=node-app

[Install]
WantedBy=multi-user.target
```

```bash
# Systemd 命令
sudo systemctl daemon-reload
sudo systemctl enable node-app
sudo systemctl start node-app
sudo systemctl status node-app
sudo journalctl -u node-app -f
```

### 1.4 `--report-on-signal` 信号触发诊断报告

```bash
# 启动时启用信号触发报告
node --report-on-signal \
     --report-directory=./diagnostics \
     --report-filename=report-signal-%Y%m%d-%H%M%S.json \
     server.js

# 发送信号生成报告
kill -USR2 <pid>   # 用户自定义信号2
kill -QUIT <pid>   # 生成报告并优雅退出
```

```javascript
// signal-report-handler.js
// 自定义信号处理

process.on('SIGUSR2', () => {
  console.log('收到 SIGUSR2，生成诊断报告...');

  if (process.report) {
    const filename = process.report.writeReport(
      `./diagnostics/manual-${Date.now()}.json`
    );
    console.log(`诊断报告已生成: ${filename}`);
  }

  // 同时生成堆快照
  const { writeHeapSnapshot } = await import('v8');
  const heapFile = writeHeapSnapshot(`./diagnostics/heap-${Date.now()}.heapsnapshot`);
  console.log(`堆快照已生成: ${heapFile}`);
});

// 内存压力信号
process.on('SIGUSR1', async () => {
  console.log('收到 SIGUSR1，记录当前状态...');

  const usage = process.memoryUsage();
  const report = {
    timestamp: new Date().toISOString(),
    memory: {
      rss: `${(usage.rss / 1024 / 1024).toFixed(2)} MB`,
      heapTotal: `${(usage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
      heapUsed: `${(usage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
      external: `${(usage.external / 1024 / 1024).toFixed(2)} MB`,
      arrayBuffers: `${(usage.arrayBuffers / 1024 / 1024).toFixed(2)} MB`
    },
    cpu: process.cpuUsage(),
    uptime: process.uptime()
  };

  console.log(JSON.stringify(report, null, 2));
});
```

---

## 2. 内存问题线上排查

### 2.1 线上内存监控指标

```javascript
// memory-monitor.js
import { getHeapStatistics, getHeapSpaceStatistics, writeHeapSnapshot } from 'v8';
import os from 'os';

class MemoryMonitor {
  constructor(options = {}) {
    this.interval = options.interval || 30000;
    this.thresholds = {
      heapUsedRatio: options.heapThreshold || 0.85,
      rssRatio: options.rssThreshold || 0.80,
      externalLimit: options.externalLimit || 100 * 1024 * 1024  // 100MB
    };
    this.history = [];
    this.maxHistory = options.maxHistory || 100;
    this.timer = null;
  }

  collect() {
    const memUsage = process.memoryUsage();
    const heapStats = getHeapStatistics();
    const heapSpaces = getHeapSpaceStatistics();

    const snapshot = {
      timestamp: Date.now(),
      rss: memUsage.rss,
      heapTotal: memUsage.heapTotal,
      heapUsed: memUsage.heapUsed,
      external: memUsage.external,
      arrayBuffers: memUsage.arrayBuffers,
      heapSizeLimit: heapStats.heap_size_limit,
      totalAvailableSize: heapStats.total_available_size,
      // 计算比率
      heapUsedRatio: memUsage.heapUsed / heapStats.heap_size_limit,
      rssRatio: memUsage.rss / os.totalmem(),
      // 堆空间详情
      newSpace: this.findSpace(heapSpaces, 'new_space'),
      oldSpace: this.findSpace(heapSpaces, 'old_space'),
      codeSpace: this.findSpace(heapSpaces, 'code_space'),
      mapSpace: this.findSpace(heapSpaces, 'map_space'),
      largeObjectSpace: this.findSpace(heapSpaces, 'large_object_space')
    };

    this.history.push(snapshot);
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }

    return snapshot;
  }

  findSpace(spaces, name) {
    const space = spaces.find(s => s.space_name === name);
    return space ? {
      size: space.space_size,
      used: space.space_used_size,
      available: space.space_available_size
    } : null;
  }

  checkThresholds(snapshot) {
    const alerts = [];

    if (snapshot.heapUsedRatio > this.thresholds.heapUsedRatio) {
      alerts.push({
        level: 'warning',
        metric: 'heapUsedRatio',
        value: snapshot.heapUsedRatio,
        threshold: this.thresholds.heapUsedRatio,
        message: `堆内存使用率 ${(snapshot.heapUsedRatio * 100).toFixed(1)}% 超过阈值`
      });
    }

    if (snapshot.rssRatio > this.thresholds.rssRatio) {
      alerts.push({
        level: 'critical',
        metric: 'rssRatio',
        value: snapshot.rssRatio,
        threshold: this.thresholds.rssRatio,
        message: `RSS 内存使用率 ${(snapshot.rssRatio * 100).toFixed(1)}% 超过阈值`
      });
    }

    if (snapshot.external > this.thresholds.externalLimit) {
      alerts.push({
        level: 'warning',
        metric: 'external',
        value: snapshot.external,
        threshold: this.thresholds.externalLimit,
        message: `External 内存 ${(snapshot.external / 1024 / 1024).toFixed(1)}MB 超过阈值`
      });
    }

    // 检测内存持续增长趋势
    if (this.history.length >= 10) {
      const recent = this.history.slice(-10);
      const first = recent[0].heapUsed;
      const last = recent[recent.length - 1].heapUsed;
      const growthRate = (last - first) / first;

      if (growthRate > 0.5) {  // 10个周期内增长超过50%
        alerts.push({
          level: 'warning',
          metric: 'growthRate',
          value: growthRate,
          message: `堆内存持续增长，10个周期内增长 ${(growthRate * 100).toFixed(1)}%`
        });
      }
    }

    return alerts;
  }

  start() {
    this.timer = setInterval(() => {
      const snapshot = this.collect();
      const alerts = this.checkThresholds(snapshot);

      // 输出指标
      console.log('内存指标:', {
        rss: `${(snapshot.rss / 1024 / 1024).toFixed(1)}MB`,
        heapUsed: `${(snapshot.heapUsed / 1024 / 1024).toFixed(1)}MB`,
        heapTotal: `${(snapshot.heapTotal / 1024 / 1024).toFixed(1)}MB`,
        external: `${(snapshot.external / 1024 / 1024).toFixed(1)}MB`,
        heapUsedRatio: `${(snapshot.heapUsedRatio * 100).toFixed(1)}%`
      });

      // 处理告警
      for (const alert of alerts) {
        console[alert.level === 'critical' ? 'error' : 'warn'](`[内存告警] ${alert.message}`);

        if (alert.level === 'critical') {
          this.handleCriticalAlert(alert, snapshot);
        }
      }
    }, this.interval);
  }

  handleCriticalAlert(alert, snapshot) {
    // 生成堆快照用于后续分析
    try {
      const filename = writeHeapSnapshot(`./heap-critical-${Date.now()}.heapsnapshot`);
      console.log(`已生成堆快照: ${filename}`);
    } catch (e) {
      console.error('生成堆快照失败:', e.message);
    }
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  getHistory() {
    return this.history;
  }

  getTrend() {
    if (this.history.length < 2) return null;

    const first = this.history[0];
    const last = this.history[this.history.length - 1];
    const duration = (last.timestamp - first.timestamp) / 1000;

    return {
      durationSeconds: duration,
      heapGrowth: last.heapUsed - first.heapUsed,
      heapGrowthRate: (last.heapUsed - first.heapUsed) / duration,  // bytes/sec
      rssGrowth: last.rss - first.rss
    };
  }
}

export { MemoryMonitor };
```

### 2.2 使用 `v8.writeHeapSnapshot()` 动态生成堆快照

```javascript
// heap-snapshot-server.js
import { writeHeapSnapshot } from 'v8';
import http from 'http';
import { createHash } from 'crypto';

// 简单的认证中间件
function authenticate(req, res, next) {
  const token = req.headers['x-admin-token'];
  const expectedToken = process.env.ADMIN_TOKEN;

  if (!expectedToken) {
    res.statusCode = 500;
    res.end('ADMIN_TOKEN not configured');
    return;
  }

  if (token !== expectedToken) {
    res.statusCode = 401;
    res.end('Unauthorized');
    return;
  }

  next();
}

const server = http.createServer((req, res) => {
  // 健康检查
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      uptime: process.uptime(),
      memory: process.memoryUsage()
    }));
    return;
  }

  // 内存指标
  if (req.url === '/metrics/memory') {
    const mem = process.memoryUsage();
    const v8 = await import('v8');
    const heapStats = v8.getHeapStatistics();

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      rss: mem.rss,
      heapTotal: mem.heapTotal,
      heapUsed: mem.heapUsed,
      external: mem.external,
      heapSizeLimit: heapStats.heap_size_limit,
      usedHeapRatio: mem.heapUsed / heapStats.heap_size_limit
    }));
    return;
  }

  // 生成堆快照（需要认证）
  if (req.url === '/admin/heap-snapshot' && req.method === 'POST') {
    authenticate(req, res, async () => {
      try {
        const label = new URL(req.url, `http://${req.headers.host}`).searchParams.get('label') || 'manual';
        const filename = writeHeapSnapshot(`./heap-${label}-${Date.now()}.heapsnapshot`);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, filename }));
      } catch (error) {
        res.writeHead(500);
        res.end(JSON.stringify({ error: error.message }));
      }
    });
    return;
  }

  // 触发 GC（需要认证，仅用于调试）
  if (req.url === '/admin/gc' && req.method === 'POST') {
    authenticate(req, res, () => {
      if (global.gc) {
        const before = process.memoryUsage().heapUsed;
        global.gc();
        const after = process.memoryUsage().heapUsed;

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          before: before,
          after: after,
          freed: before - after
        }));
      } else {
        res.writeHead(400);
        res.end(JSON.stringify({
          error: 'GC not exposed. Run with --expose-gc flag.'
        }));
      }
    });
    return;
  }

  res.statusCode = 404;
  res.end('Not Found');
});

server.listen(3000, () => {
  console.log('Server running on port 3000');
  console.log('Endpoints:');
  console.log('  GET  /health');
  console.log('  GET  /metrics/memory');
  console.log('  POST /admin/heap-snapshot (requires x-admin-token header)');
  console.log('  POST /admin/gc (requires x-admin-token header)');
});
```

### 2.3 内存泄漏排查流程（5步法）

```javascript
// memory-leak-investigation.js
import { writeHeapSnapshot, getHeapStatistics } from 'v8';

/**
 * 内存泄漏排查 5 步法
 */
class LeakInvestigator {
  constructor() {
    this.snapshots = [];
  }

  /**
   * 步骤1：确认是否真的存在泄漏
   * - 观察堆内存是否持续增长
   * - 排除正常的内存使用模式
   */
  async step1_confirmLeak(duration = 60000, interval = 5000) {
    console.log('步骤1：确认内存泄漏...');

    const readings = [];
    const startTime = Date.now();

    return new Promise((resolve) => {
      const timer = setInterval(() => {
        const mem = process.memoryUsage();
        readings.push({
          time: Date.now() - startTime,
          heapUsed: mem.heapUsed,
          rss: mem.rss
        });

        if (Date.now() - startTime >= duration) {
          clearInterval(timer);

          // 分析趋势
          const first = readings[0];
          const last = readings[readings.length - 1];
          const growth = last.heapUsed - first.heapUsed;
          const growthRate = growth / (duration / 1000);  // bytes/sec

          const isLeaking = growthRate > 1024;  // > 1KB/sec 视为泄漏

          console.log(`  初始堆内存: ${(first.heapUsed / 1024 / 1024).toFixed(2)}MB`);
          console.log(`  最终堆内存: ${(last.heapUsed / 1024 / 1024).toFixed(2)}MB`);
          console.log(`  增长率: ${(growthRate / 1024).toFixed(2)}KB/s`);
          console.log(`  结论: ${isLeaking ? '可能存在泄漏' : '正常波动'}`);

          resolve({ isLeaking, growthRate, readings });
        }
      }, interval);
    });
  }

  /**
   * 步骤2：生成基线快照
   */
  step2_baseline() {
    console.log('步骤2：生成基线快照...');
    // 先强制 GC，确保干净状态
    if (global.gc) global.gc();

    const filename = writeHeapSnapshot('./heap-baseline.heapsnapshot');
    this.snapshots.push({ label: 'baseline', filename });
    console.log(`  基线快照: ${filename}`);
    return filename;
  }

  /**
   * 步骤3：执行可疑操作后生成快照
   */
  step3_afterOperation(label) {
    console.log(`步骤3：生成操作后快照 (${label})...`);
    if (global.gc) global.gc();

    const filename = writeHeapSnapshot(`./heap-${label}.heapsnapshot`);
    this.snapshots.push({ label, filename });
    console.log(`  快照: ${filename}`);
    return filename;
  }

  /**
   * 步骤4：对比分析
   * 使用 Chrome DevTools 的 Comparison 视图
   */
  step4_analyze() {
    console.log('步骤4：分析快照...');
    console.log('  请在 Chrome DevTools 中:');
    console.log('  1. 加载 baseline 快照');
    console.log('  2. 选择 Comparison 视图');
    console.log('  3. 对比后续快照');
    console.log('  4. 关注 #Delta 列中增长最多的对象类型');

    return this.snapshots;
  }

  /**
   * 步骤5：定位根因并修复
   */
  step5_identifyRootCause(suspectedConstructors) {
    console.log('步骤5：定位根因...');
    console.log('  可疑对象类型:', suspectedConstructors);
    console.log('  检查 Retainers 面板，追踪引用链');
    console.log('  常见泄漏模式:');
    console.log('    - 全局变量引用');
    console.log('    - 闭包捕获');
    console.log('    - 事件监听器未移除');
    console.log('    - 定时器未清理');
    console.log('    - Map/Set 无限增长');
    console.log('    - 流未正确关闭');
  }

  /**
   * 执行完整排查流程
   */
  async investigate(operation, options = {}) {
    const { duration = 30000, label = 'operation' } = options;

    // 步骤1
    const { isLeaking } = await this.step1_confirmLeak(duration);
    if (!isLeaking) {
      console.log('未检测到明显泄漏，排查结束');
      return;
    }

    // 步骤2-3
    this.step2_baseline();
    await operation();
    this.step3_afterOperation(label);

    // 再次执行并快照
    await operation();
    this.step3_afterOperation(`${label}-2`);

    // 步骤4-5
    this.step4_analyze();

    return this.snapshots;
  }
}

export { LeakInvestigator };
```

### 2.4 典型内存泄漏场景

```javascript
// common-memory-leaks.js

// ====== 场景1：全局缓存未清理 ======
class GlobalCacheLeak {
  constructor() {
    // 泄漏：全局缓存无限增长
    this.cache = new Map();
  }

  add(key, value) {
    this.cache.set(key, value);  // 没有淘汰策略
  }

  // 修复：使用 WeakMap 或 LRU
}

class FixedGlobalCache {
  constructor(maxSize = 1000) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  add(key, value) {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  // 或使用 WeakMap（键必须是对象）
}

// ====== 场景2：闭包捕获 ======
function createClosureLeak() {
  const largeData = new Array(1000000).fill('x');  // 大对象

  return {
    // 泄漏：即使只使用 smallData，largeData 也被闭包保留
    getSmallData: () => largeData[0]
  };
}

// 修复：只捕获需要的部分
function createFixedClosure() {
  const largeData = new Array(1000000).fill('x');
  const smallData = largeData[0];  // 只提取需要的值

  return {
    getSmallData: () => smallData  // 不再引用 largeData
  };
}

// ====== 场景3：事件监听器未移除 ======
class EventListenerLeak {
  constructor(emitter) {
    // 泄漏：每次创建实例都添加监听器，但从不移除
    emitter.on('data', this.handleData.bind(this));
  }

  handleData(data) {
    console.log(data);
  }
}

// 修复：正确移除监听器
class FixedEventListener {
  constructor(emitter) {
    this.emitter = emitter;
    this.handleData = this.handleData.bind(this);
    emitter.on('data', this.handleData);
  }

  destroy() {
    this.emitter.off('data', this.handleData);
  }

  handleData(data) {
    console.log(data);
  }
}

// 或使用 EventEmitter 的 once
emitter.once('event', handler);  // 自动移除

// ====== 场景4：定时器未清理 ======
class TimerLeak {
  start() {
    // 泄漏：定时器 ID 未保存，无法清理
    setInterval(() => {
      this.doWork();
    }, 1000);
  }
}

// 修复：保存定时器引用
class FixedTimer {
  constructor() {
    this.timers = new Set();
  }

  start() {
    const timer = setInterval(() => this.doWork(), 1000);
    this.timers.add(timer);
  }

  destroy() {
    for (const timer of this.timers) {
      clearInterval(timer);
    }
    this.timers.clear();
  }

  doWork() {}
}

// ====== 场景5：流未正确关闭 ======
import { createReadStream } from 'fs';

class StreamLeak {
  processFile(path) {
    // 泄漏：流可能未关闭
    const stream = createReadStream(path);
    stream.on('data', chunk => {
      console.log(chunk);
    });
    // 没有处理 end/error 事件，也没有关闭流
  }
}

// 修复：使用 pipeline 或确保关闭
import { pipeline } from 'stream/promises';

class FixedStream {
  async processFile(path) {
    const stream = createReadStream(path);

    try {
      for await (const chunk of stream) {
        console.log(chunk);
      }
    } finally {
      stream.destroy();  // 确保关闭
    }
  }

  // 或使用 pipeline
  async processFilePipeline(path, output) {
    await pipeline(
      createReadStream(path),
      output
    );
  }
}

// ====== 场景6：Promise 链泄漏 ======
class PromiseLeak {
  async longRunning() {
    // 泄漏：如果外部不再关心结果，但 Promise 仍在执行
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.largeData);
      }, 60000);
    });
  }
}

// 修复：使用 AbortController
class FixedPromise {
  async longRunning(signal) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        resolve(this.data);
      }, 60000);

      signal?.addEventListener('abort', () => {
        clearTimeout(timer);
        reject(new Error('Aborted'));
      });
    });
  }
}
```

---

## 3. CPU 高负载排查

### 3.1 使用 `SIGUSR1` 触发 CPU Profile

```javascript
// cpu-profile-signal.js
import { Session } from 'inspector';
import { writeFileSync } from 'fs';

const session = new Session();
session.connect();

let isProfiling = false;

process.on('SIGUSR1', async () => {
  if (isProfiling) {
    console.log('停止 CPU Profile 录制...');
    const { profile } = await new Promise((resolve, reject) => {
      session.post('Profiler.stop', (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    const filename = `./cpu-profile-${Date.now()}.cpuprofile`;
    writeFileSync(filename, JSON.stringify(profile));
    console.log(`CPU Profile 已保存: ${filename}`);

    isProfiling = false;
  } else {
    console.log('开始 CPU Profile 录制...');
    await new Promise((resolve, reject) => {
      session.post('Profiler.enable', (err) => {
        if (err) reject(err);
        else {
          session.post('Profiler.start', (err2) => {
            if (err2) reject(err2);
            else resolve();
          });
        }
      });
    });
    isProfiling = true;

    // 30秒后自动停止
    setTimeout(() => {
      if (isProfiling) {
        process.kill(process.pid, 'SIGUSR1');
      }
    }, 30000);
  }
});

console.log('PID:', process.pid);
console.log('发送 SIGUSR1 开始/停止 CPU Profile 录制');
```

### 3.2 使用 `inspector` 模块动态开启调试

```javascript
// dynamic-inspector.js
import { Session } from 'inspector';
import http from 'http';

const session = new Session();

/**
 * 动态启动 Inspector（不重启应用）
 */
export async function startInspector(port = 9230) {
  return new Promise((resolve, reject) => {
    session.post('Debugger.enable', (err) => {
      if (err) return reject(err);

      session.post('Runtime.enable', (err2) => {
        if (err2) return reject(err2);

        console.log(`Inspector 已启用，可以通过 Chrome DevTools 连接`);
        console.log(`chrome://inspect -> Configure -> localhost:${port}`);

        resolve();
      });
    });
  });
}

/**
 * 动态执行代码（用于紧急诊断）
 */
export function evaluateExpression(expression) {
  return new Promise((resolve, reject) => {
    session.post('Runtime.evaluate', {
      expression,
      includeCommandLineAPI: true,
      returnByValue: true
    }, (err, result) => {
      if (err) reject(err);
      else resolve(result.result);
    });
  });
}

/**
 * 获取当前调用栈
 */
export async function getStackTrace() {
  await new Promise((resolve, reject) => {
    session.post('Debugger.enable', (err) => {
      if (err) reject(err);
      else resolve();
    });
  });

  return new Promise((resolve, reject) => {
    session.post('Debugger.pause', (err) => {
      if (err) reject(err);
      else {
        session.once('Debugger.paused', ({ params }) => {
          resolve(params.callFrames);

          // 恢复执行
          session.post('Debugger.resume');
        });
      }
    });
  });
}

/**
 * HTTP 接口暴露诊断能力（需严格认证）
 */
export function createDiagnosticsServer(options = {}) {
  const { port = 9999, authToken } = options;

  const server = http.createServer(async (req, res) => {
    // 认证检查
    if (req.headers['x-auth-token'] !== authToken) {
      res.statusCode = 401;
      res.end('Unauthorized');
      return;
    }

    // 执行表达式
    if (req.url === '/eval' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', async () => {
        try {
          const { expression } = JSON.parse(body);
          const result = await evaluateExpression(expression);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(result));
        } catch (error) {
          res.writeHead(500);
          res.end(JSON.stringify({ error: error.message }));
        }
      });
      return;
    }

    // 获取堆统计
    if (req.url === '/heap') {
      const v8 = await import('v8');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        memoryUsage: process.memoryUsage(),
        heapStatistics: v8.getHeapStatistics()
      }));
      return;
    }

    res.statusCode = 404;
    res.end('Not Found');
  });

  server.listen(port, () => {
    console.log(`诊断服务器运行在端口 ${port}`);
  });

  return server;
}
```

### 3.3 死循环/无限递归检测

```javascript
// loop-detection.js
import { Session } from 'inspector';

/**
 * 检测事件循环阻塞
 */
class LoopBlockDetector {
  constructor(options = {}) {
    this.threshold = options.threshold || 100;  // 阻塞超过100ms报警
    this.interval = options.interval || 5000;
    this.timer = null;
    this.blockedCount = 0;
  }

  start() {
    let lastCheck = Date.now();

    this.timer = setInterval(() => {
      const now = Date.now();
      const delta = now - lastCheck;

      // 如果实际间隔远大于预期间隔，说明事件循环被阻塞
      if (delta > this.interval + this.threshold) {
        this.blockedCount++;
        const blockedTime = delta - this.interval;
        console.error(`[警告] 事件循环被阻塞 ${blockedTime}ms (累计 ${this.blockedCount} 次)`);

        // 记录当前调用栈
        this.captureStack();
      }

      lastCheck = now;
    }, this.interval);
  }

  captureStack() {
    const stack = new Error('Event loop blocked').stack;
    console.error('可能的阻塞位置:', stack);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}

/**
 * 使用 perf_hooks 监控事件循环延迟
 */
import { monitorEventLoopDelay } from 'perf_hooks';

function setupEventLoopMonitoring(options = {}) {
  const { resolution = 10, histogram } = monitorEventLoopDelay({ resolution });
  histogram.enable();

  setInterval(() => {
    const min = histogram.min / 1e6;      // ns to ms
    const max = histogram.max / 1e6;
    const mean = histogram.mean / 1e6;
    const p99 = histogram.percentile(99) / 1e6;

    console.log('事件循环延迟:', {
      min: `${min.toFixed(3)}ms`,
      max: `${max.toFixed(3)}ms`,
      mean: `${mean.toFixed(3)}ms`,
      p99: `${p99.toFixed(3)}ms`,
      count: histogram.count
    });

    // 重置直方图
    histogram.reset();

    // 告警
    if (p99 > 100) {
      console.error(`[严重] 事件循环 P99 延迟 ${p99.toFixed(2)}ms 超过阈值`);
    }
  }, options.reportInterval || 30000);

  return histogram;
}

/**
 * 检测无限递归
 */
function withRecursionLimit(fn, maxDepth = 1000) {
  let depth = 0;

  return function recursive(...args) {
    depth++;
    if (depth > maxDepth) {
      depth = 0;
      throw new Error(`递归深度超过限制 ${maxDepth}，可能存在无限递归`);
    }

    try {
      return fn.call(this, ...args);
    } finally {
      depth--;
    }
  };
}

// 使用示例
const safeFactorial = withRecursionLimit(function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}, 10000);

export { LoopBlockDetector, setupEventLoopMonitoring, withRecursionLimit };
```

### 3.4 正则表达式回溯导致的 CPU 飙升（ReDoS）

```javascript
// redos-detection.js

/**
 * ReDoS（正则表达式拒绝服务）检测与防护
 */

// 危险的正则模式示例
const DANGEROUS_PATTERNS = [
  /(a+)+$/,           // 嵌套量词
  /(a*)*$/,           // 嵌套星号
  /(a|a)+$/,          // 冗余分支
  /(.*a){x}$/i,       // 贪婪匹配 + 忽略大小写
];

// 安全的正则实现
class SafeRegex {
  constructor(options = {}) {
    this.timeout = options.timeout || 1000;  // 默认1秒超时
  }

  /**
   * 带超时的正则匹配
   */
  test(pattern, input) {
    return new Promise((resolve, reject) => {
      const worker = new Worker('./regex-worker.js', {
        workerData: { pattern: pattern.source, flags: pattern.flags, input }
      });

      const timer = setTimeout(() => {
        worker.terminate();
        reject(new Error(`正则表达式执行超时 (${this.timeout}ms)，可能存在 ReDoS 风险`));
      }, this.timeout);

      worker.on('message', (result) => {
        clearTimeout(timer);
        resolve(result);
      });

      worker.on('error', (err) => {
        clearTimeout(timer);
        reject(err);
      });
    });
  }

  /**
   * 静态检测危险正则
   */
  static isDangerous(pattern) {
    const source = pattern.source;

    // 检测嵌套量词
    if (/\([^)]*\+\)\+/.test(source) || /\([^)]*\*\)\*/.test(source)) {
      return true;
    }

    // 检测贪婪量词 + 回溯风险
    if (/\.\*\?/.test(source) && /[+|]/.test(source)) {
      return true;
    }

    // 检测重复分组
    const groupMatches = source.match(/\(/g);
    if (groupMatches && groupMatches.length > 3) {
      return true;  // 复杂分组可能有问题
    }

    return false;
  }
}

/**
 * 使用 RE2 引擎（Google 的安全正则实现）
 */
// npm install re2
// import RE2 from 're2';
// const safePattern = new RE2('(a+)+');  // RE2 保证线性时间复杂度

/**
 * 输入验证与长度限制
 */
function safeMatch(pattern, input, options = {}) {
  const maxLength = options.maxLength || 1000;
  const maxMatches = options.maxMatches || 100;

  if (input.length > maxLength) {
    throw new Error(`输入长度 ${input.length} 超过限制 ${maxLength}`);
  }

  const matches = input.match(pattern);

  if (matches && matches.length > maxMatches) {
    throw new Error(`匹配结果数量 ${matches.length} 超过限制 ${maxMatches}`);
  }

  return matches;
}

// 实战案例：安全的邮箱验证
function validateEmail(email) {
  // 危险：/^([a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/
  // 安全：限制长度，避免贪婪匹配
  if (email.length > 254) return false;  // RFC 5321 限制

  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,63}$/;
  return pattern.test(email);
}

export { SafeRegex, safeMatch, validateEmail };
```

---

## 4. 请求延迟问题

### 4.1 事件循环延迟监控

```javascript
// event-loop-monitor.js
import { monitorEventLoopDelay, performance } from 'perf_hooks';
import { AsyncLocalStorage } from 'async_hooks';

/**
 * 事件循环延迟监控
 */
class EventLoopMonitor {
  constructor(options = {}) {
    this.histogram = monitorEventLoopDelay({
      resolution: options.resolution || 10
    });
    this.thresholds = {
      warning: options.warningThreshold || 50,   // 50ms
      critical: options.criticalThreshold || 100  // 100ms
    };
    this.reportInterval = options.reportInterval || 30000;
  }

  start() {
    this.histogram.enable();

    this.timer = setInterval(() => {
      const stats = {
        min: this.histogram.min / 1e6,
        max: this.histogram.max / 1e6,
        mean: this.histogram.mean / 1e6,
        stddev: this.histogram.stddev / 1e6,
        p50: this.histogram.percentile(50) / 1e6,
        p90: this.histogram.percentile(90) / 1e6,
        p99: this.histogram.percentile(99) / 1e6,
        count: this.histogram.count
      };

      // 输出指标
      console.log('事件循环延迟 (ms):', {
        min: stats.min.toFixed(3),
        mean: stats.mean.toFixed(3),
        p90: stats.p90.toFixed(3),
        p99: stats.p99.toFixed(3),
        max: stats.max.toFixed(3)
      });

      // 告警
      if (stats.p99 > this.thresholds.critical) {
        console.error(`[严重] 事件循环 P99 延迟 ${stats.p99.toFixed(2)}ms 超过 ${this.thresholds.critical}ms`);
      } else if (stats.p99 > this.thresholds.warning) {
        console.warn(`[警告] 事件循环 P99 延迟 ${stats.p99.toFixed(2)}ms 超过 ${this.thresholds.warning}ms`);
      }

      this.histogram.reset();
    }, this.reportInterval);
  }

  stop() {
    this.histogram.disable();
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  getCurrentDelay() {
    return this.histogram.mean / 1e6;
  }
}

/**
 * 请求耗时追踪
 */
const requestStore = new AsyncLocalStorage();

function createRequestTimer() {
  const start = performance.now();

  return {
    mark: (label) => {
      const elapsed = performance.now() - start;
      const store = requestStore.getStore();
      if (store) {
        store.timing = store.timing || [];
        store.timing.push({ label, elapsed: Math.round(elapsed * 100) / 100 });
      }
      return elapsed;
    },
    end: () => performance.now() - start
  };
}

/**
 * Express 中间件：追踪请求各阶段耗时
 */
export function timingMiddleware(req, res, next) {
  const timer = createRequestTimer();
  const phases = {};

  // 记录各阶段时间
  req.on('end', () => { phases.requestBody = timer.mark('request-body'); });

  const originalEnd = res.end;
  res.end = function(...args) {
    phases.total = timer.end();
    res.end = originalEnd;
    res.end(...args);

    // 添加到响应头
    res.setHeader('X-Response-Time', `${phases.total.toFixed(2)}ms`);

    // 记录详细耗时
    if (phases.total > 1000) {
      console.warn('慢请求:', {
        method: req.method,
        path: req.path,
        duration: `${phases.total.toFixed(2)}ms`,
        phases
      });
    }
  };

  // 将 timer 附加到请求对象
  req.timer = timer;
  req.phases = phases;

  next();
}

export { EventLoopMonitor, createRequestTimer, requestStore };
```

### 4.2 AsyncLocalStorage 追踪请求耗时

```javascript
// request-tracing.js
import { AsyncLocalStorage } from 'async_hooks';
import { performance } from 'perf_hooks';

const traceStore = new AsyncLocalStorage();

/**
 * 创建带追踪的上下文
 */
export function createTraceContext(req) {
  return {
    requestId: req.headers['x-request-id'] || generateId(),
    traceId: req.headers['x-trace-id'] || generateId(),
    startTime: performance.now(),
    spans: []
  };
}

/**
 * 创建 span（追踪单元）
 */
export function createSpan(name, attributes = {}) {
  const context = traceStore.getStore();
  if (!context) return { end: () => {} };

  const span = {
    name,
    startTime: performance.now(),
    attributes,
    endTime: null,
    duration: null
  };

  return {
    end: (endAttributes = {}) => {
      span.endTime = performance.now();
      span.duration = span.endTime - span.startTime;
      span.attributes = { ...span.attributes, ...endAttributes };
      context.spans.push(span);

      // 慢操作告警
      if (span.duration > 500) {
        console.warn(`[慢操作] ${name}: ${span.duration.toFixed(2)}ms`, attributes);
      }

      return span;
    },
    setAttribute: (key, value) => {
      span.attributes[key] = value;
    }
  };
}

/**
 * 包装异步函数，自动追踪
 */
export function traced(name, fn) {
  return async function(...args) {
    const span = createSpan(name, { args: args.map(a => typeof a === 'object' ? '[Object]' : a) });

    try {
      const result = await fn.apply(this, args);
      span.end({ status: 'success' });
      return result;
    } catch (error) {
      span.end({ status: 'error', error: error.message });
      throw error;
    }
  };
}

/**
 * 数据库查询追踪示例
 */
export async function tracedQuery(db, sql, params) {
  const span = createSpan('db.query', { sql: sql.slice(0, 200) });

  try {
    const start = performance.now();
    const result = await db.query(sql, params);
    const duration = performance.now() - start;

    span.end({
      rowCount: result.rows?.length,
      duration: `${duration.toFixed(2)}ms`
    });

    return result;
  } catch (error) {
    span.end({ error: error.message });
    throw error;
  }
}

/**
 * HTTP 客户端追踪
 */
export async function tracedFetch(url, options = {}) {
  const span = createSpan('http.request', { url, method: options.method || 'GET' });

  try {
    const response = await fetch(url, options);
    span.end({
      statusCode: response.status,
      statusText: response.statusText
    });
    return response;
  } catch (error) {
    span.end({ error: error.message });
    throw error;
  }
}

/**
 * 获取当前追踪报告
 */
export function getTraceReport() {
  const context = traceStore.getStore();
  if (!context) return null;

  const totalDuration = performance.now() - context.startTime;

  return {
    requestId: context.requestId,
    totalDuration: `${totalDuration.toFixed(2)}ms`,
    spanCount: context.spans.length,
    spans: context.spans.map(s => ({
      name: s.name,
      duration: `${s.duration.toFixed(2)}ms`,
      attributes: s.attributes
    })).sort((a, b) => parseFloat(b.duration) - parseFloat(a.duration))
  };
}

function generateId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export { traceStore };
```

### 4.3 慢查询定位

```javascript
// slow-query-detector.js

/**
 * 数据库慢查询检测
 */
class SlowQueryDetector {
  constructor(options = {}) {
    this.threshold = options.threshold || 100;  // 100ms
    this.queries = [];
    this.maxQueries = options.maxQueries || 1000;
  }

  wrapQueryExecutor(executor) {
    return async (sql, params, options = {}) => {
      const start = performance.now();
      const queryId = generateId();

      try {
        const result = await executor(sql, params, options);
        this.recordQuery(queryId, sql, params, start, null);
        return result;
      } catch (error) {
        this.recordQuery(queryId, sql, params, start, error);
        throw error;
      }
    };
  }

  recordQuery(id, sql, params, startTime, error) {
    const duration = performance.now() - startTime;
    const query = {
      id,
      sql: sql.slice(0, 500),  // 截断长 SQL
      params: JSON.stringify(params).slice(0, 200),
      duration,
      timestamp: new Date().toISOString(),
      error: error?.message
    };

    this.queries.push(query);
    if (this.queries.length > this.maxQueries) {
      this.queries.shift();
    }

    if (duration > this.threshold) {
      console.warn(`[慢查询] ${duration.toFixed(2)}ms: ${sql.slice(0, 100)}...`);
    }
  }

  getSlowQueries(threshold = this.threshold) {
    return this.queries
      .filter(q => q.duration > threshold)
      .sort((a, b) => b.duration - a.duration);
  }

  getQueryStats() {
    const total = this.queries.length;
    if (total === 0) return null;

    const durations = this.queries.map(q => q.duration).sort((a, b) => a - b);

    return {
      total,
      slow: this.queries.filter(q => q.duration > this.threshold).length,
      avg: durations.reduce((a, b) => a + b, 0) / total,
      min: durations[0],
      max: durations[durations.length - 1],
      p50: durations[Math.floor(total * 0.5)],
      p95: durations[Math.floor(total * 0.95)],
      p99: durations[Math.floor(total * 0.99)]
    };
  }

  // 分析慢查询模式
  analyzePatterns() {
    const slowQueries = this.getSlowQueries();
    const patterns = new Map();

    for (const query of slowQueries) {
      // 提取 SQL 模式（去除具体值）
      const pattern = query.sql
        .replace(/\$\d+/g, '?')
        .replace(/'[^']*'/g, "'?'")
        .replace(/\d+/g, '?');

      const existing = patterns.get(pattern) || { count: 0, totalDuration: 0, examples: [] };
      existing.count++;
      existing.totalDuration += query.duration;
      if (existing.examples.length < 3) {
        existing.examples.push(query);
      }
      patterns.set(pattern, existing);
    }

    return Array.from(patterns.entries())
      .map(([pattern, stats]) => ({
        pattern,
        count: stats.count,
        avgDuration: stats.totalDuration / stats.count,
        examples: stats.examples
      }))
      .sort((a, b) => b.avgDuration - a.avgDuration);
  }
}

// MySQL 慢查询示例
function createSlowQueryLogConnection(pool) {
  const detector = new SlowQueryDetector({ threshold: 100 });

  return {
    async query(sql, params) {
      const start = performance.now();
      const conn = await pool.getConnection();

      try {
        const [results] = await conn.execute(sql, params);
        return results;
      } finally {
        conn.release();
        detector.recordQuery(generateId(), sql, params, start, null);
      }
    },

    getStats: () => detector.getQueryStats(),
    getSlowQueries: () => detector.getSlowQueries(),
    analyzePatterns: () => detector.analyzePatterns()
  };
}

function generateId() {
  return `q-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export { SlowQueryDetector, createSlowQueryLogConnection };
```

### 4.4 第三方 API 超时排查

```javascript
// api-timeout-handler.js

/**
 * 带超时和重试的 HTTP 请求
 */
export async function fetchWithTimeout(url, options = {}) {
  const {
    timeout = 5000,
    retries = 2,
    retryDelay = 1000,
    onRetry,
    ...fetchOptions
  } = options;

  let lastError;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const startTime = performance.now();

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const duration = performance.now() - startTime;

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return {
        response,
        duration,
        attempts: attempt + 1
      };
    } catch (error) {
      clearTimeout(timeoutId);
      lastError = error;

      const duration = performance.now() - startTime;

      if (error.name === 'AbortError') {
        console.error(`[超时] ${url} (${timeout}ms)`);
      } else {
        console.error(`[请求失败] ${url}: ${error.message} (${duration.toFixed(0)}ms)`);
      }

      if (attempt < retries) {
        const delay = retryDelay * Math.pow(2, attempt);  // 指数退避
        console.log(`[重试] ${url}，等待 ${delay}ms 后第 ${attempt + 2} 次尝试...`);

        if (onRetry) {
          onRetry({ attempt: attempt + 1, error, delay });
        }

        await new Promise(r => setTimeout(r, delay));
      }
    }
  }

  throw lastError;
}

/**
 * 断路器模式
 */
class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 30000;
    this.halfOpenMaxCalls = options.halfOpenMaxCalls || 3;

    this.state = 'CLOSED';  // CLOSED, OPEN, HALF_OPEN
    this.failures = 0;
    this.lastFailureTime = null;
    this.halfOpenCalls = 0;
  }

  async execute(fn) {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.resetTimeout) {
        this.state = 'HALF_OPEN';
        this.halfOpenCalls = 0;
        console.log('断路器进入半开状态');
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    if (this.state === 'HALF_OPEN' && this.halfOpenCalls >= this.halfOpenMaxCalls) {
      throw new Error('Circuit breaker half-open call limit reached');
    }

    if (this.state === 'HALF_OPEN') {
      this.halfOpenCalls++;
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    this.failures = 0;
    if (this.state === 'HALF_OPEN') {
      this.state = 'CLOSED';
      this.halfOpenCalls = 0;
      console.log('断路器关闭，服务恢复');
    }
  }

  onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN';
      console.error(`断路器打开，${this.resetTimeout}ms 内拒绝请求`);
    }
  }

  getState() {
    return {
      state: this.state,
      failures: this.failures,
      lastFailure: this.lastFailureTime
    };
  }
}

/**
 * 连接池健康检查
 */
class ConnectionPoolHealth {
  constructor(pool, options = {}) {
    this.pool = pool;
    this.checkInterval = options.checkInterval || 30000;
    this.timeout = options.timeout || 5000;
    this.unhealthyThreshold = options.unhealthyThreshold || 3;
    this.consecutiveFailures = 0;
  }

  start() {
    this.timer = setInterval(() => this.check(), this.checkInterval);
  }

  async check() {
    const start = performance.now();

    try {
      // 执行简单查询测试连接
      await Promise.race([
        this.pool.query('SELECT 1'),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Health check timeout')), this.timeout)
        )
      ]);

      const duration = performance.now() - start;
      this.consecutiveFailures = 0;

      console.log(`连接池健康检查通过 (${duration.toFixed(1)}ms)`);
    } catch (error) {
      this.consecutiveFailures++;
      console.error(`连接池健康检查失败 (#${this.consecutiveFailures}): ${error.message}`);

      if (this.consecutiveFailures >= this.unhealthyThreshold) {
        console.error('连接池持续不健康，需要人工介入');
        // 可以触发告警
      }
    }
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }
}

export { CircuitBreaker, ConnectionPoolHealth, fetchWithTimeout };
```

---

## 5. 连接问题排查

### 5.1 文件描述符耗尽

```javascript
// fd-monitor.js
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * 文件描述符监控
 */
class FDMonitor {
  constructor(options = {}) {
    this.threshold = options.threshold || 0.8;  // 80%
    this.interval = options.interval || 30000;
  }

  async getFDInfo() {
    try {
      // 获取当前进程的 FD 数量
      const { stdout: fdCount } = await execAsync(
        `ls -1 /proc/${process.pid}/fd 2>/dev/null | wc -l`
      );

      // 获取系统限制
      const { stdout: limits } = await execAsync(
        `cat /proc/${process.pid}/limits | grep 'Max open files'`
      );

      // 解析限制值
      const match = limits.match(/(\d+)\s+(\d+|unlimited)/);
      const softLimit = match ? parseInt(match[1]) : null;
      const hardLimit = match && match[2] !== 'unlimited' ? parseInt(match[2]) : null;

      // 获取 FD 详情
      const { stdout: fdDetails } = await execAsync(
        `ls -l /proc/${process.pid}/fd 2>/dev/null | awk '{print $NF}' | sort | uniq -c | sort -rn | head -20`
      );

      return {
        used: parseInt(fdCount.trim()),
        softLimit,
        hardLimit,
        usage: softLimit ? parseInt(fdCount.trim()) / softLimit : null,
        details: fdDetails.trim()
      };
    } catch (error) {
      console.error('获取 FD 信息失败:', error.message);
      return null;
    }
  }

  async start() {
    this.timer = setInterval(async () => {
      const info = await this.getFDInfo();
      if (!info) return;

      console.log('文件描述符使用:', {
        used: info.used,
        softLimit: info.softLimit,
        usage: info.usage ? `${(info.usage * 100).toFixed(1)}%` : 'unknown'
      });

      if (info.usage && info.usage > this.threshold) {
        console.error(`[警告] 文件描述符使用率 ${(info.usage * 100).toFixed(1)}% 超过阈值`);
        console.error('FD 详情:\n', info.details);
      }
    }, this.interval);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }
}

/**
 * 连接追踪器
 */
class ConnectionTracker {
  constructor() {
    this.connections = new Map();
  }

  add(id, type, info = {}) {
    this.connections.set(id, {
      type,
      createdAt: Date.now(),
      ...info
    });
  }

  remove(id) {
    this.connections.delete(id);
  }

  getActive() {
    return Array.from(this.connections.entries()).map(([id, info]) => ({
      id,
      ...info,
      age: Date.now() - info.createdAt
    }));
  }

  getByType(type) {
    return this.getActive().filter(c => c.type === type);
  }

  getLeaked(thresholdMs = 300000) {  // 5分钟
    return this.getActive().filter(c => c.age > thresholdMs);
  }
}

export { FDMonitor, ConnectionTracker };
```

### 5.2 TCP 连接状态分析

```javascript
// tcp-connection-analyzer.js
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * TCP 连接状态分析
 */
export async function analyzeTCPConnections(port) {
  try {
    // 获取连接状态统计
    const { stdout } = await execAsync(
      `ss -tan | awk 'NR>1 {print $1}' | sort | uniq -c | sort -rn`
    );

    console.log('TCP 连接状态分布:');
    console.log(stdout);

    // 获取指定端口的连接详情
    if (port) {
      const { stdout: portDetails } = await execAsync(
        `ss -tan state established dport = :${port} or sport = :${port} | head -20`
      );
      console.log(`\n端口 ${port} 的连接详情:`);
      console.log(portDetails);
    }

    // TIME_WAIT 状态连接数（过多会影响新连接建立）
    const { stdout: timeWaitCount } = await execAsync(
      `ss -tan state time-wait | wc -l`
    );
    console.log(`TIME_WAIT 连接数: ${timeWaitCount.trim()}`);

    // CLOSE_WAIT 状态（表示被动关闭方未正确关闭）
    const { stdout: closeWaitCount } = await execAsync(
      `ss -tan state close-wait | wc -l`
    );
    const closeWait = parseInt(closeWaitCount.trim());
    if (closeWait > 0) {
      console.error(`[警告] CLOSE_WAIT 连接数: ${closeWait}，可能存在连接泄漏`);
    }

  } catch (error) {
    console.error('分析 TCP 连接失败:', error.message);
  }
}

/**
 * 连接池配置建议
 */
export const connectionPoolConfig = {
  // 数据库连接池
  database: {
    min: 2,
    max: 20,
    // 连接空闲超时
    idleTimeoutMillis: 30000,
    // 连接最大存活时间
    maxLifetime: 600000,
    // 连接获取超时
    connectionTimeoutMillis: 5000,
    // 连接测试查询
    testOnBorrow: true,
    validationTimeout: 3000
  },

  // HTTP Agent
  http: {
    keepAlive: true,
    keepAliveMsecs: 30000,
    maxSockets: 50,        // 每个主机的最大连接数
    maxFreeSockets: 10,    // 空闲连接数
    timeout: 30000,
    freeSocketTimeout: 15000  // 空闲连接超时
  },

  // Redis
  redis: {
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    enableOfflineQueue: false  // 离线时不排队
  }
};
```

### 5.3 DNS 解析延迟问题

```javascript
// dns-optimization.js
import dns from 'dns';
import { promisify } from 'util';

const dnsLookup = promisify(dns.lookup);

/**
 * DNS 缓存
 */
class DNSCache {
  constructor(options = {}) {
    this.cache = new Map();
    this.ttl = options.ttl || 300000;  // 默认5分钟
    this.cleanupInterval = options.cleanupInterval || 60000;

    // 定期清理过期缓存
    setInterval(() => this.cleanup(), this.cleanupInterval);
  }

  async lookup(hostname, options = {}) {
    const key = `${hostname}:${options.family || 'any'}`;
    const cached = this.cache.get(key);

    if (cached && Date.now() < cached.expires) {
      return cached.result;
    }

    const start = performance.now();
    const result = await dnsLookup(hostname, options);
    const duration = performance.now() - start;

    if (duration > 50) {
      console.warn(`[DNS慢查询] ${hostname}: ${duration.toFixed(1)}ms`);
    }

    this.cache.set(key, {
      result,
      expires: Date.now() + this.ttl,
      queriedAt: Date.now()
    });

    return result;
  }

  cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.cache) {
      if (now > entry.expires) {
        this.cache.delete(key);
      }
    }
  }

  clear() {
    this.cache.clear();
  }
}

/**
 * 使用 Node.js 内置 DNS 缓存（Node.js 24+）
 */
export function setupDNSCache() {
  // 设置 DNS 查询超时
  dns.setDefaultResultOrder('ipv4first');  // 优先 IPv4

  // 使用系统级缓存
  return new DNSCache();
}

/**
 * 预解析关键域名
 */
export async function prefetchDNS(hostnames) {
  await Promise.all(
    hostnames.map(async (hostname) => {
      try {
        await dnsLookup(hostname);
        console.log(`DNS 预解析完成: ${hostname}`);
      } catch (error) {
        console.error(`DNS 预解析失败: ${hostname}`, error.message);
      }
    })
  );
}

export { DNSCache };
```

### 5.4 Keep-Alive 与连接池配置

```javascript
// connection-pool-config.js
import http from 'http';
import https from 'https';
import { Agent } from 'http';

/**
 * 生产环境推荐的 HTTP Agent 配置
 */
export function createHTTPAgent(options = {}) {
  return new http.Agent({
    keepAlive: true,
    keepAliveMsecs: 30000,
    maxSockets: options.maxSockets || 50,
    maxFreeSockets: options.maxFreeSockets || 10,
    timeout: options.timeout || 30000,
    freeSocketTimeout: options.freeSocketTimeout || 15000,
    scheduling: 'lifo'  // 后进先出，复用最近使用的连接
  });
}

export function createHTTPSAgent(options = {}) {
  return new https.Agent({
    keepAlive: true,
    keepAliveMsecs: 30000,
    maxSockets: options.maxSockets || 50,
    maxFreeSockets: options.maxFreeSockets || 10,
    timeout: options.timeout || 30000,
    freeSocketTimeout: options.freeSocketTimeout || 15000,
    scheduling: 'lifo'
  });
}

/**
 * 全局 Agent 管理
 */
class AgentManager {
  constructor() {
    this.agents = new Map();
  }

  getAgent(baseURL, options = {}) {
    const key = new URL(baseURL).origin;

    if (!this.agents.has(key)) {
      const isHTTPS = baseURL.startsWith('https');
      const agent = isHTTPS
        ? createHTTPSAgent(options)
        : createHTTPAgent(options);

      this.agents.set(key, agent);
    }

    return this.agents.get(key);
  }

  getStats() {
    const stats = {};
    for (const [key, agent] of this.agents) {
      stats[key] = {
        totalSockets: Object.keys(agent.sockets).reduce((sum, k) => sum + agent.sockets[k].length, 0),
        freeSockets: Object.keys(agent.freeSockets).reduce((sum, k) => sum + agent.freeSockets[k].length, 0),
        pendingRequests: Object.keys(agent.requests).reduce((sum, k) => sum + agent.requests[k].length, 0)
      };
    }
    return stats;
  }

  destroyAll() {
    for (const [key, agent] of this.agents) {
      agent.destroy();
    }
    this.agents.clear();
  }
}

export const agentManager = new AgentManager();

/**
 * 使用 fetch 时复用连接
 */
export async function fetchWithPool(url, options = {}) {
  const agent = agentManager.getAgent(url, options.agentOptions);

  return fetch(url, {
    ...options,
    agent  // Node.js 18+ fetch 支持 agent 选项
  });
}
```

---

## 6. 日志与监控

### 6.1 关键指标采集

```javascript
// metrics-collector.js
import { getHeapStatistics } from 'v8';
import { monitorEventLoopDelay } from 'perf_hooks';
import os from 'os';

/**
 * 关键指标采集器
 */
class MetricsCollector {
  constructor(options = {}) {
    this.interval = options.interval || 15000;
    this.eventLoopHistogram = monitorEventLoopDelay({ resolution: 10 });
    this.gcStats = { total: 0, totalTime: 0 };
  }

  start() {
    this.eventLoopHistogram.enable();

    // 监听 GC 事件
    if (global.gc) {
      // 需要 --trace-gc 或 --expose-gc 标志
    }

    this.timer = setInterval(() => this.collect(), this.interval);
  }

  collect() {
    const memUsage = process.memoryUsage();
    const heapStats = getHeapStatistics();
    const cpuUsage = process.cpuUsage();
    const loadAvg = os.loadavg();

    const metrics = {
      timestamp: Date.now(),

      // 内存指标
      memory: {
        rss: memUsage.rss,
        heapTotal: memUsage.heapTotal,
        heapUsed: memUsage.heapUsed,
        external: memUsage.external,
        arrayBuffers: memUsage.arrayBuffers,
        heapUsedRatio: memUsage.heapUsed / heapStats.heap_size_limit,
        heapSizeLimit: heapStats.heap_size_limit
      },

      // CPU 指标
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system,
        loadAvg1: loadAvg[0],
        loadAvg5: loadAvg[1],
        loadAvg15: loadAvg[2]
      },

      // 事件循环延迟
      eventLoop: {
        min: this.eventLoopHistogram.min / 1e6,
        max: this.eventLoopHistogram.max / 1e6,
        mean: this.eventLoopHistogram.mean / 1e6,
        p90: this.eventLoopHistogram.percentile(90) / 1e6,
        p99: this.eventLoopHistogram.percentile(99) / 1e6
      },

      // 进程信息
      process: {
        uptime: process.uptime(),
        pid: process.pid,
        activeHandles: process._getActiveHandles?.().length,
        activeRequests: process._getActiveRequests?.().length
      }
    };

    // 重置直方图
    this.eventLoopHistogram.reset();

    return metrics;
  }

  getSnapshot() {
    return this.collect();
  }

  stop() {
    this.eventLoopHistogram.disable();
    if (this.timer) {
      clearInterval(this.timer);
    }
  }
}

export { MetricsCollector };
```

### 6.2 使用 prom-client 暴露 Prometheus 指标

```javascript
// prometheus-metrics.js
import client from 'prom-client';
import { monitorEventLoopDelay } from 'perf_hooks';

// 创建 Registry
const register = new client.Registry();

// 默认指标（GC、内存、事件循环等）
client.collectDefaultMetrics({
  register,
  prefix: 'nodejs_',
  gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5]
});

// 自定义指标
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP 请求处理时间',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10]
});

const httpRequestTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'HTTP 请求总数',
  labelNames: ['method', 'route', 'status_code']
});

const activeConnections = new client.Gauge({
  name: 'http_active_connections',
  help: '当前活跃连接数'
});

const dbQueryDuration = new client.Histogram({
  name: 'db_query_duration_seconds',
  help: '数据库查询时间',
  labelNames: ['operation', 'table'],
  buckets: [0.001, 0.005, 0.015, 0.05, 0.1, 0.5, 1, 5]
});

const cacheHits = new client.Counter({
  name: 'cache_hits_total',
  help: '缓存命中次数',
  labelNames: ['cache_type']
});

const cacheMisses = new client.Counter({
  name: 'cache_misses_total',
  help: '缓存未命中次数',
  labelNames: ['cache_type']
});

// 注册自定义指标
register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestTotal);
register.registerMetric(activeConnections);
register.registerMetric(dbQueryDuration);
register.registerMetric(cacheHits);
register.registerMetric(cacheMisses);

/**
 * Express 中间件：自动记录 HTTP 指标
 */
export function prometheusMiddleware(req, res, next) {
  const start = process.hrtime.bigint();

  res.on('finish', () => {
    const duration = Number(process.hrtime.bigint() - start) / 1e9;
    const route = req.route?.path || req.path || 'unknown';
    const status = res.statusCode;

    httpRequestDuration
      .labels(req.method, route, status)
      .observe(duration);

    httpRequestTotal
      .labels(req.method, route, status)
      .inc();
  });

  next();
}

/**
 * 指标端点
 */
export async function metricsEndpoint(req, res) {
  res.setHeader('Content-Type', register.contentType);
  res.end(await register.metrics());
}

/**
 * 追踪数据库查询
 */
export function traceDBQuery(operation, table, fn) {
  const end = dbQueryDuration.startTimer({ operation, table });
  return fn().finally(end);
}

/**
 * 追踪缓存
 */
export function recordCacheHit(type) {
  cacheHits.labels(type).inc();
}

export function recordCacheMiss(type) {
  cacheMisses.labels(type).inc();
}

export { register, activeConnections };
```

### 6.3 健康检查端点设计

```javascript
// health-checks.js

/**
 * 健康检查系统
 */
class HealthChecker {
  constructor() {
    this.checks = new Map();
  }

  register(name, checkFn, options = {}) {
    this.checks.set(name, {
      fn: checkFn,
      critical: options.critical || false,  // 关键检查失败会导致整体不健康
      timeout: options.timeout || 5000
    });
  }

  async runCheck(name, check) {
    const start = Date.now();

    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Health check timeout')), check.timeout);
      });

      const result = await Promise.race([check.fn(), timeoutPromise]);

      return {
        name,
        status: result?.status || 'healthy',
        responseTime: Date.now() - start,
        ...result
      };
    } catch (error) {
      return {
        name,
        status: 'unhealthy',
        error: error.message,
        responseTime: Date.now() - start,
        critical: check.critical
      };
    }
  }

  async runAll() {
    const results = await Promise.all(
      Array.from(this.checks.entries()).map(([name, check]) =>
        this.runCheck(name, check)
      )
    );

    const unhealthy = results.filter(r => r.status === 'unhealthy');
    const criticalUnhealthy = unhealthy.filter(r => r.critical);

    return {
      status: criticalUnhealthy.length > 0 ? 'unhealthy'
        : unhealthy.length > 0 ? 'degraded'
        : 'healthy',
      checks: results,
      timestamp: new Date().toISOString()
    };
  }
}

const healthChecker = new HealthChecker();

// 注册检查项

// /live - 存活检查（进程是否还在运行）
healthChecker.register('liveness', async () => {
  return { status: 'healthy' };
}, { critical: false });

// /ready - 就绪检查（是否可以接收流量）
healthChecker.register('readiness', async () => {
  // 检查数据库连接
  // 检查缓存连接
  // 检查关键依赖
  const checks = await Promise.all([
    checkDatabase(),
    checkCache(),
    checkExternalAPI()
  ]);

  const failed = checks.filter(c => !c.ok);
  if (failed.length > 0) {
    return {
      status: 'unhealthy',
      details: failed
    };
  }

  return { status: 'healthy' };
}, { critical: true });

// /health - 完整健康检查
healthChecker.register('deep', async () => {
  const memoryUsage = process.memoryUsage();
  const heapRatio = memoryUsage.heapUsed / memoryUsage.heapTotal;

  if (heapRatio > 0.95) {
    return {
      status: 'unhealthy',
      reason: 'Memory pressure',
      heapRatio
    };
  }

  return {
    status: 'healthy',
    memory: {
      rss: `${(memoryUsage.rss / 1024 / 1024).toFixed(1)}MB`,
      heapUsed: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(1)}MB`
    }
  };
}, { critical: false });

// 模拟检查函数
async function checkDatabase() {
  // 实际实现中执行简单查询
  return { ok: true, service: 'database' };
}

async function checkCache() {
  return { ok: true, service: 'cache' };
}

async function checkExternalAPI() {
  return { ok: true, service: 'external-api' };
}

/**
 * Express 路由
 */
export function setupHealthRoutes(app) {
  // Kubernetes liveness probe
  app.get('/live', async (req, res) => {
    const result = await healthChecker.runCheck('liveness', healthChecker.checks.get('liveness'));
    const statusCode = result.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(result);
  });

  // Kubernetes readiness probe
  app.get('/ready', async (req, res) => {
    const result = await healthChecker.runCheck('readiness', healthChecker.checks.get('readiness'));
    const statusCode = result.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(result);
  });

  // 完整健康检查
  app.get('/health', async (req, res) => {
    const result = await healthChecker.runAll();
    const statusCode = result.status === 'healthy' ? 200
      : result.status === 'degraded' ? 200  // degraded 仍返回 200，但标记状态
      : 503;
    res.status(statusCode).json(result);
  });
}

export { healthChecker };
```

### 6.4 错误聚合（Sentry 集成）

```javascript
// sentry-integration.js
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

/**
 * 初始化 Sentry
 */
export function initSentry(options = {}) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    release: process.env.APP_VERSION || 'unknown',

    // 采样率
    tracesSampleRate: options.tracesSampleRate || 0.1,
    profilesSampleRate: options.profilesSampleRate || 0.01,

    // 集成
    integrations: [
      nodeProfilingIntegration(),
      Sentry.httpIntegration(),
      Sentry.expressIntegration(),
      Sentry.prismaIntegration()
    ],

    // 错误过滤
    beforeSend(event, hint) {
      const error = hint.originalException;

      // 忽略特定错误
      if (error?.code === 'ECONNRESET') {
        return null;
      }

      // 忽略特定路径的错误
      if (event.request?.url?.includes('/health')) {
        return null;
      }

      // 添加额外上下文
      event.extra = {
        ...event.extra,
        nodeVersion: process.version,
        uptime: process.uptime()
      };

      return event;
    },

    // 本地变量捕获
    includeLocalVariables: true
  });

  return Sentry;
}

/**
 * Express 错误处理中间件
 */
export function sentryErrorHandler() {
  return Sentry.Handlers.errorHandler({
    shouldHandleError(error) {
      // 只处理 500+ 错误
      if (error.statusCode >= 500) return true;
      if (error.status >= 500) return true;
      return true;  // 默认处理所有错误
    }
  });
}

/**
 * 手动捕获异常
 */
export function captureException(error, context = {}) {
  Sentry.withScope((scope) => {
    if (context.tags) {
      Object.entries(context.tags).forEach(([key, value]) => {
        scope.setTag(key, value);
      });
    }

    if (context.extra) {
      Object.entries(context.extra).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
    }

    if (context.user) {
      scope.setUser(context.user);
    }

    Sentry.captureException(error);
  });
}

/**
 * 性能监控
 */
export function startTransaction(name, op) {
  return Sentry.startTransaction({ name, op });
}

export function traceFunction(name, fn) {
  const transaction = startTransaction(name, 'function');
  Sentry.getCurrentHub().configureScope((scope) => {
    scope.setSpan(transaction);
  });

  try {
    const result = fn();
    if (result instanceof Promise) {
      return result.finally(() => transaction.finish());
    }
    transaction.finish();
    return result;
  } catch (error) {
    transaction.setStatus('internal_error');
    transaction.finish();
    throw error;
  }
}
```

---

## 7. 容器化环境特有问题

### 7.1 Docker 中内存限制与 OOM

```dockerfile
# Dockerfile
FROM node:24-alpine

WORKDIR /app

# 设置内存限制（根据容器限制调整）
ENV NODE_OPTIONS="--max-old-space-size=384"
ENV NODE_ENV=production

# 复制依赖和代码
COPY package*.json ./
RUN npm ci --only=production

COPY . .

# 使用非 root 用户
USER node

EXPOSE 3000

# 使用 dumb-init 处理信号
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '1.0'
        reservations:
          memory: 256M
          cpus: '0.5'
    environment:
      # 根据容器内存限制设置
      # 容器限制 512MB，设置堆内存为 384MB（留余量给 RSS 和 External）
      - NODE_OPTIONS=--max-old-space-size=384
      - UV_THREADPOOL_SIZE=16
    ulimits:
      nofile:
        soft: 65536
        hard: 65536
```

```javascript
// container-memory-awareness.js
import { getHeapStatistics } from 'v8';

/**
 * 容器环境内存感知
 */
export function setupContainerMemoryAwareness() {
  // 读取 cgroup 内存限制
  const cgroupLimit = readCgroupMemoryLimit();
  const systemMemory = os.totalmem();

  const effectiveLimit = cgroupLimit && cgroupLimit < systemMemory
    ? cgroupLimit
    : systemMemory;

  console.log('内存限制:', {
    cgroup: cgroupLimit ? `${(cgroupLimit / 1024 / 1024).toFixed(0)}MB` : 'unlimited',
    system: `${(systemMemory / 1024 / 1024).toFixed(0)}MB`,
    effective: `${(effectiveLimit / 1024 / 1024).toFixed(0)}MB`
  });

  // 监控内存使用
  setInterval(() => {
    const memUsage = process.memoryUsage();
    const ratio = memUsage.rss / effectiveLimit;

    if (ratio > 0.9) {
      console.error(`[严重] RSS 内存使用率 ${(ratio * 100).toFixed(1)}%，接近 OOM`);
      // 可以触发优雅退出，让容器重启
    } else if (ratio > 0.75) {
      console.warn(`[警告] RSS 内存使用率 ${(ratio * 100).toFixed(1)}%`);
    }
  }, 30000);
}

function readCgroupMemoryLimit() {
  try {
    // cgroup v1
    const v1 = readFileSync('/sys/fs/cgroup/memory/memory.limit_in_bytes', 'utf8');
    const limit = parseInt(v1.trim());
    if (limit < Number.MAX_SAFE_INTEGER) return limit;
  } catch (e) {
    // cgroup v2
    try {
      const v2 = readFileSync('/sys/fs/cgroup/memory.max', 'utf8');
      const limit = parseInt(v2.trim());
      if (limit < Number.MAX_SAFE_INTEGER) return limit;
    } catch (e2) {
      // 非容器环境
    }
  }
  return null;
}

import { readFileSync } from 'fs';
import os from 'os';
```

### 7.2 CPU 限制下的线程池问题

```javascript
// threadpool-config.js

/**
 * 根据容器 CPU 限制调整线程池
 */
export function configureThreadPool() {
  // 读取 cgroup CPU 配额
  const cpuQuota = readCPUQuota();
  const cpuCount = os.cpus().length;

  let effectiveCPUs;
  if (cpuQuota) {
    effectiveCPUs = Math.ceil(cpuQuota);
    console.log(`容器 CPU 限制: ${effectiveCPUs} 核`);
  } else {
    effectiveCPUs = cpuCount;
  }

  // UV_THREADPOOL_SIZE 默认是 4，建议设置为 CPU 核数的 2-4 倍
  // 但不要超过 128
  const threadPoolSize = Math.min(
    Math.max(effectiveCPUs * 2, 4),
    128
  );

  // 注意：UV_THREADPOOL_SIZE 必须在进程启动时设置
  // 运行时修改无效
  console.log(`建议 UV_THREADPOOL_SIZE: ${threadPoolSize}`);

  return {
    effectiveCPUs,
    recommendedThreadPoolSize: threadPoolSize,
    currentThreadPoolSize: process.env.UV_THREADPOOL_SIZE || 4
  };
}

function readCPUQuota() {
  try {
    // cgroup v1
    const quota = readFileSync('/sys/fs/cgroup/cpu/cpu.cfs_quota_us', 'utf8');
    const period = readFileSync('/sys/fs/cgroup/cpu/cpu.cfs_period_us', 'utf8');
    const q = parseInt(quota.trim());
    const p = parseInt(period.trim());

    if (q > 0) return q / p;
  } catch (e) {
    // cgroup v2
    try {
      const max = readFileSync('/sys/fs/cgroup/cpu.max', 'utf8');
      const [quota, period] = max.trim().split(' ');
      if (quota !== 'max') {
        return parseInt(quota) / parseInt(period);
      }
    } catch (e2) {}
  }
  return null;
}

/**
 * 工作线程池（Worker Threads）
 */
import { Worker, isMainThread, parentPort, workerData } from 'worker_threads';
import { readFileSync } from 'fs';
import os from 'os';

export class WorkerPool {
  constructor(workerScript, poolSize = os.cpus().length) {
    this.workerScript = workerScript;
    this.poolSize = poolSize;
    this.workers = [];
    this.queue = [];
    this.activeWorkers = new Set();

    this.initialize();
  }

  initialize() {
    for (let i = 0; i < this.poolSize; i++) {
      const worker = new Worker(this.workerScript);

      worker.on('message', (result) => {
        if (worker.currentResolve) {
          worker.currentResolve(result);
          worker.currentResolve = null;
          worker.currentReject = null;
          this.activeWorkers.delete(worker);
          this.processQueue();
        }
      });

      worker.on('error', (error) => {
        if (worker.currentReject) {
          worker.currentReject(error);
          worker.currentResolve = null;
          worker.currentReject = null;
          this.activeWorkers.delete(worker);
        }
      });

      this.workers.push(worker);
    }
  }

  async execute(data) {
    return new Promise((resolve, reject) => {
      this.queue.push({ data, resolve, reject });
      this.processQueue();
    });
  }

  processQueue() {
    if (this.queue.length === 0) return;

    const availableWorker = this.workers.find(w => !this.activeWorkers.has(w));
    if (!availableWorker) return;

    const task = this.queue.shift();
    this.activeWorkers.add(availableWorker);
    availableWorker.currentResolve = task.resolve;
    availableWorker.currentReject = task.reject;
    availableWorker.postMessage(task.data);

    // 继续处理队列
    this.processQueue();
  }

  terminate() {
    return Promise.all(this.workers.map(w => w.terminate()));
  }
}
```

### 7.3 优雅关闭与 Docker/K8s 信号处理

```javascript
// container-shutdown.js

/**
 * 容器环境信号处理
 */
export function setupContainerShutdown(options = {}) {
  const { onShutdown, timeout = 30000 } = options;

  let shuttingDown = false;

  // Docker/K8s 发送的信号
  const shutdownSignals = ['SIGTERM', 'SIGINT'];

  for (const signal of shutdownSignals) {
    process.on(signal, async () => {
      if (shuttingDown) {
        console.log('已经在关闭中，强制退出...');
        process.exit(1);
      }

      shuttingDown = true;
      console.log(`收到 ${signal} 信号，开始优雅关闭...`);

      // 设置超时
      const timer = setTimeout(() => {
        console.error('优雅关闭超时，强制退出');
        process.exit(1);
      }, timeout);

      try {
        if (onShutdown) {
          await onShutdown();
        }
        clearTimeout(timer);
        console.log('优雅关闭完成');
        process.exit(0);
      } catch (error) {
        console.error('优雅关闭出错:', error);
        clearTimeout(timer);
        process.exit(1);
      }
    });
  }

  // 处理 Docker stop 的 SIGKILL（无法优雅处理，但可以做记录）
  process.on('exit', (code) => {
    console.log(`进程退出，代码: ${code}`);
  });

  // 忽略 SIGUSR1/SIGUSR2（保留用于调试）
  process.on('SIGUSR1', () => {
    console.log('收到 SIGUSR1，用于调试');
  });
}

/**
 * Kubernetes PreStop Hook 处理
 */
export function setupPreStopHook(server, options = {}) {
  const { drainTimeout = 10000 } = options;

  // K8s 在发送 SIGTERM 之前会先执行 preStop
  // 可以利用这段时间从 Service 的 endpoints 中移除

  return async function preStopHandler(req, res) {
    console.log('收到 PreStop 请求，开始排空连接...');

    // 1. 标记不再接收新请求
    global.isShuttingDown = true;

    // 2. 等待现有请求完成
    await new Promise(r => setTimeout(r, drainTimeout));

    // 3. 关闭服务器
    if (server) {
      server.close(() => {
        console.log('服务器已关闭');
      });
    }

    res.status(200).json({ status: 'draining' });
  };
}

/**
 * 就绪状态检查（配合 K8s）
 */
export function createReadinessHandler() {
  let isReady = true;

  return {
    handler: (req, res) => {
      if (global.isShuttingDown || !isReady) {
        res.status(503).json({ status: 'not ready' });
        return;
      }
      res.status(200).json({ status: 'ready' });
    },

    setReady: (ready) => {
      isReady = ready;
    }
  };
}
```

### 7.4 PID 1 问题与 dumb-init/tini

```dockerfile
# 使用 tini 作为 init 进程
FROM node:24-alpine

# 安装 tini
RUN apk add --no-cache tini

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .

# tini 作为 ENTRYPOINT，正确处理信号和僵尸进程
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "server.js"]
```

```dockerfile
# 或使用 dumb-init
FROM node:24-slim

RUN apt-get update && apt-get install -y dumb-init && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
```

```javascript
// pid1-handler.js

/**
 * 处理 PID 1 特有问题
 */
export function setupPid1Handling() {
  // 如果我们是 PID 1，需要特殊处理
  if (process.pid !== 1) return;

  console.log('Running as PID 1, setting up signal handling');

  // PID 1 默认不会处理未捕获的信号
  // 需要显式处理

  process.on('SIGTERM', () => {
    console.log('PID 1: 收到 SIGTERM');
    process.exit(0);
  });

  process.on('SIGINT', () => {
    console.log('PID 1: 收到 SIGINT');
    process.exit(0);
  });

  // 处理僵尸进程（如果没有使用 tini/dumb-init）
  // 注意：Node.js 本身不处理僵尸进程，建议使用 tini
}
```

---

## 8. 实战案例集

### 案例1：线上服务内存持续增长导致 OOM

**现象描述：**

- 服务运行 2-3 天后被 K8s OOMKilled
- 重启后内存从 200MB 缓慢增长到 512MB（容器限制）
- 没有明显的错误日志

**排查步骤：**

```bash
# 1. 查看 Pod 事件
kubectl describe pod <pod-name>
# 看到：Last State: Terminated, Reason: OOMKilled

# 2. 查看内存使用趋势
kubectl top pod <pod-name> --containers

# 3. 进入容器查看 Node.js 内存
kubectl exec -it <pod-name> -- /bin/sh
node -e "console.log(process.memoryUsage())"
```

```javascript
// 在应用中集成内存监控和堆快照
import { writeHeapSnapshot, getHeapStatistics } from 'v8';
import { writeFileSync } from 'fs';

// 定期记录内存使用
setInterval(() => {
  const mem = process.memoryUsage();
  const heap = getHeapStatistics();

  const report = {
    timestamp: new Date().toISOString(),
    rss: `${(mem.rss / 1024 / 1024).toFixed(1)}MB`,
    heapUsed: `${(mem.heapUsed / 1024 / 1024).toFixed(1)}MB`,
    heapTotal: `${(mem.heapTotal / 1024 / 1024).toFixed(1)}MB`,
    external: `${(mem.external / 1024 / 1024).toFixed(1)}MB`,
    heapUsedRatio: (mem.heapUsed / heap.heap_size_limit).toFixed(2)
  };

  console.log('内存报告:', JSON.stringify(report));

  // 超过 80% 时生成堆快照
  if (mem.heapUsed / heap.heap_size_limit > 0.8) {
    const filename = writeHeapSnapshot(`/tmp/heap-${Date.now()}.heapsnapshot`);
    console.log('生成堆快照:', filename);
  }
}, 60000);
```

```bash
# 4. 下载堆快照分析
kubectl cp <pod-name>:/tmp/heap-xxx.heapsnapshot ./heap-xxx.heapsnapshot

# 5. 在 Chrome DevTools 中分析
# - 加载两个不同时间点的快照
# - 使用 Comparison 视图
# - 发现 (array) 类型持续增长
```

**根因分析：**

通过堆快照对比发现：
- `IncomingMessage` 对象持续增长
- 这些对象被 `EventEmitter` 的 `_events` 引用
- 追踪到是 HTTP 请求的 `data` 事件监听器未移除

```javascript
// 问题代码
app.post('/upload', (req, res) => {
  const chunks = [];

  // 泄漏：如果客户端断开连接，end 事件可能不触发
  // 但 data 事件监听器已经添加
  req.on('data', chunk => chunks.push(chunk));
  req.on('end', () => {
    // 处理上传...
    res.json({ success: true });
  });

  // 没有处理 error/close 事件来清理
});
```

**解决方案：**

```javascript
// 修复代码
import { pipeline } from 'stream/promises';
import { Writable } from 'stream';

app.post('/upload', async (req, res, next) => {
  try {
    const chunks = [];

    await pipeline(
      req,
      new Writable({
        write(chunk, encoding, callback) {
          chunks.push(chunk);
          callback();
        }
      })
    );

    const buffer = Buffer.concat(chunks);
    // 处理上传...

    res.json({ success: true });
  } catch (error) {
    if (error.code === 'ERR_STREAM_PREMATURE_CLOSE') {
      console.log('客户端断开连接');
      return;
    }
    next(error);
  }
});

// 或者使用更简洁的方式
app.post('/upload', async (req, res, next) => {
  try {
    const chunks = [];

    for await (const chunk of req) {
      chunks.push(chunk);
    }

    const buffer = Buffer.concat(chunks);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});
```

**预防措施：**

1. 使用 `pipeline` 或 `for await` 处理流
2. 设置请求超时
3. 监控活跃连接数
4. 定期生成堆快照进行对比
5. 使用 `max-old-space-size` 预留缓冲空间

---

### 案例2：接口偶发性 502/504 超时

**现象描述：**

- 接口大部分正常，但每天有 1-2% 的请求返回 502/504
- 502 来自 Nginx，504 来自负载均衡器
- 没有错误日志，请求似乎 "消失" 了

**排查步骤：**

```bash
# 1. 查看 Nginx 错误日志
tail -f /var/log/nginx/error.log
# upstream prematurely closed connection

# 2. 查看 Node.js 进程状态
ps aux | grep node
# 发现进程数量不稳定

# 3. 检查事件循环延迟
kubectl exec <pod-name> -- node -e "
const { monitorEventLoopDelay } = require('perf_hooks');
const h = monitorEventLoopDelay({ resolution: 10 });
h.enable();
setTimeout(() => {
  console.log('P99 delay:', h.percentile(99) / 1e6, 'ms');
  h.disable();
}, 30000);
"
```

```javascript
// 在应用中添加事件循环监控
import { monitorEventLoopDelay } from 'perf_hooks';

const histogram = monitorEventLoopDelay({ resolution: 10 });
histogram.enable();

setInterval(() => {
  const p99 = histogram.percentile(99) / 1e6;

  if (p99 > 1000) {
    console.error(`[严重] 事件循环 P99 延迟: ${p99.toFixed(2)}ms`);
    // 记录当前调用栈
    console.error(new Error('Event loop blocked').stack);
  }

  histogram.reset();
}, 30000);
```

```bash
# 4. 使用 SIGUSR1 录制 CPU Profile
kubectl exec <pod-name> -- kill -USR1 <node-pid>
# 等待 30 秒
kubectl exec <pod-name> -- kill -USR1 <node-pid>
# 下载 cpuprofile
kubectl cp <pod-name>:/app/*.cpuprofile ./
```

**根因分析：**

CPU Profile 分析发现：
- 大量时间花在 `JSON.parse` 上
- 某些请求的 payload 非常大（10MB+）
- 同步解析阻塞了事件循环
- 导致后续请求排队，最终超时

```javascript
// 问题代码
app.post('/api/batch', (req, res) => {
  // 同步解析大数据，阻塞事件循环
  const data = JSON.parse(req.body);  // 10MB JSON

  // 处理...
  for (const item of data.items) {
    processItem(item);  // 同步处理
  }

  res.json({ processed: data.items.length });
});
```

**解决方案：**

```javascript
import { JSONParser } from '@streamparser/json';  // 或使用 stream-json
import { setTimeout } from 'timers/promises';

// 1. 限制请求体大小
app.use(express.json({ limit: '1mb' }));

// 2. 流式处理大数据
app.post('/api/batch', async (req, res, next) => {
  try {
    const parser = new JSONParser();
    const items = [];
    let processed = 0;
    const batchSize = 100;

    parser.on('data', ({ key, value }) => {
      if (key === 'items') {
        items.push(value);

        // 每处理 100 条让出事件循环
        if (items.length >= batchSize) {
          processBatch(items.splice(0, batchSize));
          processed += batchSize;
        }
      }
    });

    parser.on('end', async () => {
      // 处理剩余
      if (items.length > 0) {
        await processBatch(items);
        processed += items.length;
      }

      res.json({ processed });
    });

    req.pipe(parser);
  } catch (error) {
    next(error);
  }
});

// 3. 分批处理，让出事件循环
async function processBatch(items) {
  for (let i = 0; i < items.length; i++) {
    processItem(items[i]);

    // 每 10 条让出一次
    if (i % 10 === 0) {
      await setTimeout(0);
    }
  }
}

// 4. 设置请求超时
app.use((req, res, next) => {
  req.setTimeout(30000, () => {
    res.status(504).json({ error: 'Request timeout' });
  });
  next();
});
```

**预防措施：**

1. 设置合理的请求体大小限制
2. 大数据使用流式处理
3. CPU 密集型操作分批让出事件循环
4. 配置请求超时
5. 使用 `server.timeout` 设置全局超时

---

### 案例3：CPU 突然飙升 100%

**现象描述：**

- 服务 CPU 使用率突然从 20% 飙升到 100%
- 持续数分钟后可能自动恢复
- 期间请求响应极慢或超时

**排查步骤：**

```bash
# 1. 找到 CPU 占用高的进程
 top -p $(pgrep -d',' node)

# 2. 生成 CPU Profile
kill -USR1 <node-pid>
# 等待 30 秒
kill -USR1 <node-pid>

# 3. 同时记录当前请求
# 在应用中添加快照接口
curl http://localhost:3000/admin/snapshot
```

```javascript
// 添加快照接口
app.get('/admin/snapshot', authenticate, (req, res) => {
  const snapshot = {
    timestamp: new Date().toISOString(),
    cpuUsage: process.cpuUsage(),
    memoryUsage: process.memoryUsage(),
    activeRequests: activeRequestCount,
    eventLoopLag: eventLoopHistogram.mean / 1e6,
    // 记录当前处理的请求
    requests: Array.from(activeRequests.values()).map(r => ({
      path: r.path,
      duration: Date.now() - r.startTime,
      stack: r.stack
    }))
  };

  res.json(snapshot);
});
```

**根因分析：**

CPU Profile 显示：
- 99% 的时间在正则表达式匹配
- 定位到用户输入验证逻辑
- 恶意用户发送了 ReDoS 攻击 payload

```javascript
// 问题代码
function validateInput(input) {
  // 危险：嵌套量词导致灾难性回溯
  const pattern = /^(\d+)*$/;
  return pattern.test(input);
}

// 攻击 payload: "1111111111111111111111111!"
// 正则引擎会尝试 2^n 种匹配方式
```

**解决方案：**

```javascript
// 1. 使用安全的正则
function validateInput(input) {
  // 安全：线性时间复杂度
  if (input.length > 100) return false;  // 长度限制
  return /^\d+$/.test(input);  // 简单正则
}

// 2. 使用 RE2 引擎
import RE2 from 're2';
const safePattern = new RE2('^\d+$');

// 3. 添加超时保护
function safeRegexTest(pattern, input, timeoutMs = 1000) {
  return new Promise((resolve, reject) => {
    const worker = new Worker('./regex-worker.js', {
      workerData: { pattern, input }
    });

    const timer = setTimeout(() => {
      worker.terminate();
      reject(new Error('Regex timeout'));
    }, timeoutMs);

    worker.on('message', resolve);
    worker.on('error', reject);
    worker.on('exit', () => clearTimeout(timer));
  });
}

// 4. 输入预验证
function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  if (input.length > 1000) return input.slice(0, 1000);
  return input;
}
```

**预防措施：**

1. 所有用户输入的正则都要审查
2. 使用 RE2 或类似的安全正则引擎
3. 设置正则执行超时
4. 限制输入长度
5. 使用 WAF 过滤恶意请求

---

### 案例4：请求响应时间 P99 升高

**现象描述：**

- 平均响应时间正常（~50ms）
- P99 从 200ms 缓慢增长到 2s+
- 不是突然发生，而是渐进式恶化

**排查步骤：**

```javascript
// 1. 添加详细的请求追踪
import { AsyncLocalStorage } from 'async_hooks';
import { performance } from 'perf_hooks';

const requestStore = new AsyncLocalStorage();

app.use((req, res, next) => {
  const context = {
    requestId: generateId(),
    startTime: performance.now(),
    spans: []
  };

  requestStore.run(context, () => {
    res.on('finish', () => {
      const duration = performance.now() - context.startTime;

      if (duration > 1000) {
        console.warn('慢请求:', {
          path: req.path,
          duration: `${duration.toFixed(2)}ms`,
          spans: context.spans
        });
      }
    });

    next();
  });
});

// 包装数据库查询
function tracedQuery(sql, params) {
  const context = requestStore.getStore();
  const span = { name: 'db.query', sql, start: performance.now() };

  return db.query(sql, params).finally(() => {
    span.duration = performance.now() - span.start;
    if (context) context.spans.push(span);
  });
}

// 包装 HTTP 调用
function tracedHttpCall(url, options) {
  const context = requestStore.getStore();
  const span = { name: 'http.call', url, start: performance.now() };

  return fetch(url, options).finally(() => {
    span.duration = performance.now() - span.start;
    if (context) context.spans.push(span);
  });
}
```

```bash
# 2. 分析慢请求日志
# 发现慢请求的 spans 中 db.query 占 90%+

# 3. 检查数据库
# - 慢查询日志
# - 连接池状态
# - 锁等待

# 4. 检查事件循环延迟
# P99 升高但平均正常，通常是间歇性阻塞
```

**根因分析：**

慢请求追踪显示：
- 数据库查询偶尔耗时 1-2 秒（正常 < 10ms）
- 检查数据库发现连接池耗尽
- 某些查询持有连接但不释放
- 新请求排队等待连接

```javascript
// 问题代码
async function getData() {
  const conn = await pool.getConnection();

  try {
    const result = await conn.query('SELECT * FROM large_table');

    // 泄漏：如果处理过程中抛出异常，连接不会释放
    await processResult(result);  // 可能抛出异常

    return result;
  } catch (error) {
    // 没有释放连接！
    throw error;
  }
  // finally 块缺失
}
```

**解决方案：**

```javascript
// 修复：确保连接总是释放
async function getData() {
  const conn = await pool.getConnection();

  try {
    const result = await conn.query('SELECT * FROM large_table');
    await processResult(result);
    return result;
  } finally {
    conn.release();  // 总是释放
  }
}

// 更好的方式：使用连接池的自动管理
async function getData() {
  return pool.execute('SELECT * FROM large_table');
  // execute 自动获取和释放连接
}

// 或者使用 withConnection 模式
async function withConnection(fn) {
  const conn = await pool.getConnection();
  try {
    return await fn(conn);
  } finally {
    conn.release();
  }
}

// 监控连接池
setInterval(() => {
  console.log('连接池状态:', {
    total: pool.totalConnections?.(),
    free: pool.freeConnections?.(),
    queued: pool.connectionQueue?.length
  });
}, 30000);

// 设置连接超时
const pool = createPool({
  // ...
  acquireTimeout: 10000,    // 获取连接超时
  idleTimeout: 300000,      // 空闲连接超时
  maxLifetime: 600000       // 连接最大存活时间
});
```

**预防措施：**

1. 使用 `try...finally` 确保资源释放
2. 使用连接池的自动管理方法
3. 监控连接池状态
4. 设置连接获取超时
5. 使用 `AsyncLocalStorage` 追踪请求各阶段耗时
6. 定期审查代码中的资源获取/释放模式

---

## 附录：线上排查速查表

### 常用命令

```bash
# 进程信息
ps aux | grep node                    # 查看 Node.js 进程
top -p <pid>                         # 监控单个进程
strace -p <pid> -e trace=file       # 追踪系统调用

# 内存
node -e "console.log(process.memoryUsage())"
node --heapsnapshot-near-heap-limit=3 app.js

# CPU
node --cpu-prof app.js
kill -USR1 <pid>                      # 开始/停止 CPU Profile

# 网络
ss -tan | grep <port>                # 查看连接状态
netstat -anp | grep node              # 查看 Node.js 网络连接
lsof -p <pid>                         # 查看进程打开的文件

# 容器
kubectl top pod <pod>                 # 查看 Pod 资源使用
kubectl logs <pod> -f                 # 查看日志
kubectl exec -it <pod> -- /bin/sh    # 进入容器
kubectl describe pod <pod>            # 查看 Pod 事件
```

### 关键指标阈值

| 指标 | 警告阈值 | 严重阈值 |
|------|----------|----------|
| 堆内存使用率 | 70% | 90% |
| RSS / 容器限制 | 75% | 90% |
| 事件循环 P99 | 50ms | 100ms |
| CPU 使用率 | 70% | 90% |
| FD 使用率 | 70% | 90% |
| 请求 P99 延迟 | 500ms | 2000ms |
| 错误率 | 1% | 5% |
