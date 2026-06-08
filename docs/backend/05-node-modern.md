# Node.js 24+ 新特性实战

本文档详细介绍 Node.js 24+ 版本中的新特性和改进，每个特性都包含概念解释、可运行代码示例、适用场景和注意事项。

---

## 1. 测试运行器 (node:test)

### 概念解释

Node.js 内置了测试运行器，无需安装 jest、mocha 等第三方测试框架。它提供了：

- 与 `node:test` 模块的原生测试 API
- 子测试支持
- 内置断言库 `node:assert`
- 测试覆盖率报告
- 并行/串行测试执行控制
- 快照测试支持

### 实战案例

```javascript
// test/math.test.js
const { describe, it, before, after, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');

// 被测试的模块
const math = {
  add: (a, b) => a + b,
  divide: (a, b) => {
    if (b === 0) throw new Error('Cannot divide by zero');
    return a / b;
  },
  factorial: (n) => {
    if (n < 0) throw new Error('Negative numbers not supported');
    if (n === 0 || n === 1) return 1;
    return n * math.factorial(n - 1);
  }
};

// 基础测试
describe('Math 模块', () => {
  // 生命周期钩子
  before(() => {
    console.log('测试套件开始');
  });

  after(() => {
    console.log('测试套件结束');
  });

  beforeEach(() => {
    // 每个测试前的准备
  });

  afterEach(() => {
    // 每个测试后的清理
  });

  describe('add 函数', () => {
    it('应该正确相加两个正数', () => {
      assert.strictEqual(math.add(2, 3), 5);
    });

    it('应该正确处理负数', () => {
      assert.strictEqual(math.add(-2, 3), 1);
      assert.strictEqual(math.add(-2, -3), -5);
    });

    it('应该处理浮点数', () => {
      // 使用近似相等比较浮点数
      assert.ok(Math.abs(math.add(0.1, 0.2) - 0.3) < 0.0001);
    });
  });

  describe('divide 函数', () => {
    it('应该正确相除', () => {
      assert.strictEqual(math.divide(10, 2), 5);
    });

    it('应该抛出除以零错误', () => {
      assert.throws(() => {
        math.divide(10, 0);
      }, /Cannot divide by zero/);
    });
  });

  describe('factorial 函数', () => {
    it('应该计算阶乘', () => {
      assert.strictEqual(math.factorial(0), 1);
      assert.strictEqual(math.factorial(1), 1);
      assert.strictEqual(math.factorial(5), 120);
    });

    it('应该拒绝负数', () => {
      assert.throws(() => {
        math.factorial(-1);
      }, /Negative numbers/);
    });
  });
});

// 异步测试
describe('异步测试', () => {
  it('应该支持 async/await', async () => {
    const result = await Promise.resolve(math.add(1, 2));
    assert.strictEqual(result, 3);
  });

  it('应该支持 Promise reject', async () => {
    await assert.rejects(
      Promise.reject(new Error('fail')),
      /fail/
    );
  });

  it('应该处理异步操作超时', async () => {
    // 使用 AbortController 控制超时
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 100);

    try {
      await fetch('https://example.com', { signal: controller.signal });
    } catch (e) {
      assert.ok(e.name === 'AbortError');
    } finally {
      clearTimeout(timeout);
    }
  });
});

// 子测试
describe('子测试', () => {
  it('并行子测试', async (t) => {
    await Promise.all([
      t.test('子测试 1', () => {
        assert.strictEqual(math.add(1, 1), 2);
      }),
      t.test('子测试 2', () => {
        assert.strictEqual(math.add(2, 2), 4);
      })
    ]);
  });

  it('串行子测试', async (t) => {
    await t.test('步骤 1: 初始化', () => {
      assert.ok(true);
    });

    await t.test('步骤 2: 执行操作', () => {
      assert.ok(true);
    });

    await t.test('步骤 3: 验证结果', () => {
      assert.ok(true);
    });
  });
});

// Mock 测试
describe('Mock 测试', () => {
  it('应该能 mock 函数', (t) => {
    const original = { fetchData: () => 'real data' };

    // 使用 mock 替代原函数
    const mockFn = t.mock.fn(() => 'mocked data');

    assert.strictEqual(mockFn(), 'mocked data');
    assert.strictEqual(mockFn.mock.callCount(), 1);
  });

  it('应该能 mock 模块方法', async (t) => {
    const fs = require('node:fs');

    // 记录原始方法
    const originalReadFile = fs.readFileSync;

    // 使用 mock
    const mockReadFile = t.mock.method(fs, 'readFileSync', () => 'mocked content');

    const result = fs.readFileSync('/fake/path');
    assert.strictEqual(result, 'mocked content');
    assert.strictEqual(mockReadFile.mock.callCount(), 1);

    // 测试结束后自动恢复
  });
});

// 快照测试
describe('快照测试', () => {
  it('应该匹配对象快照', (t) => {
    const user = {
      id: 1,
      name: 'John',
      email: 'john@example.com',
      createdAt: '2024-01-01'
    };

    // 第一次运行会创建快照，后续运行会对比
    // assert.snapshot(JSON.stringify(user));
    assert.deepStrictEqual(user, {
      id: 1,
      name: 'John',
      email: 'john@example.com',
      createdAt: '2024-01-01'
    });
  });
});
```

**运行测试：**

```bash
# 运行所有测试
node --test

# 运行特定文件
node --test test/math.test.js

# 运行匹配模式的测试
node --test --test-name-pattern="add"

# 生成覆盖率报告
node --test --experimental-test-coverage

# 并行运行（默认）
node --test --test-concurrency=4

# 串行运行
node --test --test-concurrency=1
```

### 适用场景

- 新项目无需引入额外测试依赖
- 需要与 Node.js 运行时紧密集成的测试
- CI/CD 环境中减少依赖安装时间
- 需要原生覆盖率报告的项目

### 注意事项

- `node:test` 的 API 与 jest 不完全兼容，迁移需要调整
- Mock 功能相对 jest 较简单，复杂场景可能需要额外工具
- 快照测试需要 `--experimental` 标志或特定版本支持
- 测试文件默认需要 `.test.js` 或 `_test.js` 后缀

---

## 2. 原生 Watch 模式 (node --watch)

### 概念解释

Node.js 24 内置了文件监视功能，无需安装 `nodemon` 或 `node-dev`：

- `--watch`：监视文件变化并自动重启
- `--watch-path`：指定监视的目录
- `--watch-preserve-output`：重启时不清除终端输出

### 实战案例

```javascript
// server.js
const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    message: 'Hello from Node.js 24!',
    timestamp: new Date().toISOString(),
    pid: process.pid
  }));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Process ID: ${process.pid}`);
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    process.exit(0);
  });
});
```

**使用 Watch 模式运行：**

```bash
# 基础用法 - 监视当前目录
node --watch server.js

# 监视特定目录
node --watch --watch-path=./src server.js

# 保留输出（不清屏）
node --watch --watch-preserve-output server.js

# 组合使用
node --watch --watch-path=./src --watch-path=./config server.js

# 在 package.json 中配置
```

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "node --watch --watch-preserve-output server.js",
    "dev:src": "node --watch --watch-path=./src --watch-path=./lib server.js"
  }
}
```

**高级：自定义重启逻辑：**

