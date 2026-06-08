# PM2 生产级 Node.js 进程管理实战

> PM2 是目前 Node.js 生态中最成熟的生产级进程管理器。本文基于 PM2 5.x 版本，从实战角度讲解如何在真实项目中用好 PM2。

## 目录

- [一、PM2 是什么](#一pm2-是什么)
- [二、安装与快速上手](#二安装与快速上手)
- [三、ecosystem.config.js 配置详解](#三ecosystemconfigjs-配置详解)
- [四、集群模式与负载均衡](#四集群模式与负载均衡)
- [五、环境变量管理](#五环境变量管理)
- [六、优雅退出](#六优雅退出)
- [七、日志管理](#七日志管理)
- [八、监控与诊断](#八监控与诊断)
- [九、系统启动与自动恢复](#九系统启动与自动恢复)
- [十、部署配置](#十部署配置)
- [十一、项目实战：完整配置案例](#十一项目实战完整配置案例)
- [十二、常用命令速查表](#十二常用命令速查表)

---

## 一、PM2 是什么

PM2（Process Manager 2）是一个专为 Node.js 设计的生产级进程管理器，核心能力包括：

| 能力 | 说明 |
|------|------|
| **进程守护** | 进程崩溃后自动重启，保证服务持续可用 |
| **负载均衡** | 内置 Cluster 模式，自动将请求分发到多个进程 |
| **零停机部署** | `reload` 命令实现滚动重启，不中断服务 |
| **日志管理** | 自动收集、切分、聚合应用日志 |
| **监控** | 提供内存、CPU、事件循环延迟等指标 |
| **部署工具** | 内置基于 Git 的远程部署能力 |

---

## 二、安装与快速上手

### 安装

```bash
# 全局安装
npm install pm2@latest -g

# 验证版本
pm2 --version

# 更新 PM2 守护进程（升级后必须执行）
pm2 update
```

### 最简启动

```bash
# 前台启动（开发调试）
pm2 start app.js

# 指定名称启动
pm2 start app.js --name api-server

# 集群模式启动（使用全部 CPU 核心）
pm2 start app.js -i max

# 启动后查看状态
pm2 list
pm2 ls
pm2 status
```

### 查看进程详情

```bash
# 查看单个进程详细信息
pm2 describe api-server

# 实时监控面板
pm2 monit

# 查看日志
pm2 logs
pm2 logs --lines 200
pm2 logs api-server
```

---

## 三、ecosystem.config.js 配置详解

生产环境推荐始终使用 `ecosystem.config.js`（或 `.json`）管理配置，而非命令行参数。

### 基础结构

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'api-server',
      script: './src/app.js',
    }
  ]
};
```

### 完整配置项（带注释）

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      // ===== 基础配置 =====

      // 进程名称，pm2 list 中显示的名称，也是操作进程时的标识
      name: 'api-server',

      // 入口脚本路径，支持相对路径（相对于 ecosystem.config.js 所在目录）
      script: './src/app.js',

      // 传递给脚本的命令行参数
      args: '--port 3000 --env production',

      // 工作目录，脚本执行时的 cwd
      cwd: '/var/www/api',

      // ===== 进程模式配置 =====

      // 执行模式：
      // - 'fork'（默认）：单进程模式，适合不需要多核、或有状态的服务
      // - 'cluster'：集群模式，PM2 内置负载均衡，适合无状态的 HTTP 服务
      exec_mode: 'cluster',

      // 进程实例数：
      // - 数字：固定数量，如 4
      // - 'max'：使用全部 CPU 核心数
      // - '-1'：使用全部核心数减 1，留一个核心给系统
      instances: 'max',

      // ===== 自动重启策略 =====

      // 是否随文件变化自动重启（开发环境使用，生产慎用）
      watch: false,

      // 配合 watch 使用，忽略的文件/目录（支持 glob 模式）
      ignore_watch: ['node_modules', 'logs', '.git'],

      // 最大内存限制（单位：MB），超出后自动重启
      // 防止内存泄漏导致 OOM，是生产环境的关键配置
      max_memory_restart: '512M',

      // 定时重启策略（cron 表达式），用于定时刷新应用状态
      // 例：每天凌晨 3 点重启
      cron_restart: '0 3 * * *',

      // 自动重启次数限制，防止无限循环重启
      max_restarts: 10,

      // 两次重启之间的最小间隔（毫秒）
      min_uptime: '10s',

      // ===== 优雅退出配置 =====

      // 是否等待应用发送 'ready' 信号后才认为启动成功
      // 应用需要在启动完成后执行 process.send('ready')
      wait_ready: true,

      // 等待应用就绪的最长时间（毫秒），超时则视为启动失败
      listen_timeout: 10000,

      // 发送 SIGKILL 前的等待时间（毫秒）
      // PM2 先发送 SIGINT，若进程在此时间内未退出则强制 SIGKILL
      kill_timeout: 5000,

      // ===== 环境变量 =====

      // 默认环境变量（所有环境共用）
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
      },

      // 生产环境专用变量
      // 通过 pm2 start ecosystem.config.js --env production 激活
      env_production: {
        NODE_ENV: 'production',
        PORT: 8080,
      },

      // 测试环境专用变量
      env_test: {
        NODE_ENV: 'test',
        PORT: 3001,
      },

      // ===== 日志配置 =====

      // 是否合并 stdout 和 stderr 到同一个日志文件
      merge_logs: true,

      // 标准输出日志文件路径
      out_file: './logs/out.log',

      // 错误输出日志文件路径
      error_file: './logs/error.log',

      // 是否禁用日志写入（可用于高吞吐量场景减少 IO）
      log_file: './logs/combined.log',

      // 日志时间戳格式
      time: true,

      // ===== 高级配置 =====

      // 为每个实例递增的环境变量（集群模式下很有用）
      // 例：实例1 PORT=3000，实例2 PORT=3001，以此类推
      increment_var: 'PORT',

      // 源映射文件路径（用于错误堆栈还原）
      source_map_support: true,

      // 是否在实例间共享内存中的变量（Node.js cluster 行为）
      instance_var: 'INSTANCE_ID',

      // 是否在 PM2 重启时保持环境变量
      update_env: true,

      // 拦截 SIGINT 信号的超时时间
      // 配合应用内 process.on('SIGINT') 使用
      kill_retry_time: 1000,
    }
  ]
};
```

### 配置多个应用

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'api-server',
      script: './src/app.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: { NODE_ENV: 'development' },
      env_production: { NODE_ENV: 'production' }
    },
    {
      name: 'worker',
      script: './src/worker.js',
      instances: 2,
      exec_mode: 'fork',
      env: { NODE_ENV: 'development' }
    },
    {
      name: 'cron-job',
      script: './src/cron.js',
      instances: 1,
      exec_mode: 'fork',
      // 定时任务：每天凌晨执行一次
      cron_restart: '0 0 * * *'
    }
  ]
};
```

---

## 四、集群模式与负载均衡

### 什么时候用 Cluster 模式？

| 场景 | 推荐模式 | 原因 |
|------|---------|------|
| HTTP/Express/Fastify 服务 | `cluster` | 无状态，可多实例负载均衡 |
| WebSocket 服务 | `fork`（单实例）或 Redis 适配 | 有状态连接，需粘性会话 |
| 后台 Worker/队列消费 | `fork` | 避免任务重复消费 |
| 定时任务 | `fork` + `instances: 1` | 防止多次执行 |

### Cluster 模式实战

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'api',
      script: './server.js',
      exec_mode: 'cluster',
      instances: 'max',
      // 内存超限自动重启
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }
  ]
};
```

启动：

```bash
pm2 start ecosystem.config.js --env production
```

### 动态扩缩容

```bash
# 运行时增加实例数（从 2 个增加到 4 个）
pm2 scale api +2

# 直接指定实例数
pm2 scale api 4

# 减少到 1 个实例
pm2 scale api 1
```

### 集群端口分配策略

集群模式下所有实例监听**同一个端口**，由 PM2 内置的负载均衡器分发请求，无需手动分配不同端口：

```javascript
// server.js - 集群模式下所有实例都监听 3000
const http = require('http');

const server = http.createServer((req, res) => {
  res.end(`PID: ${process.pid}\n`);
});

server.listen(3000, () => {
  console.log(`Server running on PID ${process.pid}`);
});
```

如果需要为每个实例分配不同端口（如某些特殊场景）：

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'api',
    script: './server.js',
    instances: 4,
    exec_mode: 'cluster',
    // 每个实例的 PORT 自动递增：3000, 3001, 3002, 3003
    increment_var: 'PORT',
    env: {
      PORT: 3000
    }
  }]
};
```

---

## 五、环境变量管理

PM2 的环境变量分三层优先级（高到低）：

1. `env_<envname>`（如 `env_production`）
2. `env`（默认环境）
3. 系统环境变量

### 按环境启动

```bash
# 使用默认 env 配置
pm2 start ecosystem.config.js

# 使用 production 环境配置
pm2 start ecosystem.config.js --env production

# 使用 test 环境配置
pm2 start ecosystem.config.js --env test
```

### 运行时注入环境变量

```bash
# 直接覆盖环境变量启动
NODE_ENV=production PORT=8080 pm2 start app.js

# 或使用 --update-env 更新已运行进程的环境变量
pm2 restart api --update-env
```

### 配置示例：多环境完整实践

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'api',
    script: './src/app.js',
    instances: 'max',
    exec_mode: 'cluster',

    // 基础环境变量（所有环境共享）
    env: {
      NODE_ENV: 'development',
      PORT: 3000,
      LOG_LEVEL: 'debug',
      DB_POOL_SIZE: 5,
    },

    // 开发环境
    env_development: {
      NODE_ENV: 'development',
      PORT: 3000,
      LOG_LEVEL: 'debug',
      DB_HOST: 'localhost',
      DB_NAME: 'myapp_dev',
    },

    // 测试环境
    env_test: {
      NODE_ENV: 'test',
      PORT: 3001,
      LOG_LEVEL: 'warn',
      DB_HOST: 'test-db.internal',
      DB_NAME: 'myapp_test',
    },

    // 生产环境
    env_production: {
      NODE_ENV: 'production',
      PORT: 8080,
      LOG_LEVEL: 'error',
      DB_HOST: 'prod-db.internal',
      DB_NAME: 'myapp_prod',
      DB_POOL_SIZE: 20,
    },
  }]
};
```

---

## 六、优雅退出

优雅退出（Graceful Shutdown）是生产服务的必备能力：在进程退出前完成正在处理的请求、关闭数据库连接、刷新日志等清理工作。

### 为什么需要优雅退出？

```
SIGTERM/SIGINT 到来
      |
      v
  不处理 → 进程立即终止
              |
              v
    正在处理的请求中断 → 客户端收到 502/503
    数据库连接未释放   → 连接池泄漏
    内存数据未持久化   → 数据丢失
```

### PM2 优雅退出机制

```
PM2 发出 SIGINT
      |
      v
  应用执行清理逻辑
      |
      v
  调用 process.exit(0)
      |
      v
  超过 kill_timeout 仍未退出
      |
      v
  PM2 强制发送 SIGKILL
```

### 代码实现

```javascript
// app.js - Express 服务的优雅退出示例
const express = require('express');
const http = require('http');

const app = express();
const server = http.createServer(app);

// 模拟数据库连接
let dbConnection = null;

async function connectDB() {
  // 实际项目中换成真实的数据库连接
  dbConnection = { isConnected: true };
  console.log('数据库已连接');
}

// ===== 路由 =====
app.get('/health', (req, res) => {
  res.json({ status: 'ok', pid: process.pid });
});

app.get('/', (req, res) => {
  res.json({ message: 'Hello from PM2', pid: process.pid });
});

// ===== 优雅退出处理 =====
async function gracefulShutdown(signal) {
  console.log(`[${signal}] 收到关闭信号，开始优雅退出...`);

  // 1. 停止接受新连接
  server.close(() => {
    console.log('HTTP server 已关闭，不再接受新请求');
  });

  // 2. 等待正在处理的请求完成（设置一个合理的超时）
  const shutdownTimeout = setTimeout(() => {
    console.error('优雅退出超时，强制退出');
    process.exit(1);
  }, 10000); // 10 秒超时

  try {
    // 3. 关闭数据库连接
    if (dbConnection) {
      await new Promise(resolve => setTimeout(resolve, 500)); // 模拟关闭
      console.log('数据库连接已关闭');
    }

    // 4. 其他清理工作...
    // await redisClient.quit();
    // await closeMessageQueue();

    clearTimeout(shutdownTimeout);
    console.log('优雅退出完成');
    process.exit(0);
  } catch (err) {
    console.error('清理过程出错:', err);
    process.exit(1);
  }
}

// 监听 PM2 发送的信号
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// 未捕获的异常处理
process.on('uncaughtException', (err) => {
  console.error('未捕获的异常:', err);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason) => {
  console.error('未处理的 Promise 拒绝:', reason);
});

// ===== 启动服务 =====
const PORT = process.env.PORT || 3000;

async function start() {
  await connectDB();

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}, PID: ${process.pid}`);

    // 如果使用 wait_ready: true，需要发送 ready 信号
    if (process.send) {
      process.send('ready');
    }
  });
}

start();
```

### ecosystem.config.js 配合优雅退出

```javascript
module.exports = {
  apps: [{
    name: 'api',
    script: './app.js',
    exec_mode: 'cluster',
    instances: 'max',

    // 启用 wait_ready，等待应用发送 'ready' 信号
    // 防止应用在初始化完成前就被标记为 online
    wait_ready: true,

    // 等待 ready 信号的超时时间（毫秒）
    listen_timeout: 10000,

    // 发送 SIGKILL 前的等待时间
    // 必须大于 gracefulShutdown 内部的超时时间
    kill_timeout: 15000,
  }]
};
```

### 零停机重启（Zero Downtime Reload）

```bash
# 滚动重启：逐个重启实例，保证服务不中断
pm2 reload api

# 重载所有应用
pm2 reload all

# 重载 ecosystem 配置中指定的应用
pm2 reload ecosystem.config.js --only api

# 重载并更新环境变量
pm2 reload api --update-env
```

`reload` vs `restart` 的区别：

| 命令 | 行为 | 适用场景 |
|------|------|---------|
| `pm2 restart` | 先停止再启动，有短暂中断 | 开发环境、单实例 |
| `pm2 reload` | 滚动重启，保持服务可用 | 生产环境、集群模式 |

> **注意**：`reload` 只在 `exec_mode: 'cluster'` 模式下有效。Fork 模式的进程会被直接重启。

---

## 七、日志管理

### PM2 默认日志行为

PM2 默认将每个进程的 stdout 和 stderr 分别写入文件：

- `~/.pm2/logs/<app-name>-out.log` — 标准输出
- `~/.pm2/logs/<app-name>-error.log` — 错误输出
- `~/.pm2/pm2.log` — PM2 守护进程自身的日志

### 自定义日志配置

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'api',
    script: './app.js',

    // 合并 stdout 和 stderr 到同一个文件
    merge_logs: true,

    // 自定义日志路径
    out_file: '/var/log/myapp/out.log',
    error_file: '/var/log/myapp/error.log',

    // 合并日志（同时包含 stdout 和 stderr）
    log_file: '/var/log/myapp/combined.log',

    // 在日志前添加时间戳
    time: true,

    // 日志文件大小限制（达到后自动切分）
    // 需配合 pm2-logrotate 模块使用
    max_size: '10M',
  }]
};
```