```javascript
// watch-hooks.js
// 在 --watch 模式下，每次重启前会触发一些事件

let restartCount = 0;

// 检测是否在 watch 模式下
if (process.env.NODE_WATCH_MODE) {
  console.log('运行在 Watch 模式下');
}

// 首次启动
if (!global.__watchRestartCount) {
  global.__watchRestartCount = 0;
  console.log('首次启动');
} else {
  global.__watchRestartCount++;
  console.log(`第 ${global.__watchRestartCount} 次重启`);
}

// 清理资源（在进程退出前）
process.on('exit', (code) => {
  console.log(`进程退出，代码: ${code}`);
});

// 处理重启信号
process.on('SIGUSR2', () => {
  console.log('收到重启信号，清理资源...');
  // 关闭数据库连接等
});
```

### 适用场景

- 开发环境替代 nodemon
- 配置文件热重载
- 减少项目依赖数量
- 简单的开发服务器

### 注意事项

- `--watch` 模式不适合生产环境
- 默认会清除终端输出，使用 `--watch-preserve-output` 保留
- 某些文件系统（如网络文件系统）可能不支持高效的文件监视
- 大量文件变化可能导致频繁重启，建议配合 `--watch-path` 限制范围

---

## 3. 权限模型 (Permission Model / --permission)

### 概念解释

Node.js 权限模型允许在运行时限制程序的能力，类似于 Deno 的权限系统：

- `--permission`：启用权限模型
- `--allow-fs-read`：允许文件系统读取
- `--allow-fs-write`：允许文件系统写入
- `--allow-child-process`：允许创建子进程
- `--allow-worker-threads`：允许使用 Worker 线程

### 实战案例

```javascript
// permission-demo.js
const fs = require('fs');
const path = require('path');

/**
 * 检测当前权限状态
 */
function checkPermissions() {
  const permissions = {
    // 文件系统读取
    fsRead: process.permission.has('fs.read'),
    fsReadPath: process.permission.has('fs.read', '/tmp'),

    // 文件系统写入
    fsWrite: process.permission.has('fs.write'),
    fsWritePath: process.permission.has('fs.write', '/tmp'),

    // 子进程
    childProcess: process.permission.has('child.process'),

    // Worker 线程
    workerThreads: process.permission.has('worker.threads'),

    // 网络（Node 24+）
    network: process.permission.has('net'),
    networkOutbound: process.permission.has('net', 'outbound')
  };

  return permissions;
}

/**
 * 安全文件读取（带权限回退）
 */
function safeReadFile(filePath) {
  try {
    // 检查是否有权限读取该路径
    if (!process.permission.has('fs.read', filePath)) {
      console.error(`无权限读取: ${filePath}`);
      return null;
    }

    return fs.readFileSync(filePath, 'utf-8');
  } catch (e) {
    if (e.code === 'ERR_ACCESS_DENIED') {
      console.error('权限被拒绝:', filePath);
      return null;
    }
    throw e;
  }
}

/**
 * 安全写入文件
 */
function safeWriteFile(filePath, content) {
  try {
    if (!process.permission.has('fs.write', filePath)) {
      console.error(`无权限写入: ${filePath}`);
      return false;
    }

    fs.writeFileSync(filePath, content);
    return true;
  } catch (e) {
    if (e.code === 'ERR_ACCESS_DENIED') {
      console.error('写入权限被拒绝:', filePath);
      return false;
    }
    throw e;
  }
}

// 主逻辑
console.log('=== 权限模型演示 ===\n');

// 显示当前权限
const perms = checkPermissions();
console.log('当前权限状态:');
console.log(JSON.stringify(perms, null, 2));

// 尝试读取文件
const testFile = path.join(__dirname, 'test-data.txt');
fs.writeFileSync(testFile, 'test content');

const content = safeReadFile(testFile);
console.log('\n文件内容:', content);

// 尝试写入
const writeResult = safeWriteFile(testFile, 'updated content');
console.log('写入结果:', writeResult);

// 清理
fs.unlinkSync(testFile);
```

**运行方式：**

```bash
# 无权限限制（默认）
node permission-demo.js

# 启用权限模型，只允许读取特定目录
node --permission --allow-fs-read=./ permission-demo.js

# 允许读写特定目录
node --permission \
  --allow-fs-read=./data \
  --allow-fs-write=./data \
  permission-demo.js

# 允许文件读写和子进程
node --permission \
  --allow-fs-read=* \
  --allow-fs-write=/tmp \
  --allow-child-process \
  permission-demo.js

# 完全限制模式（仅允许显式授权的权限）
node --permission permission-demo.js
```

**权限感知的服务器：**

```javascript
// permission-aware-server.js
const http = require('http');
const fs = require('fs');
const path = require('path');

/**
 * 权限感知的服务器
 * 在受限环境中优雅降级
 */
class PermissionAwareServer {
  constructor(options = {}) {
    this.publicDir = options.publicDir || './public';
    this.cacheEnabled = options.cacheEnabled !== false;
    this.memoryCache = new Map();
  }

  canReadFile(filePath) {
    return process.permission.has('fs.read', filePath);
  }

  async serveFile(filePath) {
    // 检查权限
    if (!this.canReadFile(filePath)) {
      return {
        status: 403,
        body: JSON.stringify({ error: 'File access not permitted' }),
        headers: { 'Content-Type': 'application/json' }
      };
    }

    // 尝试内存缓存（不依赖文件系统权限）
    if (this.cacheEnabled && this.memoryCache.has(filePath)) {
      return {
        status: 200,
        body: this.memoryCache.get(filePath),
        headers: { 'Content-Type': 'text/plain', 'X-Cache': 'HIT' }
      };
    }

    try {
      const content = fs.readFileSync(filePath);
      this.memoryCache.set(filePath, content);

      return {
        status: 200,
        body: content,
        headers: { 'Content-Type': 'text/plain', 'X-Cache': 'MISS' }
      };
    } catch (e) {
      if (e.code === 'ERR_ACCESS_DENIED') {
        return {
          status: 403,
          body: JSON.stringify({ error: 'Access denied by permission model' }),
          headers: { 'Content-Type': 'application/json' }
        };
      }
      throw e;
    }
  }

  createServer() {
    return http.createServer(async (req, res) => {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const filePath = path.join(this.publicDir, url.pathname);

      const result = await this.serveFile(filePath);

      res.writeHead(result.status, result.headers);
      res.end(result.body);
    });
  }
}

// 使用
const server = new PermissionAwareServer({ publicDir: './public' });
server.createServer().listen(3000, () => {
  console.log('权限感知服务器运行在 http://localhost:3000');
});
```

### 适用场景

- 运行不可信代码（如插件系统）
- 容器化环境中最小权限原则
- 防止供应链攻击的横向移动
- 多租户环境中的资源隔离

### 注意事项

- 权限模型有性能开销，不适合高吞吐量场景
- 某些模块可能不兼容权限模型
- 权限检查是运行时的，编译时不会报错
- 需要仔细设计权限边界，过松失去意义，过严影响功能

---

## 4. Performance Hooks 增强

### 概念解释

Node.js 24 增强了 Performance Hooks API，提供更精确的性能测量：

- `performance.mark()`：创建时间戳标记
- `performance.measure()`：测量两个标记之间的时间
- `PerformanceObserver`：监听性能条目
- 与浏览器 Performance API 对齐

### 实战案例

```javascript
// performance-hooks.js
const { performance, PerformanceObserver } = require('node:perf_hooks');

/**
 * 性能测量工具类
 */
class PerformanceProfiler {
  constructor(options = {}) {
    this.enabled = options.enabled !== false;
    this.measurements = new Map();
    this.setupObserver();
  }

  setupObserver() {
    // 监听所有性能条目
    this.observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'measure') {
          console.log(`[PERF] ${entry.name}: ${entry.duration.toFixed(3)}ms`);
        }
      }
    });

    this.observer.observe({ entryTypes: ['mark', 'measure', 'function'] });
  }

  /**
   * 开始测量
   */
  start(label) {
    if (!this.enabled) return;
    performance.mark(`${label}-start`);
  }

  /**
   * 结束测量
   */
  end(label) {
    if (!this.enabled) return;
    performance.mark(`${label}-end`);
    performance.measure(label, `${label}-start`, `${label}-end`);
  }

  /**
   * 测量异步函数执行时间
   */
  async measureAsync(label, fn) {
    this.start(label);
    try {
      return await fn();
    } finally {
      this.end(label);
    }
  }

  /**
   * 测量同步函数执行时间
   */
  measureSync(label, fn) {
    this.start(label);
    try {
      return fn();
    } finally {
      this.end(label);
    }
  }

  /**
   * 获取性能条目
   */
  getEntries() {
    return performance.getEntriesByType('measure');
  }

  /**
   * 清除测量数据
   */
  clear() {
    performance.clearMarks();
    performance.clearMeasures();
    this.measurements.clear();
  }

  destroy() {
    this.observer.disconnect();
  }
}

// 实战案例 1：API 性能监控
async function apiPerformanceDemo() {
  const profiler = new PerformanceProfiler();

  // 模拟数据库查询
  const result = await profiler.measureAsync('database-query', async () => {
    await new Promise(r => setTimeout(r, 50));  // 模拟延迟
    return { users: 100 };
  });

  // 模拟数据处理
  const processed = profiler.measureSync('data-processing', () => {
    const data = [];
    for (let i = 0; i < 10000; i++) {
      data.push(i * 2);
    }
    return data;
  });

  // 模拟外部 API 调用
  await profiler.measureAsync('external-api', async () => {
    await new Promise(r => setTimeout(r, 100));
  });

  console.log('\n=== 性能报告 ===');
  const entries = profiler.getEntries();
  entries.forEach(entry => {
    console.log(`${entry.name}: ${entry.duration.toFixed(2)}ms`);
  });

  profiler.destroy();
}

// 实战案例 2：HTTP 请求计时中间件
function createPerformanceMiddleware() {
  return (req, res, next) => {
    const start = performance.now();
    const requestId = `${req.method}-${req.url}-${Date.now()}`;

    // 记录请求开始
    performance.mark(`${requestId}-start`);

    res.on('finish', () => {
      const duration = performance.now() - start;
      performance.mark(`${requestId}-end`);
      performance.measure(
        `http-request-${req.route?.path || req.url}`,
        `${requestId}-start`,
        `${requestId}-end`
      );

      console.log(`[HTTP] ${req.method} ${req.url} - ${res.statusCode} - ${duration.toFixed(2)}ms`);
    });

    next();
  };
}

// 实战案例 3：Event Loop 延迟监控
function monitorEventLoopLag() {
  let lastCheck = performance.now();

  setInterval(() => {
    const now = performance.now();
    const lag = now - lastCheck - 1000;  // 期望 1000ms，实际差值就是延迟
    lastCheck = now;

    if (lag > 100) {
      console.warn(`[PERF] Event Loop 延迟过高: ${lag.toFixed(2)}ms`);
    }
  }, 1000);
}

// 实战案例 4：资源计时
function resourceTimingDemo() {
  // 创建性能时间线
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      console.log(`[RESOURCE] ${entry.name}: ${entry.duration?.toFixed(2)}ms`);
    }
  });

  observer.observe({ entryTypes: ['resource'] });

  // Node.js 24 支持更多资源类型计时
  performance.mark('resource-start');

  // 模拟资源加载
  setTimeout(() => {
    performance.mark('resource-end');
    performance.measure('resource-load', 'resource-start', 'resource-end');
  }, 200);
}

// 运行演示
async function demo() {
  await apiPerformanceDemo();
  resourceTimingDemo();
}

module.exports = {
  PerformanceProfiler,
  createPerformanceMiddleware,
  monitorEventLoopLag
};

if (require.main === module) {
  demo().catch(console.error);
}
```

### 适用场景

- API 响应时间监控
- 数据库查询性能分析
- 事件循环健康检查
- 性能回归测试

### 注意事项

- `performance.now()` 返回的是高精度时间，但不保证单调性（系统时间调整会影响）
- 大量性能条目会占用内存，定期清理
- 生产环境建议采样而非全量收集
- PerformanceObserver 是异步的，可能错过快速完成的条目

---

## 5. AbortController / AbortSignal

### 概念解释

`AbortController` 提供了一种标准的方式来取消异步操作：

- 与浏览器 API 完全一致
- 支持 `fetch`、流、定时器等
- 可以组合多个信号
- Node.js 24 中支持更广泛

### 实战案例