### 日志命令

```bash
# 实时查看所有应用的日志（类似 tail -f）
pm2 logs

# 查看特定应用的日志
pm2 logs api

# 查看最近 200 行日志
pm2 logs --lines 200

# 查看错误日志（仅 stderr）
pm2 logs api --err

# 清空所有日志文件
pm2 flush

# 清空特定应用的日志
pm2 flush api

# 重新打开日志文件（日志轮转后使用）
pm2 reloadLogs
```

### 安装日志轮转模块

生产环境建议安装 `pm2-logrotate` 防止日志文件无限增长：

```bash
# 安装日志轮转模块
pm2 install pm2-logrotate

# 配置轮转策略
pm2 set pm2-logrotate:max_size 100M
pm2 set pm2-logrotate:retain 10
pm2 set pm2-logrotate:compress true
pm2 set pm2-logrotate:dateFormat YYYY-MM-DD_HH-mm-ss
```

---

## 八、监控与诊断

### 内置监控

```bash
# 终端实时监控面板（CPU、内存、请求量等）
pm2 monit

# 查看所有进程状态列表
pm2 list

# 查看单个进程详细信息
pm2 describe api
```

### 结构化日志与监控集成

在实际项目中，推荐将应用日志输出为结构化格式（JSON），方便接入 ELK/Loki 等日志系统：