```javascript
// abort-controller-demo.js

/**
 * 请求取消管理器
 */
class RequestCanceller {
  constructor() {
    this.controllers = new Map();
  }

  /**
   * 创建可取消的请求
   */
  createRequest(id) {
    const controller = new AbortController();
    this.controllers.set(id, controller);

    // 自动清理
    const cleanup = () => this.controllers.delete(id);
    controller.signal.addEventListener('abort', cleanup, { once: true });

    return controller;
  }

  /**
   * 取消特定请求
   */
  cancel(id, reason = 'User cancelled') {
    const controller = this.controllers.get(id);
    if (controller) {
      controller.abort(reason);
      this.controllers.delete(id);
      return true;
    }
    return false;
  }

  /**
   * 取消所有请求
   */
  cancelAll(reason = 'Batch cancel') {
    for (const [id, controller] of this.controllers) {
      controller.abort(reason);
    }
    this.controllers.clear();
  }

  /**
   * 获取活跃请求数
   */
  getActiveCount() {
    return this.controllers.size;
  }
}

// 实战案例 1：带超时的 HTTP 请求
async function fetchWithTimeout(url, options = {}) {
  const { timeout = 5000, ...fetchOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort(new Error(`Request timeout after ${timeout}ms`));
  }, timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error(`请求超时或已被取消: ${error.message}`);
    }
    throw error;
  }
}

// 实战案例 2：可取消的数据流
async function* cancellableDataStream(signal) {
  let i = 0;

  while (!signal.aborted) {
    yield { data: `chunk-${i}`, timestamp: Date.now() };
    i++;

    // 检查是否被取消
    if (signal.aborted) {
      throw new Error('Stream cancelled: ' + signal.reason);
    }

    await new Promise(r => setTimeout(r, 100));
  }
}

// 实战案例 3：组合多个 AbortSignal
function combineSignals(...signals) {
  const controller = new AbortController();

  for (const signal of signals) {
    if (signal.aborted) {
      controller.abort(signal.reason);
      return controller.signal;
    }

    signal.addEventListener('abort', () => {
      controller.abort(signal.reason);
    }, { once: true });
  }

  return controller.signal;
}

// 实战案例 4：竞速请求（谁先完成用谁）
async function raceWithCancellation(urls, options = {}) {
  const controller = new AbortController();
  const { timeout = 10000 } = options;

  // 超时取消
  const timeoutId = setTimeout(() => {
    controller.abort(new Error('All requests timed out'));
  }, timeout);

  try {
    const promises = urls.map(async (url) => {
      try {
        const response = await fetch(url, { signal: controller.signal });
        // 成功后取消其他请求
        controller.abort(new Error('Another request succeeded'));
        return response;
      } catch (e) {
        if (e.message === 'Another request succeeded') {
          // 其他请求成功了，这是预期的
          return null;
        }
        throw e;
      }
    });

    const result = await Promise.race(promises);
    clearTimeout(timeoutId);
    return result;
  } catch (e) {
    clearTimeout(timeoutId);
    throw e;
  }
}

// 实战案例 5：Express 中的请求取消
function createCancellableMiddleware() {
  const canceller = new RequestCanceller();

  return {
    // 中间件：为每个请求附加 AbortSignal
    attachSignal: (req, res, next) => {
      const requestId = `${req.method}-${req.url}-${Date.now()}`;
      const controller = canceller.createRequest(requestId);
      req.signal = controller.signal;
      req.requestId = requestId;

      // 客户端断开时取消
      req.on('close', () => {
        if (!res.writableEnded) {
          canceller.cancel(requestId, 'Client disconnected');
        }
      });

      next();
    },

    // 取消特定请求
    cancelRequest: (req, res) => {
      const { requestId } = req.params;
      const cancelled = canceller.cancel(requestId);
      res.json({ cancelled, activeRequests: canceller.getActiveCount() });
    },

    // 获取活跃请求
    getActiveRequests: (req, res) => {
      res.json({ count: canceller.getActiveCount() });
    }
  };
}

// 实战案例 6：数据库查询取消
class CancellableDatabase {
  constructor() {
    this.activeQueries = new Map();
  }

  async query(sql, params, signal) {
    const queryId = `query-${Date.now()}-${Math.random()}`;

    return new Promise((resolve, reject) => {
      // 设置取消处理
      const onAbort = () => {
        this.activeQueries.delete(queryId);
        reject(new Error('Query cancelled'));
      };

      if (signal) {
        if (signal.aborted) {
          reject(new Error('Query already cancelled'));
          return;
        }
        signal.addEventListener('abort', onAbort, { once: true });
      }

      // 模拟查询
      const timeout = setTimeout(() => {
        this.activeQueries.delete(queryId);
        if (signal) {
          signal.removeEventListener('abort', onAbort);
        }
        resolve({ rows: [{ id: 1, name: 'test' }] });
      }, 100);

      this.activeQueries.set(queryId, { sql, timeout });
    });
  }
}

// 运行演示
async function demo() {
  console.log('=== AbortController 演示 ===\n');

  // 1. 基本取消
  const controller = new AbortController();
  setTimeout(() => controller.abort('用户取消'), 100);

  try {
    await fetch('https://httpbin.org/delay/5', {
      signal: controller.signal
    });
  } catch (e) {
    console.log('1. 请求被取消:', e.message);
  }

  // 2. 超时请求
  try {
    await fetchWithTimeout('https://httpbin.org/delay/5', { timeout: 500 });
  } catch (e) {
    console.log('2. 超时取消:', e.message);
  }

  // 3. 可取消流
  const streamController = new AbortController();
  setTimeout(() => streamController.abort('停止流'), 250);

  try {
    for await (const chunk of cancellableDataStream(streamController.signal)) {
      console.log('3. 收到:', chunk.data);
    }
  } catch (e) {
    console.log('3. 流被取消:', e.message);
  }

  // 4. 组合信号
  const signal1 = new AbortController().signal;
  const signal2 = new AbortController().signal;
  const combined = combineSignals(signal1, signal2);
  console.log('4. 组合信号已创建');
}

module.exports = {
  RequestCanceller,
  fetchWithTimeout,
  combineSignals,
  raceWithCancellation,
  createCancellableMiddleware,
  CancellableDatabase
};

if (require.main === module) {
  demo().catch(console.error);
}
```

### 适用场景

- 用户主动取消长时间操作
- 请求超时控制
- 页面/组件卸载时清理资源
- 竞速请求（race conditions）
- 批量操作的统一取消

### 注意事项

- 不是所有 API 都支持 AbortSignal，需要检查文档
- 取消后需要手动清理资源（数据库连接、文件句柄等）
- `AbortError` 需要正确处理，不要与普通错误混淆
- 组合信号时，任一信号触发 abort 都会取消操作

---

## 6. SEA (Single Executable Applications)

### 概念解释

SEA 允许将 Node.js 应用打包为单个可执行文件：

- 无需目标机器安装 Node.js
- 包含应用代码和运行时
- 支持快照（startup snapshot）加速启动
- 支持代码签名

### 实战案例

```javascript
// sea-app.js
/**
 * SEA 单可执行文件应用
 * 打包步骤见下方说明
 */

const fs = require('fs');
const path = require('path');

// 检测是否在 SEA 环境中运行
const isSEA = process.argv[1]?.endsWith('.sea') ||
              !fs.existsSync(__filename);

console.log(`运行模式: ${isSEA ? 'SEA' : '普通 Node.js'}`);

// 简单的 CLI 工具
class SeaApp {
  constructor() {
    this.commands = new Map();
    this.registerCommands();
  }

  registerCommands() {
    this.commands.set('help', this.showHelp.bind(this));
    this.commands.set('version', this.showVersion.bind(this));
    this.commands.set('hash', this.hashFile.bind(this));
    this.commands.set('env', this.showEnv.bind(this));
  }

  showHelp() {
    console.log(`
用法: sea-app <command> [options]

命令:
  help      显示帮助信息
  version   显示版本信息
  hash      计算文件哈希
  env       显示环境信息

示例:
  sea-app hash ./package.json
  sea-app env
`);
  }

  showVersion() {
    const pkg = require('./package.json');
    console.log(`${pkg.name} v${pkg.version}`);
    console.log(`Node.js ${process.version}`);
    console.log(`平台: ${process.platform} ${process.arch}`);
  }

  async hashFile(args) {
    const crypto = require('crypto');
    const filename = args[0];

    if (!filename) {
      console.error('错误: 请提供文件路径');
      process.exit(1);
    }

    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filename);

    return new Promise((resolve, reject) => {
      stream.on('data', chunk => hash.update(chunk));
      stream.on('end', () => {
        console.log(`SHA-256: ${hash.digest('hex')}`);
        console.log(`文件: ${filename}`);
        resolve();
      });
      stream.on('error', reject);
    });
  }

  showEnv() {
    console.log('环境信息:');
    console.log(`  PID: ${process.pid}`);
    console.log(`  CWD: ${process.cwd()}`);
    console.log(`  execPath: ${process.execPath}`);
    console.log(`  argv: ${JSON.stringify(process.argv)}`);
    console.log(`  SEA: ${isSEA}`);
  }

  run(args) {
    const command = args[0] || 'help';
    const handler = this.commands.get(command);

    if (!handler) {
      console.error(`未知命令: ${command}`);
      this.showHelp();
      process.exit(1);
    }

    handler(args.slice(1));
  }
}

// 启动
const app = new SeaApp();
app.run(process.argv.slice(2));
```

**打包为 SEA：**

```json
// package.json
{
  "name": "sea-app",
  "version": "1.0.0",
  "main": "sea-app.js",
  "scripts": {
    "build:sea": "node scripts/build-sea.js"
  }
}
```