```javascript
// 使用 pino 作为日志库
const pino = require('pino');

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  // 生产环境输出 JSON，开发环境输出格式化文本
  transport: process.env.NODE_ENV === 'development'
    ? { target: 'pino-pretty' }
    : undefined,
  // 基础字段
  base: {
    pid: process.pid,
    service: 'api-server',
  }
});

// PM2 会自动捕获 stdout/stderr，日志即被收集
logger.info({ userId: 123, action: 'login' }, '用户登录');
logger.error({ err: error }, '处理请求出错');
```

### 自定义 PM2 监控指标

```javascript
// 在应用代码中暴露自定义指标（需配合 PM2 Plus 或自行采集）
const io = require('@pm2/io');

// 定义一个计数器
const reqCounter = io.counter({
  name: '请求总数',
  id: 'app/requests/total'
});

// 定义一个直方图
const reqDuration = io.histogram({
  name: '请求耗时分布',
  id: 'app/requests/duration',
  measurement: 'mean',
  unit: 'ms'
});

app.use((req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    reqCounter.inc();
    reqDuration.update(Date.now() - start);
  });

  next();
});
```

---

## 九、系统启动与自动恢复

### 配置开机自启

```bash
# 生成系统启动脚本（自动检测系统 init 类型：systemd、upstart 等）
pm2 startup

# 上述命令会输出一条需要 root 执行的命令，类似：
# sudo env PATH=$PATH:/usr/local/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu

# 执行输出的命令...

# 保存当前进程列表
pm2 save

# 保存后，系统重启时会自动恢复这些进程
```

### 开机自启的完整流程

```bash
# 1. 启动你的应用
pm2 start ecosystem.config.js --env production

# 2. 保存进程列表
pm2 save

# 3. 生成启动脚本
pm2 startup
# 复制输出的 sudo 命令并执行

# 4. 测试：重启服务器后检查
# pm2 list（应该能看到之前的进程自动恢复）
```

### 手动恢复进程

```bash
# 如果进程列表丢失，可以手动恢复
pm2 resurrect
```

### 清理环境

```bash
# 停止并删除所有进程
pm2 delete all

# 取消开机自启
pm2 unstartup systemd

# 清除保存的进程列表
pm2 cleardump
```

---

## 十、部署配置

PM2 内置基于 Git 的远程部署能力，适合小型项目的快速部署。

### ecosystem.config.js 部署配置

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'api',
    script: './src/app.js',
    instances: 'max',
    exec_mode: 'cluster',
    env_production: {
      NODE_ENV: 'production',
      PORT: 8080
    }
  }],

  // ===== 部署配置 =====
  deploy: {
    // 生产环境
    production: {
      // SSH 密钥路径（可选，默认使用 ssh-agent）
      key: '~/.ssh/id_rsa',

      // 远程服务器用户名
      user: 'ubuntu',

      // 远程服务器地址（支持多服务器数组）
      host: ['192.168.1.10', '192.168.1.11'],

      // Git 分支
      ref: 'origin/main',

      // Git 仓库地址
      repo: 'git@github.com:your-org/your-repo.git',

      // 远程服务器上的部署路径
      path: '/var/www/api',

      // 部署前在本地执行的命令
      'pre-deploy-local': '',

      // 部署前在远程服务器执行的命令
      'pre-deploy': 'git reset --hard',

      // 部署后在远程服务器执行的命令
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',

      // 设置环境变量
      env: {
        NODE_ENV: 'production'
      }
    },

    // 测试环境
    test: {
      user: 'ubuntu',
      host: '192.168.1.20',
      ref: 'origin/develop',
      repo: 'git@github.com:your-org/your-repo.git',
      path: '/var/www/api-test',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env test'
    }
  }
};
```

### 部署命令

```bash
# 初始化部署（首次）
pm2 deploy production setup