```javascript
// scripts/build-sea.js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * SEA 打包脚本
 */
function buildSEA() {
  const appName = 'sea-app';
  const entryFile = 'sea-app.js';

  console.log('开始构建 SEA...');

  // 1. 创建 SEA 配置
  const seaConfig = {
    main: entryFile,
    output: 'sea-prep.blob',
    disableExperimentalSEAWarning: true,
    useSnapshot: false,
    useCodeCache: true
  };

  fs.writeFileSync('sea-config.json', JSON.stringify(seaConfig, null, 2));

  // 2. 生成 blob
  console.log('生成 SEA blob...');
  execSync('node --experimental-sea-config sea-config.json', {
    stdio: 'inherit'
  });

  // 3. 复制 Node.js 可执行文件
  const nodePath = process.execPath;
  const outputPath = path.join('dist', process.platform === 'win32' ? `${appName}.exe` : appName);

  fs.mkdirSync('dist', { recursive: true });

  // 复制可执行文件
  fs.copyFileSync(nodePath, outputPath);

  // 4. 注入 blob（使用 postject）
  console.log('注入 SEA blob...');
  try {
    execSync(`npx postject ${outputPath} NODE_SEA_BLOB sea-prep.blob \
      --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2 \
      --macho-segment-name NODE_SEA`, {
      stdio: 'inherit'
    });
  } catch (e) {
    console.error('注入失败，请确保已安装 postject:');
    console.error('npm install -g postject');
    throw e;
  }

  // 5. 设置权限
  if (process.platform !== 'win32') {
    fs.chmodSync(outputPath, 0o755);
  }

  // 6. 清理
  fs.unlinkSync('sea-config.json');
  fs.unlinkSync('sea-prep.blob');

  console.log(`\n构建完成: ${outputPath}`);
  console.log(`运行: ${outputPath} help`);
}

buildSEA();
```

**使用 Startup Snapshot 加速启动：**

```javascript
// sea-snapshot.js
/**
 * 使用启动快照优化 SEA 启动速度
 */

const fs = require('fs');
const path = require('path');
const v8 = require('v8');

// 在构建时执行，生成快照
function buildSnapshot() {
  // 预加载和初始化昂贵的操作
  const expensiveData = loadExpensiveData();

  // 将数据序列化到快照
  v8.startupSnapshot.setDeserializeMainFunction(() => {
    // 快照恢复时执行的代码
    console.log('从快照恢复');
    global.__preloadedData = expensiveData;
  });
}

function loadExpensiveData() {
  // 模拟昂贵的初始化
  const data = {};
  for (let i = 0; i < 10000; i++) {
    data[`key-${i}`] = { index: i, value: Math.random() };
  }
  return data;
}

// 运行时入口
function main() {
  if (global.__preloadedData) {
    console.log('使用预加载数据，启动更快！');
    console.log('数据条目:', Object.keys(global.__preloadedData).length);
  } else {
    console.log('正常启动');
  }
}

// 检测是否在快照构建阶段
if (process.env.BUILD_SEA_SNAPSHOT) {
  buildSnapshot();
} else {
  main();
}
```

### 适用场景

- 分发 CLI 工具给没有 Node.js 环境的用户
- 保护源代码（虽然可以反编译，但增加了难度）
- 简化部署（单个文件）
- 需要快速启动的应用（配合 snapshot）

### 注意事项

- SEA 文件体积较大（包含 Node.js 运行时，约 80MB+）
- 原生模块（.node 文件）需要额外处理
- 不同平台需要分别构建
- 代码签名需要额外配置
- 调试比常规 Node.js 应用困难

---

## 7. TypeScript 支持实验特性

### 概念解释

Node.js 24 继续改进对 TypeScript 的原生支持：

- 无需预编译直接运行 `.ts` 文件（实验性）
- 支持 TypeScript 类型剥离（type stripping）
- 支持 `tsconfig.json` 中的路径映射
- 更好的错误堆栈跟踪

### 实战案例

```typescript
// server.ts
// 可以直接运行: node --experimental-strip-types server.ts

interface User {
  id: number;
  name: string;
  email: string;
}

interface ApiResponse<T> {
  data: T;
  status: number;
  timestamp: string;
}

class UserService {
  private users: Map<number, User> = new Map();
  private nextId = 1;

  create(name: string, email: string): User {
    const user: User = {
      id: this.nextId++,
      name,
      email
    };
    this.users.set(user.id, user);
    return user;
  }

  findById(id: number): User | undefined {
    return this.users.get(id);
  }

  findAll(): User[] {
    return Array.from(this.users.values());
  }

  delete(id: number): boolean {
    return this.users.delete(id);
  }
}

// HTTP 服务器
import { createServer, IncomingMessage, ServerResponse } from 'node:http';
import { URL } from 'node:url';

const userService = new UserService();

// 预填充数据
userService.create('Alice', 'alice@example.com');
userService.create('Bob', 'bob@example.com');

const server = createServer((req: IncomingMessage, res: ServerResponse) => {
  const url = new URL(req.url || '/', `http://${req.headers.host}`);

  // 设置 CORS 头
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');

  // 路由处理
  if (url.pathname === '/users' && req.method === 'GET') {
    const response: ApiResponse<User[]> = {
      data: userService.findAll(),
      status: 200,
      timestamp: new Date().toISOString()
    };
    res.writeHead(200);
    res.end(JSON.stringify(response));
    return;
  }

  if (url.pathname === '/users' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { name, email } = JSON.parse(body);
        const user = userService.create(name, email);
        const response: ApiResponse<User> = {
          data: user,
          status: 201,
          timestamp: new Date().toISOString()
        };
        res.writeHead(201);
        res.end(JSON.stringify(response));
      } catch (e) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Invalid request body' }));
      }
    });
    return;
  }

  if (url.pathname.startsWith('/users/') && req.method === 'GET') {
    const id = parseInt(url.pathname.split('/')[2], 10);
    const user = userService.findById(id);

    if (user) {
      const response: ApiResponse<User> = {
        data: user,
        status: 200,
        timestamp: new Date().toISOString()
      };
      res.writeHead(200);
      res.end(JSON.stringify(response));
    } else {
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'User not found' }));
    }
    return;
  }

  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Not found' }));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`TypeScript server running on port ${PORT}`);
  console.log('Mode:', process.isTypescript ? 'TypeScript (native)' : 'JavaScript');
});
```

**package.json 配置：**

```json
{
  "name": "ts-node-app",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "node --experimental-strip-types --watch server.ts",
    "start": "node --experimental-strip-types server.ts",
    "typecheck": "tsc --noEmit"
  },
  "devDependencies": {
    "@types/node": "^24.0.0",
    "typescript": "^5.5.0"
  }
}
```

**tsconfig.json：**

```json
{
  "compilerOptions": {
    "target": "ES2024",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**类型导入导出示例：**

```typescript
// types/index.ts
export interface Config {
  port: number;
  host: string;
  database: DatabaseConfig;
}

export interface DatabaseConfig {
  url: string;
  poolSize: number;
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export enum Status {
  Pending = 'pending',
  Active = 'active',
  Inactive = 'inactive'
}

// utils/logger.ts
import { LogLevel } from '../types/index.ts';

export class Logger {
  constructor(private level: LogLevel = 'info') {}

  log(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    if (levels.indexOf(level) >= levels.indexOf(this.level)) {
      console.log(`[${level.toUpperCase()}] ${message}`, meta || '');
    }
  }

  debug(msg: string, meta?: Record<string, unknown>) {
    this.log('debug', msg, meta);
  }

  info(msg: string, meta?: Record<string, unknown>) {
    this.log('info', msg, meta);
  }

  warn(msg: string, meta?: Record<string, unknown>) {
    this.log('warn', msg, meta);
  }

  error(msg: string, meta?: Record<string, unknown>) {
    this.log('error', msg, meta);
  }
}
```

### 适用场景

- 快速原型开发，无需构建步骤
- 小型项目，不需要复杂的构建管道
- 学习和教学环境
- 脚本和工具开发

### 注意事项

- `--experimental-strip-types` 是实验性功能，API 可能变化
- 不支持需要类型信息的特性（如装饰器、const enum）
- 类型错误不会阻止运行，需要配合 `tsc --noEmit` 检查
- 性能略低于预编译的 JavaScript
- 某些 IDE 可能不支持直接运行 .ts 文件的调试

---

## 8. 改进的 ESM 支持

### 概念解释

Node.js 24 进一步增强了 ES Module 支持：

- `import.meta.dirname`：当前文件所在目录（替代 `__dirname`）
- `import.meta.filename`：当前文件完整路径（替代 `__filename`）
- 更好的 JSON 导入
- 支持 `import.meta.resolve()`
- 改进的循环依赖处理

### 实战案例

```javascript
// esm-demo.mjs
/**
 * ESM 模块演示
 * 使用 Node.js 24 的 import.meta 增强功能
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// Node.js 24: 直接使用 import.meta.dirname / filename
// 无需 fileURLToPath 转换
console.log('=== ESM 路径信息 ===');
console.log('import.meta.url:', import.meta.url);
console.log('import.meta.filename:', import.meta.filename);  // Node 24+
console.log('import.meta.dirname:', import.meta.dirname);    // Node 24+

// 对比旧方式
const oldFilename = fileURLToPath(import.meta.url);
const oldDirname = path.dirname(oldFilename);
console.log('\n旧方式 filename:', oldFilename);
console.log('旧方式 dirname:', oldDirname);

// 读取 package.json
const pkgPath = path.join(import.meta.dirname, 'package.json');
try {
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
  console.log('\nPackage name:', pkg.name);
} catch {
  console.log('\npackage.json not found');
}

// import.meta.resolve - 解析模块路径
console.log('\n=== 模块解析 ===');
const resolvedPath = import.meta.resolve('node:fs');
console.log('node:fs resolves to:', resolvedPath);

// 解析相对路径
const relativeResolved = import.meta.resolve('./utils/helper.mjs', import.meta.url);
console.log('./utils/helper.mjs resolves to:', relativeResolved);

// 条件导出解析
const conditionalResolved = import.meta.resolve('#config', import.meta.url);
console.log('#config resolves to:', conditionalResolved);
```

```json
// package.json (ESM 配置)
{
  "name": "esm-demo",
  "version": "1.0.0",
  "type": "module",
  "exports": {
    ".": "./index.mjs",
    "./utils": "./utils/index.mjs"
  },
  "imports": {
    "#config": "./config/default.mjs",
    "#utils/*": "./utils/*.mjs"
  }
}
```

```javascript
// utils/helper.mjs
/**
 * ESM 工具函数
 */

// 动态导入（条件加载）
export async function loadConfig(env = 'development') {
  const configModule = await import(`../config/${env}.mjs`);
  return configModule.default || configModule;
}

// 使用 import.meta.resolve 解析资源
export function resolveAsset(assetPath) {
  return import.meta.resolve(`../assets/${assetPath}`, import.meta.url);
}

// 模块信息工具
export function getModuleInfo() {
  return {
    filename: import.meta.filename,
    dirname: import.meta.dirname,
    url: import.meta.url
  };
}

// 顶层 await 示例
const initData = await Promise.resolve({ initialized: true, timestamp: Date.now() });
export { initData };
```

```javascript
// config/default.mjs
export default {
  port: 3000,
  host: 'localhost',
  database: {
    url: 'postgresql://localhost:5432/myapp'
  }
};
```

```javascript
// index.mjs
/**
 * ESM 主入口
 */
import { loadConfig, getModuleInfo, initData } from './utils/helper.mjs';

console.log('模块信息:', getModuleInfo());
console.log('初始化数据:', initData);

const config = await loadConfig(process.env.NODE_ENV);
console.log('配置:', config);

// 命名空间导入
import * as fs from 'node:fs';
console.log('fs 模块方法数:', Object.keys(fs).length);

// 同时导入默认和命名导出
import { default as myDefault, named1, named2 } from './utils/helper.mjs';

// JSON 导入（Node 24 稳定支持）
import pkg from './package.json' assert { type: 'json' };
console.log('从 JSON 导入:', pkg.name);
```

**CommonJS 与 ESM 互操作：**

```javascript
// cjs-compat.mjs
/**
 * 在 ESM 中使用 CommonJS 模块
 */

// 方法 1: createRequire
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

// 现在可以使用 require
const cjsModule = require('./legacy-module.cjs');
console.log('CJS module:', cjsModule);

// 方法 2: 直接导入 CJS（Node 24 改进）
import cjsDefault from './legacy-module.cjs';
console.log('CJS default:', cjsDefault);

// 方法 3: 使用 module.createRequire 的替代
const pkg = require('./package.json');
console.log('Package:', pkg.name);
```

```javascript
// legacy-module.cjs
// CommonJS 模块
module.exports = {
  greeting: 'Hello from CJS',
  calculate: (a, b) => a + b
};
```

### 适用场景

- 新项目首选模块系统
- 需要 tree-shaking 的库开发
- 浏览器/Node.js 同构代码
- 使用顶层 await 的初始化逻辑

### 注意事项

- 文件扩展名必须是 `.mjs` 或在 `"type": "module"` 的 package.json 中使用 `.js`
- `require()` 在纯 ESM 中不可用，使用 `createRequire`
- `__dirname` 和 `__filename` 不存在，使用 `import.meta.dirname/filename`
- 循环依赖的行为与 CJS 不同
- 某些 npm 包可能不完全兼容 ESM

---

## 9. util.parseArgs

### 概念解释

`util.parseArgs` 是 Node.js 原生的命令行参数解析器：

- 无需安装 `commander`、`yargs` 等包
- 支持选项、位置参数、默认值
- 类型安全的解析
- 自动生成帮助信息

### 实战案例

```javascript
// cli-tool.js
const { parseArgs } = require('node:util');
const fs = require('node:fs');
const path = require('node:path');

/**
 * 使用 util.parseArgs 构建 CLI 工具
 */

// 定义 CLI 配置
const CLI_CONFIG = {
  options: {
    // 字符串选项
    input: {
      type: 'string',
      short: 'i',
      description: '输入文件路径'
    },
    output: {
      type: 'string',
      short: 'o',
      description: '输出文件路径',
      default: './output.txt'
    },
    format: {
      type: 'string',
      short: 'f',
      description: '输出格式 (json, csv, txt)',
      default: 'txt'
    },

    // 布尔选项
    verbose: {
      type: 'boolean',
      short: 'v',
      description: '显示详细输出',
      default: false
    },
    help: {
      type: 'boolean',
      short: 'h',
      description: '显示帮助信息'
    },
    version: {
      type: 'boolean',
      description: '显示版本号'
    },

    // 数值选项
    port: {
      type: 'string',  // parseArgs 只支持 string/boolean，数值需要手动转换
      short: 'p',
      description: '服务器端口',
      default: '3000'
    },

    // 多值选项
    include: {
      type: 'string',
      short: 'I',
      multiple: true,  // 允许重复
      description: '包含的文件模式',
      default: []
    }
  },

  // 位置参数
  allowPositionals: true,

  // 严格模式：未知选项报错
  strict: true
};

/**
 * 生成帮助信息
 */
function generateHelp() {
  const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf-8'));

  console.log(`${pkg.name} v${pkg.version}`);
  console.log(`\n用法: ${pkg.name} [选项] <命令>\n`);
  console.log('命令:');
  console.log('  process     处理文件');
  console.log('  serve       启动服务器');
  console.log('  convert     转换格式\n');
  console.log('选项:');

  const options = CLI_CONFIG.options;
  const maxLength = Math.max(...Object.keys(options).map(k => k.length)) + 4;

  for (const [name, config] of Object.entries(options)) {
    const short = config.short ? `-${config.short}, ` : '    ';
    const long = `--${name}`;
    const padding = ' '.repeat(Math.max(1, maxLength - long.length));
    const multiple = config.multiple ? ' (可重复)' : '';
    const defaultValue = config.default !== undefined ? ` [默认: ${config.default}]` : '';

    console.log(`  ${short}${long}${padding}${config.description}${multiple}${defaultValue}`);
  }

  console.log('\n示例:');
  console.log(`  ${pkg.name} process -i data.json -o result.csv -f csv`);
  console.log(`  ${pkg.name} serve -p 8080 -v`);
  console.log(`  ${pkg.name} convert -i input.txt -I '*.md' -I '*.txt'`);
}

/**
 * 解析并验证参数
 */
function parseCliArgs() {
  try {
    const { values, positionals } = parseArgs(CLI_CONFIG);

    // 显示帮助
    if (values.help) {
      generateHelp();
      process.exit(0);
    }

    // 显示版本
    if (values.version) {
      const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf-8'));
      console.log(pkg.version);
      process.exit(0);
    }

    // 验证必需参数
    if (positionals.length === 0) {
      console.error('错误: 请提供命令');
      generateHelp();
      process.exit(1);
    }

    // 验证命令
    const validCommands = ['process', 'serve', 'convert'];
    const command = positionals[0];
    if (!validCommands.includes(command)) {
      console.error(`错误: 未知命令 "${command}"`);
      process.exit(1);
    }

    // 验证格式选项
    if (values.format && !['json', 'csv', 'txt'].includes(values.format)) {
      console.error(`错误: 不支持的格式 "${values.format}"`);
      process.exit(1);
    }

    // 验证输入文件存在
    if (values.input && !fs.existsSync(values.input)) {
      console.error(`错误: 输入文件不存在 "${values.input}"`);
      process.exit(1);
    }

    return {
      command,
      options: {
        ...values,
        port: parseInt(values.port, 10),  // 字符串转数值
        include: values.include || []
      },
      args: positionals.slice(1)
    };
  } catch (e) {
    if (e.code === 'ERR_PARSE_ARGS_UNKNOWN_OPTION') {
      console.error(`错误: ${e.message}`);
      console.error('使用 --help 查看可用选项');
    } else {
      console.error('参数解析错误:', e.message);
    }
    process.exit(1);
  }
}

/**
 * 命令实现
 */
const commands = {
  process(options) {
    console.log('处理文件...');
    console.log('输入:', options.input);
    console.log('输出:', options.output);
    console.log('格式:', options.format);

    if (options.verbose) {
      console.log('详细模式已启用');
      console.log('包含模式:', options.include);
    }

    // 模拟处理
    const result = { processed: true, timestamp: new Date().toISOString() };
    fs.writeFileSync(options.output, JSON.stringify(result, null, 2));
    console.log('处理完成:', options.output);
  },

  serve(options) {
    const http = require('node:http');
    const server = http.createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'running', port: options.port }));
    });

    server.listen(options.port, () => {
      console.log(`服务器运行在 http://localhost:${options.port}`);
    });
  },

  convert(options, args) {
    console.log('转换文件...');
    console.log('目标格式:', options.format);
    console.log('额外参数:', args);
  }
};