# 部署更新
pm2 deploy production

# 部署并执行指定命令
pm2 deploy production exec "pm2 reload all"

# 回滚到上一个版本
pm2 deploy production revert 1
```

### 部署流程说明

```
本地执行 pm2 deploy production
            |
            v
    连接远程服务器（SSH）
            |
            v
    在 /var/www/api 目录执行 git pull
            |
            v
    执行 post-deploy 命令（npm install + pm2 reload）
            |
            v
    部署完成，服务已更新
```

> **注意**：对于大型项目或团队项目，建议将 PM2 部署作为 CI/CD 流程的一部分，而不是唯一的部署方式。配合 GitHub Actions / GitLab CI 使用效果更佳。

---

## 十一、项目实战：完整配置案例

以下是一个**电商后端 API 服务**的完整 PM2 配置，涵盖多应用管理、集群、优雅退出、日志、监控等所有生产级要素。

### 项目结构

```
ecommerce-api/
├── ecosystem.config.js      # PM2 主配置
├── package.json
├── src/
│   ├── app.js               # HTTP API 服务
│   ├── worker.js            # 后台任务处理器
│   ├── cron.js              # 定时任务
│   └── lib/
│       └── logger.js        # 日志工具
├── logs/                    # 日志目录
└── scripts/
    └── deploy.sh            # 部署脚本
```

### ecosystem.config.js（完整版）

```javascript
/**
 * 电商 API 服务 - PM2 生产级配置
 * 版本: PM2 5.x
 * 使用方式:
 *   - 开发: pm2 start ecosystem.config.js
 *   - 生产: pm2 start ecosystem.config.js --env production
 *   - 部署: pm2 deploy production
 */

const path = require('path');