/**
 * 主入口
 */
function main() {
  const parsed = parseCliArgs();

  if (parsed.options.verbose) {
    console.log('解析结果:', JSON.stringify(parsed, null, 2));
    console.log();
  }

  const handler = commands[parsed.command];
  if (handler) {
    handler(parsed.options, parsed.args);
  }
}

main();
```

**package.json 配置：**

```json
{
  "name": "cli-tool",
  "version": "1.0.0",
  "bin": {
    "cli-tool": "./cli-tool.js"
  },
  "scripts": {
    "cli": "node cli-tool.js"
  }
}
```

**使用示例：**

```bash
# 显示帮助
node cli-tool.js --help

# 处理文件
node cli-tool.js process -i data.json -o result.csv -f csv -v

# 启动服务器
node cli-tool.js serve -p 8080

# 多值选项
node cli-tool.js convert -i input.txt -I '*.md' -I '*.txt' -I '*.js'

# 错误用法（会显示友好错误）
node cli-tool.js process --unknown-option
```

### 适用场景

- CLI 工具开发
- 构建脚本
- 自动化工具
- 替代简单的 shell 脚本

### 注意事项

- `type` 只支持 `string` 和 `boolean`，数值需要手动转换
- `multiple: true` 返回数组，否则返回单个值
- 布尔选项不需要值：`--verbose` 即为 true
- 严格模式下未知选项会抛出错误
- 相比 commander/yargs，功能较基础，复杂 CLI 仍可能需要第三方库

---

## 10. Web Crypto API 对齐

### 概念解释

Node.js 24 进一步对齐了 Web Crypto API，使得浏览器和 Node.js 的加密代码可以共享：

- `crypto.subtle` 接口
- 支持 `AES-GCM`、`RSA-OAEP`、`ECDSA` 等算法
- 与 `crypto` 模块互补（Web Crypto 用于标准操作，node:crypto 用于高级操作）

### 实战案例

```javascript
// web-crypto-demo.js
/**
 * Web Crypto API 实战
 * 与浏览器兼容的加密接口
 */

const { subtle } = globalThis.crypto;

/**
 * 文本编解码工具
 */
const encoder = new TextEncoder();
const decoder = new TextDecoder();

function encode(str) {
  return encoder.encode(str);
}

function decode(buffer) {
  return decoder.decode(buffer);
}

/**
 * 生成 AES-GCM 密钥
 */
async function generateAESKey() {
  return subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256
    },
    true,  // 可导出
    ['encrypt', 'decrypt']
  );
}

/**
 * AES-GCM 加密
 */
async function encryptAES(plaintext, key) {
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const ciphertext = await subtle.encrypt(
    {
      name: 'AES-GCM',
      iv
    },
    key,
    encode(plaintext)
  );

  return {
    ciphertext: Buffer.from(ciphertext).toString('base64'),
    iv: Buffer.from(iv).toString('base64')
  };
}

/**
 * AES-GCM 解密
 */
async function decryptAES(encryptedData, key) {
  const ciphertext = Buffer.from(encryptedData.ciphertext, 'base64');
  const iv = Buffer.from(encryptedData.iv, 'base64');

  const decrypted = await subtle.decrypt(
    {
      name: 'AES-GCM',
      iv
    },
    key,
    ciphertext
  );

  return decode(decrypted);
}

/**
 * 生成 RSA 密钥对
 */
async function generateRSAKeyPair() {
  return subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256'
    },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * RSA 加密
 */