module.exports = {
  // ===== 应用配置 =====
  apps: [
    // ---- API 主服务 ----
    {
      name: 'ecommerce-api',
      script: './src/app.js',
      cwd: path.resolve(__dirname),

      // 集群模式：使用全部 CPU 核心
      exec_mode: 'cluster',
      instances: 'max',

      // 内存限制：超过 1GB 自动重启
      max_memory_restart: '1G',

      // 优雅退出配置
      wait_ready: true,           // 等待应用发送 'ready' 信号
      listen_timeout: 10000,      // 等待 ready 的超时时间
      kill_timeout: 15000,        // SIGKILL 前的等待时间

      // 自动重启策略
      max_restarts: 10,
      min_uptime: '30s',

      // 日志配置
      merge_logs: true,
      out_file: './logs/api-out.log',
      error_file: './logs/api-error.log',
      time: true,

      // 错误日志与输出日志合并为一个文件
      log_file: './logs/api-combined.log',

      // 环境变量
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
        LOG_LEVEL: 'debug',
        DB_POOL_SIZE: 5,
        REDIS_HOST: 'localhost',
      },

      env_production: {
        NODE_ENV: 'production',
        PORT: 8080,
        LOG_LEVEL: 'info',
        DB_POOL_SIZE: 20,
        DB_HOST: 'prod-db.internal',
        REDIS_HOST: 'prod-redis.internal',
      },

      env_test: {
        NODE_ENV: 'test',
        PORT: 3001,
        LOG_LEVEL: 'warn',
      },
    },

    // ---- 订单处理 Worker ----
    {
      name: 'order-worker',
      script: './src/worker.js',
      cwd: path.resolve(__dirname),

      // Worker 使用 fork 模式（有状态，避免任务重复消费）
      exec_mode: 'fork',
      instances: 2,

      // Worker 内存通常比 API 服务小
      max_memory_restart: '512M',

      // 日志
      out_file: './logs/worker-out.log',
      error_file: './logs/worker-error.log',
      time: true,

      // 环境变量
      env: {
        NODE_ENV: 'development',
        WORKER_TYPE: 'order',
        CONCURRENCY: 5,
      },

      env_production: {
        NODE_ENV: 'production',
        WORKER_TYPE: 'order',
        CONCURRENCY: 20,
      },
    },

    // ---- 定时任务 ----
    {
      name: 'daily-report-cron',
      script: './src/cron.js',
      cwd: path.resolve(__dirname),

      // 定时任务：单实例、fork 模式
      exec_mode: 'fork',
      instances: 1,

      // 每天凌晨 2 点执行
      cron_restart: '0 2 * * *',

      // 不自动重启（由 cron 触发）
      autorestart: false,

      // 日志
      out_file: './logs/cron-out.log',
      error_file: './logs/cron-error.log',
      time: true,

      env: {
        NODE_ENV: 'production',
        JOB_TYPE: 'daily-report',
      },
    },
  ],

  // ===== 部署配置 =====
  deploy: {
    production: {
      user: 'deploy',
      host: ['api1.ecommerce.com', 'api2.ecommerce.com'],
      ref: 'origin/main',
      repo: 'git@github.com:your-org/ecommerce-api.git',
      path: '/var/www/ecommerce-api',

      // 部署后执行的完整流程
      'post-deploy': `
        npm ci --production && \
        pm2 reload ecosystem.config.js --env production && \
        pm2 save
      `,

      // 环境变量
      env: {
        NODE_ENV: 'production',
      }
    },

    staging: {
      user: 'deploy',
      host: 'staging.ecommerce.com',
      ref: 'origin/develop',
      repo: 'git@github.com:your-org/ecommerce-api.git',
      path: '/var/www/ecommerce-api-staging',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env test',
    }
  }
};
```

### app.js（配合 PM2 的 Express 服务）

```javascript
const express = require('express');
const http = require('http');

const app = express();
const server = http.createServer(app);

// 健康检查（PM2 和负载均衡器都会用到）
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    pid: process.pid,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString()
  });
});

// 就绪检查（用于 K8s 或高级负载均衡器）
app.get('/ready', (req, res) => {
  // 检查数据库连接等依赖是否就绪
  const isReady = true; // 实际项目中替换为真实检查

  if (isReady) {
    res.status(200).json({ ready: true });
  } else {
    res.status(503).json({ ready: false });
  }
});

// 业务路由
app.get('/api/products', (req, res) => {
  res.json({ products: [] });
});

// ===== 优雅退出 =====
let isShuttingDown = false;

async function gracefulShutdown(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`[PID ${process.pid}] 收到 ${signal}，开始优雅退出...`);

  // 停止接受新连接
  server.close(() => {
    console.log(`[PID ${process.pid}] HTTP server 已关闭`);
  });

  // 超时保护
  const forceExit = setTimeout(() => {
    console.error(`[PID ${process.pid}] 优雅退出超时，强制退出`);
    process.exit(1);
  }, 12000);

  try {
    // 等待正在处理的请求完成（给一些时间）
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 关闭数据库连接等清理...
    // await db.close();
    // await redis.quit();

    clearTimeout(forceExit);
    console.log(`[PID ${process.pid}] 优雅退出完成`);
    process.exit(0);
  } catch (err) {
    console.error(`[PID ${process.pid}] 退出出错:`, err);
    process.exit(1);
  }
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// ===== 启动 =====
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`[PID ${process.pid}] Server running on port ${PORT}`);

  // 通知 PM2 应用已就绪（配合 wait_ready: true）
  if (process.send) {
    process.send('ready');
  }
});
```

### 部署脚本

```bash
#!/bin/bash
# scripts/deploy.sh