async function encryptRSA(plaintext, publicKey) {
  const ciphertext = await subtle.encrypt(
    {
      name: 'RSA-OAEP'
    },
    publicKey,
    encode(plaintext)
  );

  return Buffer.from(ciphertext).toString('base64');
}

/**
 * RSA 解密
 */
async function decryptRSA(ciphertextBase64, privateKey) {
  const ciphertext = Buffer.from(ciphertextBase64, 'base64');

  const decrypted = await subtle.decrypt(
    {
      name: 'RSA-OAEP'
    },
    privateKey,
    ciphertext
  );

  return decode(decrypted);
}

/**
 * 生成 ECDSA 密钥对（用于签名）
 */
async function generateECDSAKeyPair() {
  return subtle.generateKey(
    {
      name: 'ECDSA',
      namedCurve: 'P-256'
    },
    true,
    ['sign', 'verify']
  );
}

/**
 * ECDSA 签名
 */
async function signData(data, privateKey) {
  const signature = await subtle.sign(
    {
      name: 'ECDSA',
      hash: 'SHA-256'
    },
    privateKey,
    encode(data)
  );

  return Buffer.from(signature).toString('base64');
}

/**
 * ECDSA 验证签名
 */
async function verifySignature(data, signatureBase64, publicKey) {
  const signature = Buffer.from(signatureBase64, 'base64');

  return subtle.verify(
    {
      name: 'ECDSA',
      hash: 'SHA-256'
    },
    publicKey,
    signature,
    encode(data)
  );
}

/**
 * SHA-256 哈希
 */
async function sha256(data) {
  const hashBuffer = await subtle.digest('SHA-256', encode(data));
  return Buffer.from(hashBuffer).toString('hex');
}

/**
 * PBKDF2 密钥派生
 */
async function deriveKey(password, salt) {
  const keyMaterial = await subtle.importKey(
    'raw',
    encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encode(salt),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    {
      name: 'AES-GCM',
      length: 256
    },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * 导出/导入密钥（用于持久化）
 */
async function exportKey(key) {
  const exported = await subtle.exportKey('jwk', key);
  return JSON.stringify(exported);
}

async function importAESKey(jwkString) {
  const jwk = JSON.parse(jwkString);
  return subtle.importKey(
    'jwk',
    jwk,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

// 实战案例：完整的加密通信演示
async function secureCommunicationDemo() {
  console.log('=== Web Crypto API 演示 ===\n');

  // 1. 对称加密 (AES-GCM)
  console.log('1. AES-GCM 对称加密');
  const aesKey = await generateAESKey();
  const secretMessage = 'Hello, Web Crypto!';

  const encrypted = await encryptAES(secretMessage, aesKey);
  console.log('加密结果:', encrypted);

  const decrypted = await decryptAES(encrypted, aesKey);
  console.log('解密结果:', decrypted);
  console.log('验证:', decrypted === secretMessage ? '通过' : '失败');

  // 2. 非对称加密 (RSA-OAEP)
  console.log('\n2. RSA-OAEP 非对称加密');
  const rsaKeyPair = await generateRSAKeyPair();
  const sensitiveData = 'Sensitive information';

  const rsaEncrypted = await encryptRSA(sensitiveData, rsaKeyPair.publicKey);
  console.log('RSA 加密:', rsaEncrypted.substring(0, 50) + '...');

  const rsaDecrypted = await decryptRSA(rsaEncrypted, rsaKeyPair.privateKey);
  console.log('RSA 解密:', rsaDecrypted);

  // 3. 数字签名 (ECDSA)
  console.log('\n3. ECDSA 数字签名');
  const ecdsaKeyPair = await generateECDSAKeyPair();
  const document = 'Important document content';

  const signature = await signData(document, ecdsaKeyPair.privateKey);
  console.log('签名:', signature.substring(0, 50) + '...');

  const isValid = await verifySignature(document, signature, ecdsaKeyPair.publicKey);
  console.log('签名验证:', isValid ? '有效' : '无效');

  // 篡改数据后验证
  const isTamperedValid = await verifySignature(
    'Tampered content',
    signature,
    ecdsaKeyPair.publicKey
  );
  console.log('篡改后验证:', isTamperedValid ? '有效' : '无效（预期）');

  // 4. 哈希
  console.log('\n4. SHA-256 哈希');
  const hash = await sha256('Hello World');
  console.log('哈希:', hash);

  // 5. 密码派生
  console.log('\n5. PBKDF2 密钥派生');
  const password = 'user-password';
  const salt = 'random-salt-value';
  const derivedKey = await deriveKey(password, salt);

  const derivedEncrypted = await encryptAES('Password derived key test', derivedKey);
  console.log('派生密钥加密成功');

  // 6. 密钥导出/导入
  console.log('\n6. 密钥导出/导入');
  const exportedKey = await exportKey(aesKey);
  console.log('导出密钥长度:', exportedKey.length);

  const importedKey = await importAESKey(exportedKey);
  const reEncrypted = await encryptAES('Test with imported key', importedKey);
  console.log('导入密钥加密成功');
}

// 实战案例：与浏览器共享的 JWT 工具
async function createJWT(payload, secret) {
  const header = { alg: 'HS256', typ: 'JWT' };

  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;

  const key = await subtle.importKey(
    'raw',
    encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await subtle.sign(
    'HMAC',
    key,
    encode(signingInput)
  );

  const encodedSignature = Buffer.from(signature).toString('base64url');

  return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
}

// 运行演示
secureCommunicationDemo().catch(console.error);

module.exports = {
  generateAESKey,
  encryptAES,
  decryptAES,
  generateRSAKeyPair,
  encryptRSA,
  decryptRSA,
  generateECDSAKeyPair,
  signData,
  verifySignature,
  sha256,
  deriveKey,
  createJWT
};
```

### 适用场景

- 需要浏览器和 Node.js 共享加密代码的项目
- 使用标准 Web API 的跨平台库
- 需要 FIPS 合规的场景（Web Crypto 经过严格审计）
- 避免 `node:crypto` 模块的平台差异

### 注意事项

- Web Crypto 是异步 API，所有操作返回 Promise
- 某些算法在 Node.js 和浏览器中的支持可能不同
- 大数据量加密时性能可能不如 `node:crypto`
- `crypto.getRandomValues()` 是同步的，但仅用于生成随机数
- 密钥导出使用 JWK 格式，与 `node:crypto` 的格式不同

---

## 总结

| 特性 | 关键优势 | 使用场景 |
|------|----------|----------|
| `node:test` | 零依赖测试框架 | 替代 jest/mocha |
| `node --watch` | 原生文件监视 | 开发环境热重载 |
| `--permission` | 运行时权限控制 | 安全沙箱 |
| Performance Hooks | 精确性能测量 | 性能监控分析 |
| AbortController | 标准取消机制 | 请求超时控制 |
| SEA | 单文件分发 | CLI 工具打包 |
| TypeScript 支持 | 免编译运行 | 快速原型开发 |
| ESM 增强 | `import.meta.dirname` | 现代模块系统 |
| `util.parseArgs` | 原生参数解析 | CLI 工具开发 |
| Web Crypto | 浏览器兼容加密 | 跨平台加密 |

Node.js 24+ 的发展方向是：

1. **减少外部依赖**：内置更多常用功能
2. **安全增强**：权限模型、安全默认值
3. **开发者体验**：Watch 模式、TypeScript 支持
4. **标准对齐**：Web API 兼容性
5. **部署简化**：SEA 单文件打包

建议在新项目中优先使用这些原生特性，减少对第三方包的依赖。