set -e

ENV=${1:-production}
echo "=== 开始部署到 ${ENV} 环境 ==="

# 1. 运行测试
npm test

# 2. 构建（如有需要）
# npm run build

# 3. 部署
pm2 deploy ecosystem.config.js ${ENV}

echo "=== 部署完成 ==="
```

---

## 十二、常用命令速查表

### 启动与管理

| 命令 | 说明 |
|------|------|
| `pm2 start app.js` | 启动应用 |
| `pm2 start app.js --name api` | 指定名称启动 |
| `pm2 start app.js -i max` | 集群模式启动（全部 CPU） |
| `pm2 start ecosystem.config.js` | 通过配置文件启动 |
| `pm2 start ecosystem.config.js --env production` | 指定环境启动 |
| `pm2 stop api` | 停止指定应用 |
| `pm2 stop all` | 停止所有应用 |
| `pm2 restart api` | 重启（先停后启，有中断） |
| `pm2 reload api` | 零停机重启（仅 cluster 模式） |
| `pm2 delete api` | 删除应用 |
| `pm2 delete all` | 删除所有应用 |

### 查看状态

| 命令 | 说明 |
|------|------|
| `pm2 list` / `pm2 ls` / `pm2 status` | 查看所有进程状态 |
| `pm2 describe api` | 查看单个进程详情 |
| `pm2 monit` | 实时监控面板 |
| `pm2 show api` | 显示应用详细信息 |

### 日志

| 命令 | 说明 |
|------|------|
| `pm2 logs` | 实时查看所有日志 |
| `pm2 logs api` | 查看指定应用日志 |
| `pm2 logs --lines 100` | 查看最近 100 行 |
| `pm2 flush` | 清空所有日志 |
| `pm2 reloadLogs` | 重新打开日志文件 |

### 集群与扩缩容

| 命令 | 说明 |
|------|------|
| `pm2 scale api 4` | 将实例数调整为 4 |
| `pm2 scale api +2` | 增加 2 个实例 |
| `pm2 scale api 1` | 缩减到 1 个实例 |

### 系统与部署

| 命令 | 说明 |
|------|------|
| `pm2 save` | 保存当前进程列表 |
| `pm2 resurrect` | 恢复保存的进程 |
| `pm2 startup` | 生成开机自启脚本 |
| `pm2 unstartup` | 取消开机自启 |
| `pm2 deploy production setup` | 首次初始化部署 |
| `pm2 deploy production` | 执行部署 |
| `pm2 deploy production revert 1` | 回滚到上一版本 |

### 其他

| 命令 | 说明 |
|------|------|
| `pm2 update` | 更新 PM2 守护进程 |
| `pm2 cleardump` | 清除保存的进程列表 |
| `pm2 kill` | 停止 PM2 守护进程（所有进程也会被停止） |
| `pm2 --version` | 查看版本 |

---

## 总结

PM2 是 Node.js 生产环境的标配工具。核心要点回顾：

1. **始终使用 ecosystem.config.js**：不要用命令行参数管理生产配置
2. **集群模式提升吞吐量**：HTTP 服务使用 `exec_mode: 'cluster'` + `instances: 'max'`
3. **配置优雅退出**：`wait_ready` + `kill_timeout` + `process.on('SIGINT/SIGTERM')`
4. **用 reload 替代 restart**：生产环境部署使用零停机重启
5. **设置内存上限**：`max_memory_restart` 防止内存泄漏导致 OOM
6. **配置开机自启**：`pm2 startup` + `pm2 save` 保证服务器重启后自动恢复
7. **日志不要忽视**：配置日志路径、安装 `pm2-logrotate`、使用结构化日志
