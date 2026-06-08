# Node.js 调试技巧实战（Node.js 24+）

> 本文档基于 Node.js 24+ 版本，涵盖从日常开发到深度诊断的全套调试技巧。

---

## 目录

1. [内置调试工具](#1-内置调试工具)
2. [断点调试技巧](#2-断点调试技巧)
3. [日志调试](#3-日志调试)
4. [核心转储分析](#4-核心转储分析)
5. [Heap Snapshot 分析](#5-heap-snapshot-分析)
6. [CPU Profile 分析](#6-cpu-profile-分析)
7. [网络调试](#7-网络调试)

---

## 1. 内置调试工具

### 1.1 `node inspect` 命令行调试器

Node.js 内置了基于命令行的调试器，无需任何额外安装即可使用。

```bash
# 启动调试模式
node inspect app.js

# 调试时传入参数
node inspect app.js --port 3000

# 远程调试（连接到已运行的调试进程）
node inspect 127.0.0.1:9229
```

**常用调试命令：**

| 命令 | 简写 | 作用 |
|------|------|------|
| `cont` | `c` | 继续执行 |
| `next` | `n` | 单步跳过（不进入函数） |
| `step` | `s` | 单步进入 |
| `out` | `o` | 跳出当前函数 |
| `pause` | | 暂停执行 |
| `setBreakpoint(10)` | `sb(10)` | 在第10行设置断点 |
| `clearBreakpoint('app.js', 10)` | `cb(...)` | 清除断点 |
| `watch('expr')` | | 监视表达式 |
| `repl` | | 进入交互式求值模式 |
| `list(5)` | | 显示当前行前后5行代码 |

**实战案例：**

```javascript
// debug-example.js
function calculateFactorial(n) {
  if (n <= 1) return 1;
  return n * calculateFactorial(n - 1);
}

function processData(items) {
  const results = [];
  for (const item of items) {
    const factorial = calculateFactorial(item);
    results.push({ item, factorial });
  }
  return results;
}

const data = [3, 5, 7];
const output = processData(data);
console.log(output);
```

```bash
$ node inspect debug-example.js
< Debugger listening on ws://127.0.0.1:9229/...
< For help, see: https://nodejs.org/en/docs/inspector
<
connecting to 127.0.0.1:9229 ... ok
< Debugger attached.

break in debug-example.js:1
> 1  function calculateFactorial(n) {
  2    if (n <= 1) return 1;
  3    return n * calculateFactorial(n - 1);
debug> sb(12)        # 在第12行设置断点
debug> c             # 继续执行到断点
break in debug-example.js:12
  10   const data = [3, 5, 7];
  11   const output = processData(data);
> 12   console.log(output);
  13 }
debug> repl          # 进入 REPL 查看变量
> output
[ { item: 3, factorial: 6 }, { item: 5, factorial: 120 }, { item: 7, factorial: 5040 } ]
debug> watch('output.length')   # 监视表达式
debug> c
```

### 1.2 `--inspect` / `--inspect-brk` 配合 Chrome DevTools

```bash
# 启动 Inspector，等待外部调试器连接（默认端口 9229）
node --inspect app.js

# 启动后立刻在第一行断住（适合启动时调试）
node --inspect-brk app.js

# 指定端口
node --inspect=0.0.0.0:9229 app.js

# 在 Docker 中使用（绑定到所有接口）
node --inspect=0.0.0.0:9229 --inspect-brk app.js
```

**连接方式：**

1. **Chrome DevTools**：在 Chrome 地址栏输入 `chrome://inspect`，点击 "Open dedicated DevTools for Node"
2. **VS Code**：配置 `attach` 模式
3. **命令行**：`node inspect 127.0.0.1:9229`

**Node.js 24 新特性：**

```bash
# 使用 --inspect-publish-uid 控制广播行为
node --inspect --inspect-publish-uid=http app.js

# 使用 --inspect-wait 替代 --inspect-brk（语义更清晰）
node --inspect-wait app.js
```

### 1.3 VS Code 调试配置

**完整的 `launch.json` 配置示例：**

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Launch Program",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/app.js",
      "env": {
        "NODE_ENV": "development"
      },
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen",
      "skipFiles": ["<node_internals>/**"]
    },
    {
      "name": "Launch with Nodemon",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "nodemon",
      "program": "${workspaceFolder}/app.js",
      "restart": true,
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen",
      "env": {
        "NODE_ENV": "development"
      }
    },
    {
      "name": "Attach to Process",
      "type": "node",
      "request": "attach",
      "port": 9229,
      "address": "localhost",
      "localRoot": "${workspaceFolder}",
      "remoteRoot": "/app",
      "skipFiles": ["<node_internals>/**"]
    },
    {
      "name": "Attach to Docker",
      "type": "node",
      "request": "attach",
      "port": 9229,
      "address": "localhost",
      "localRoot": "${workspaceFolder}",
      "remoteRoot": "/app",
      "sourceMapPathOverrides": {
        "webpack:///./*": "${webRoot}/*"
      }
    },
    {
      "name": "Debug Tests",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": ["--runInBand", "--no-cache"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen",
      "env": {
        "NODE_ENV": "test"
      }
    },
    {
      "name": "Debug Current Test File",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": ["${relativeFile}", "--runInBand", "--no-cache"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    },
    {
      "name": "Debug with Heap Snapshot",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/app.js",
      "runtimeArgs": [
        "--heapsnapshot-near-heap-limit=3",
        "--max-old-space-size=512"
      ],
      "env": {
        "NODE_ENV": "development"
      }
    }
  ]
}
```

### 1.4 `console` 高级用法

```javascript
// console.table - 表格化输出数组/对象
const users = [
  { id: 1, name: 'Alice', role: 'admin', active: true },
  { id: 2, name: 'Bob', role: 'user', active: false },
  { id: 3, name: 'Charlie', role: 'user', active: true }
];
console.table(users);

// 只显示指定列
console.table(users, ['name', 'role']);

// console.time / timeEnd - 测量代码执行时间
console.time('database-query');
await db.query('SELECT * FROM users WHERE active = ?', [true]);
console.timeEnd('database-query');
// 输出: database-query: 45.231ms

// console.timeLog - 中间计时（不结束计时器）
console.time('process');
await step1();
console.timeLog('process', 'step1 completed');  // 输出当前耗时
await step2();
console.timeEnd('process');

// console.trace - 打印调用栈
function deepFunction() {
  console.trace('追踪调用路径');
}
function middleFunction() {
  deepFunction();
}
middleFunction();
// 输出:
// 追踪调用路径
//     at deepFunction (file.js:3:11)
//     at middleFunction (file.js:6:3)
//     at Object.<anonymous> (file.js:8:1)

// console.group - 分组输出
console.group('用户认证流程');
console.log('1. 接收请求');
console.log('2. 验证 Token');
console.groupCollapsed('Token 详情');  // 默认折叠的分组
console.log('header: {...}');
console.log('payload: {...}');
console.groupEnd();
console.log('3. 查询用户');
console.log('4. 返回结果');
console.groupEnd();

// console.assert - 条件断言（条件为 false 时输出）
console.assert(user.age >= 18, '用户未满18岁:', user);

// console.count / countReset - 计数器
function handleRequest(req) {
  console.count('请求处理');
  // ... 处理逻辑
}
handleRequest();  // 请求处理: 1
handleRequest();  // 请求处理: 2
console.countReset('请求处理');

// console.dir - 深度查看对象（可配置 depth）
const complexObj = {
  a: { b: { c: { d: { e: 'deep' } } } },
  [Symbol('hidden')]: 'secret'
};
console.dir(complexObj, { depth: null, showHidden: true });
```

### 1.5 `util.inspect` 深度对象检查

```javascript
import util from 'util';

const obj = {
  name: 'server',
  config: {
    port: 3000,
    database: {
      host: 'localhost',
      pool: {
        min: 2,
        max: 10,
        options: { timeout: 30000, retry: 3 }
      }
    }
  },
  [Symbol('internal')]: 'hidden value',
  circular: null
};
obj.circular = obj;  // 循环引用

// 基础用法
console.log(util.inspect(obj));

// 高级配置
const inspected = util.inspect(obj, {
  showHidden: true,        // 显示不可枚举和 Symbol 属性
  depth: null,             // 无限制递归深度（默认 2）
  colors: true,            // ANSI 颜色
  compact: false,          // 多行格式化
  breakLength: 80,         // 换行宽度
  sorted: true,            // 按键排序
  getters: true,           // 调用 getter
  numericSeparator: true   // 数字千分位分隔符
});
console.log(inspected);

// 自定义对象的 inspect 方法
class CustomLogger {
  constructor(level) {
    this.level = level;
    this.buffer = [];
  }

  [util.inspect.custom](depth, options) {
    return `CustomLogger { level: '${this.level}', buffered: ${this.buffer.length} }`;
  }
}

const logger = new CustomLogger('debug');
console.log(logger);  // CustomLogger { level: 'debug', buffered: 0 }
```

**实战案例：自定义日志格式化器**

```javascript
// inspect-helper.js
import util from 'util';
import { createHash } from 'crypto';

/**
 * 安全地打印对象，隐藏敏感字段
 */
export function safeInspect(obj, sensitiveFields = ['password', 'token', 'secret', 'key']) {
  const maskValue = (key, value) => {
    if (sensitiveFields.some(f => key.toLowerCase().includes(f))) {
      return typeof value === 'string' && value.length > 8
        ? value.slice(0, 3) + '***' + value.slice(-3)
        : '***';
    }
    return value;
  };

  const replacer = (key, value) => {
    if (value && typeof value === 'object') {
      const masked = {};
      for (const [k, v] of Object.entries(value)) {
        masked[k] = maskValue(k, v);
      }
      return masked;
    }
    return maskValue(key, value);
  };

  return util.inspect(JSON.parse(JSON.stringify(obj, replacer)), {
    colors: true,
    depth: null,
    compact: false
  });
}

// 使用示例
const request = {
  username: 'alice',
  password: 'superSecret123!',
  apiKey: 'sk-abc123xyz789',
  profile: {
    email: 'alice@example.com',
    secretQuestion: '我的第一只宠物名字'
  }
};

console.log(safeInspect(request));
```

---

## 2. 断点调试技巧

### 2.1 条件断点

在 VS Code 或 Chrome DevTools 中，可以设置只在特定条件满足时才触发的断点。

**代码内联条件断点（Node.js 24+）：**

```javascript
// 使用 debugger 语句配合条件
function processOrders(orders) {
  for (const order of orders) {
    if (order.amount > 10000) {
      debugger;  // 只在金额大于10000时断住
    }
    // 处理订单...
  }
}
```

**VS Code 条件断点设置：**

在编辑器行号左侧右键，选择 "Add Conditional Breakpoint"，输入条件表达式：

```javascript
// 条件表达式示例：
user.id === 42
error && error.code === 'ECONNREFUSED'
items.length > 100
Date.now() - startTime > 5000
```

**实战案例：**

```javascript
// conditional-breakpoint.js
class OrderProcessor {
  constructor() {
    this.processed = 0;
    this.errors = [];
  }

  async processOrder(order) {
    // 在 VS Code 中设置条件断点：order.amount > 5000 && order.status === 'pending'
    console.log(`Processing order #${order.id}`);

    try {
      if (order.amount > 10000) {
        await this.fraudCheck(order);
      }

      const result = await this.chargePayment(order);
      this.processed++;
      return result;
    } catch (error) {
      this.errors.push({ order: order.id, error: error.message });
      throw error;
    }
  }

  async fraudCheck(order) {
    // 模拟风控检查
    await new Promise(r => setTimeout(r, 100));
    return { risk: 'low' };
  }

  async chargePayment(order) {
    await new Promise(r => setTimeout(r, 50));
    return { success: true, transactionId: `tx-${Date.now()}` };
  }
}

// 测试数据
const orders = [
  { id: 1, amount: 100, status: 'pending' },
  { id: 2, amount: 8000, status: 'pending' },
  { id: 3, amount: 15000, status: 'pending' },  // 条件断点会在这里触发
  { id: 4, amount: 200, status: 'completed' },
  { id: 5, amount: 20000, status: 'pending' }   // 也会触发
];

const processor = new OrderProcessor();
for (const order of orders) {
  await processor.processOrder(order);
}
```

### 2.2 日志断点

日志断点（Logpoint）不会暂停程序执行，而是输出日志信息。在 VS Code 中右键行号选择 "Add Logpoint"。

```javascript
// 日志断点消息格式（VS Code）：
// 用户 {user.name} 尝试登录，IP: {req.ip}，时间: {new Date().toISOString()}

// 等效代码实现：
function login(req, res) {
  // [Logpoint] 用户 {req.body.username} 尝试登录
  const user = await User.findOne({ username: req.body.username });
  // [Logpoint] 查询结果: {user ? '找到用户' : '用户不存在'}

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  // ...
}
```

### 2.3 异常断点

**在 VS Code 中配置异常断点：**

1. 打开 "Run and Debug" 侧边栏
2. 在 "Breakpoints" 区域勾选：
   - `Uncaught Exceptions` - 未捕获的异常
   - `Caught Exceptions` - 所有被捕获的异常（包括 try/catch 中的）

**代码中动态设置异常断点：**

```javascript
// 使用 --throw-deprecation 等标志
node --throw-deprecation app.js      // 将弃用警告转为异常
node --trace-warnings app.js         // 追踪警告来源
node --trace-uncaught app.js         // 追踪未捕获异常

// 在代码中监听并断住
process.on('uncaughtException', (err) => {
  debugger;  // 异常时自动断住
  console.error('Uncaught:', err);
  process.exit(1);
});
```

### 2.4 异步调用栈追踪

Node.js 24 对异步调用栈的支持更加完善。

```javascript
// async-stack.js
import { AsyncLocalStorage } from 'async_hooks';

const asyncLocalStorage = new AsyncLocalStorage();

async function level3() {
  // 在 Chrome DevTools 中查看完整的异步调用栈
  const store = asyncLocalStorage.getStore();
  console.log('Context:', store);

  // 使用 Error 捕获异步栈（开发时）
  const stack = new Error('Async stack trace').stack;
  console.log(stack);
}

async function level2() {
  await new Promise(r => setTimeout(r, 10));
  await level3();
}

async function level1() {
  await level2();
}

// 运行并追踪
asyncLocalStorage.run({ requestId: 'req-123', userId: 42 }, async () => {
  await level1();
});
```

**启用完整异步栈追踪：**

```bash
# Node.js 24 默认支持 async stack traces
node --async-stack-traces app.js

# 使用 --trace-events 追踪异步事件
node --trace-events-enabled --trace-event-categories node.async_hooks app.js
```

**实战案例：完整的异步调试示例**

```javascript
// async-debug.js
import { AsyncLocalStorage } from 'async_hooks';

const requestStore = new AsyncLocalStorage();

// 模拟 Express 中间件
function middleware(req, res, next) {
  const context = {
    requestId: generateId(),
    startTime: Date.now(),
    path: req.path
  };
  requestStore.run(context, () => next());
}

// 模拟数据库查询
async function dbQuery(sql) {
  const context = requestStore.getStore();
  console.log(`[${context?.requestId}] Executing: ${sql}`);

  await new Promise(r => setTimeout(r, Math.random() * 100));

  if (Math.random() > 0.8) {
    // 在此处设置异常断点，可以查看完整的异步上下文
    throw new Error(`Query failed: ${sql}`);
  }

  return { rows: [] };
}

// 模拟服务层
async function getUserOrders(userId) {
  const orders = await dbQuery(`SELECT * FROM orders WHERE user_id = ${userId}`);
  const details = await Promise.all(
    orders.rows.map(o => getOrderDetails(o.id))
  );
  return details;
}

async function getOrderDetails(orderId) {
  return dbQuery(`SELECT * FROM order_items WHERE order_id = ${orderId}`);
}

// 模拟请求处理
async function handleRequest(req) {
  const context = requestStore.getStore();
  console.log(`[${context.requestId}] Handling ${req.path}`);

  try {
    const user = await dbQuery(`SELECT * FROM users WHERE id = ${req.userId}`);
    const orders = await getUserOrders(req.userId);
    return { user, orders };
  } catch (error) {
    // 断点在这里可以看到完整的异步调用链
    console.error(`[${context.requestId}] Error:`, error.message);
    throw error;
  }
}

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

// 运行测试
requestStore.run({ requestId: 'test-1', path: '/api/orders' }, async () => {
  try {
    await handleRequest({ path: '/api/orders', userId: 42 });
  } catch (e) {
    // 异常断点会在这里捕获
  }
});
```

---

## 3. 日志调试

### 3.1 结构化日志（Pino / Winston）

**Pino（高性能，推荐用于生产）：**

```javascript
// pino-logger.js
import pino from 'pino';

// 基础配置
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level(label) {
      return { level: label };
    },
    bindings(bindings) {
      return { pid: bindings.pid, host: bindings.hostname };
    }
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: ['password', '*.password', 'token', 'authorization', 'cookie'],
    remove: false  // 替换为 [Redacted] 而不是删除
  }
});

// 子 logger（带上下文）
const childLogger = logger.child({ component: 'user-service', version: '2.1.0' });

// 使用
childLogger.info({ userId: 123 }, '用户登录成功');
childLogger.warn({ latency: 2500 }, '请求延迟过高');
childLogger.error({ err: new Error('DB timeout') }, '数据库查询失败');

// 输出（JSON 格式，便于机器解析）：
// {"level":"info","time":"2024-01-15T08:30:00.000Z","pid":1234,"host":"server1","component":"user-service","version":"2.1.0","userId":123,"msg":"用户登录成功"}
```

**Winston（功能丰富，灵活性高）：**

```javascript
// winston-logger.js
import winston from 'winston';

const { combine, timestamp, json, errors, printf, colorize } = winston.format;

// 自定义格式
const customFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}]: ${message}`;
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`;
  }
  return msg;
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  defaultMeta: { service: 'api-gateway' },
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    json()
  ),
  transports: [
    // 文件传输
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    // 控制台（开发环境带颜色）
    new winston.transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: 'HH:mm:ss' }),
        customFormat
      )
    })
  ],
  // 未捕获的异常处理
  exceptionHandlers: [
    new winston.transports.File({ filename: 'logs/exceptions.log' })
  ],
  rejectionHandlers: [
    new winston.transports.File({ filename: 'logs/rejections.log' })
  ]
});

export default logger;
```

### 3.2 日志级别动态调整

```javascript
// dynamic-log-level.js
import pino from 'pino';

const logger = pino({ level: 'info' });

// 方法1：通过环境变量信号调整
process.on('SIGUSR2', () => {
  const currentLevel = logger.level;
  const newLevel = currentLevel === 'info' ? 'debug' : 'info';
  logger.level = newLevel;
  logger.info(`日志级别切换为: ${newLevel}`);
});

// 方法2：通过 HTTP 端点调整（带认证）
import http from 'http';

const server = http.createServer((req, res) => {
  if (req.url === '/admin/log-level' && req.method === 'POST') {
    // 实际使用需要添加认证！
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const { level } = JSON.parse(body);
      const validLevels = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'];

      if (validLevels.includes(level)) {
        logger.level = level;
        logger.info(`日志级别已调整为: ${level}`);
        res.writeHead(200);
        res.end(JSON.stringify({ success: true, level }));
      } else {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Invalid level' }));
      }
    });
    return;
  }

  // 业务逻辑...
  logger.debug('处理请求', { url: req.url });
  res.writeHead(200);
  res.end('OK');
});

// 方法3：使用 pino 的 transport 动态调整
import { workerData } from 'worker_threads';

const transport = pino.transport({
  target: 'pino-pretty',
  options: { colorize: true }
});

const dynamicLogger = pino({
  level: process.env.LOG_LEVEL || 'info'
}, transport);

// 导出带动态级别控制的 logger
export function setLogLevel(level) {
  dynamicLogger.level = level;
}

export function getLogLevel() {
  return dynamicLogger.level;
}

export { dynamicLogger as logger };
```

### 3.3 上下文追踪（AsyncLocalStorage / AsyncContext）

Node.js 24 引入了更完善的 AsyncContext API。

```javascript
// context-tracking.js
import { AsyncLocalStorage } from 'async_hooks';
import pino from 'pino';

const asyncLocalStorage = new AsyncLocalStorage();

// 基础 logger
const baseLogger = pino({ level: 'debug' });

// 包装 logger，自动注入上下文
export function getContextualLogger() {
  const store = asyncLocalStorage.getStore();
  if (store) {
    return baseLogger.child({
      requestId: store.requestId,
      userId: store.userId,
      traceId: store.traceId
    });
  }
  return baseLogger;
}

// Express 中间件：绑定上下文
export function contextMiddleware(req, res, next) {
  const context = {
    requestId: req.headers['x-request-id'] || generateId(),
    traceId: req.headers['x-trace-id'] || generateId(),
    userId: req.user?.id,
    startTime: process.hrtime.bigint()
  };

  // 将 requestId 返回给客户端
  res.setHeader('x-request-id', context.requestId);

  asyncLocalStorage.run(context, () => {
    const logger = getContextualLogger();
    logger.info({ method: req.method, path: req.path }, '请求开始');

    res.on('finish', () => {
      const duration = Number(process.hrtime.bigint() - context.startTime) / 1e6;
      logger.info({
        statusCode: res.statusCode,
        duration: `${duration.toFixed(2)}ms`
      }, '请求结束');
    });

    next();
  });
}

// 在业务代码中使用
export async function getUser(userId) {
  const logger = getContextualLogger();
  logger.debug({ userId }, '查询用户信息');

  try {
    const user = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
    logger.debug({ userId, found: !!user }, '查询完成');
    return user;
  } catch (error) {
    logger.error({ userId, error: error.message }, '查询失败');
    throw error;
  }
}

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
```

### 3.4 分布式追踪（Trace ID 传递）

```javascript
// distributed-tracing.js
import { AsyncLocalStorage } from 'async_hooks';
import { trace, context, propagation } from '@opentelemetry/api';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

// 初始化 OpenTelemetry（可选，用于完整的分布式追踪）
const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter({ url: 'http://jaeger:4318/v1/traces' })
});
sdk.start();

// 简化的 Trace ID 传递实现
class TraceContext {
  constructor() {
    this.storage = new AsyncLocalStorage();
  }

  runWithTrace(traceId, spanId, fn) {
    return this.storage.run({ traceId, spanId, parentSpanId: null }, fn);
  }

  getCurrentContext() {
    return this.storage.getStore();
  }

  // 生成 W3C Trace Context 格式的 header
  toHeaders() {
    const ctx = this.getCurrentContext();
    if (!ctx) return {};
    return {
      'traceparent': `00-${ctx.traceId}-${ctx.spanId}-01`,
      'tracestate': `node=24`
    };
  }

  // 从请求头解析 Trace Context
  static fromHeaders(headers) {
    const traceparent = headers['traceparent'];
    if (traceparent) {
      const [, traceId, spanId] = traceparent.split('-');
      return { traceId, spanId, parentSpanId: spanId };
    }
    return null;
  }
}

const traceContext = new TraceContext();

// HTTP 客户端：自动传递 Trace ID
export async function tracedFetch(url, options = {}) {
  const currentContext = traceContext.getCurrentContext();
  const headers = {
    ...options.headers,
    ...traceContext.toHeaders()
  };

  const logger = getContextualLogger();
  logger.debug({ url, traceId: currentContext?.traceId }, 'HTTP 请求');

  const response = await fetch(url, { ...options, headers });
  return response;
}

// Express 中间件
export function tracingMiddleware(req, res, next) {
  const incomingContext = TraceContext.fromHeaders(req.headers);
  const traceId = incomingContext?.traceId || generateTraceId();
  const spanId = generateSpanId();

  traceContext.runWithTrace(traceId, spanId, () => {
    const logger = getContextualLogger();
    logger.info({
      traceId,
      parentSpanId: incomingContext?.spanId,
      method: req.method,
      path: req.path
    }, '收到请求');

    // 将 traceparent 返回
    res.setHeader('traceparent', `00-${traceId}-${spanId}-01`);
    next();
  });
}

function generateTraceId() {
  return crypto.randomBytes(16).toString('hex');
}

function generateSpanId() {
  return crypto.randomBytes(8).toString('hex');
}

function getContextualLogger() {
  // 返回带上下文的 logger
  const ctx = traceContext.getCurrentContext();
  return console;  // 简化为 console，实际使用 pino
}
```

**实战案例：完整的日志系统**

```javascript
// complete-logging-system.js
import { AsyncLocalStorage } from 'async_hooks';
import pino from 'pino';
import pretty from 'pino-pretty';

// ==================== 配置 ====================
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const LOG_FORMAT = process.env.LOG_FORMAT || 'pretty';  // pretty | json

// ==================== Logger 工厂 ====================
function createLogger() {
  const transport = LOG_FORMAT === 'pretty'
    ? pretty({ colorize: true, translateTime: 'SYS:HH:MM:ss', ignore: 'pid,hostname' })
    : undefined;

  return pino({
    level: LOG_LEVEL,
    base: { service: 'api-server', version: '1.0.0' }
  }, transport);
}

const rootLogger = createLogger();

// ==================== 上下文存储 ====================
const requestContext = new AsyncLocalStorage();

// ==================== 上下文 Logger ====================
export function getLogger() {
  const ctx = requestContext.getStore();
  if (ctx) {
    return rootLogger.child({
      requestId: ctx.requestId,
      traceId: ctx.traceId,
      userId: ctx.userId
    });
  }
  return rootLogger;
}

// ==================== 中间件 ====================
export function loggingMiddleware(req, res, next) {
  const requestId = req.headers['x-request-id'] || generateId();
  const traceId = req.headers['x-trace-id'] || generateId();

  const context = {
    requestId,
    traceId,
    userId: req.user?.id,
    startTime: process.hrtime.bigint(),
    startTimeMs: Date.now()
  };

  res.setHeader('x-request-id', requestId);
  res.setHeader('x-trace-id', traceId);

  requestContext.run(context, () => {
    const logger = getLogger();
    logger.info({ method: req.method, path: req.url, ip: req.ip }, '-> 请求开始');

    res.on('finish', () => {
      const durationMs = Number(process.hrtime.bigint() - context.startTime) / 1e6;
      logger.info({
        statusCode: res.statusCode,
        durationMs: Math.round(durationMs * 100) / 100
      }, '<- 请求结束');
    });

    next();
  });
}

// ==================== 性能日志 ====================
export function timedOperation(operationName, fn) {
  const logger = getLogger();
  const start = process.hrtime.bigint();

  logger.debug({ operation: operationName }, '操作开始');

  const done = () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
    logger.debug({ operation: operationName, durationMs }, '操作完成');
  };

  const result = fn();
  if (result && typeof result.then === 'function') {
    return result.finally(done);
  }
  done();
  return result;
}

// ==================== 使用示例 ====================
async function exampleUsage() {
  const logger = getLogger();

  logger.info('应用启动');
  logger.debug({ config: { port: 3000 } }, '配置加载');

  try {
    await timedOperation('db-connect', async () => {
      await new Promise(r => setTimeout(r, 100));
    });

    logger.warn({ retryCount: 3 }, '重试警告');
  } catch (error) {
    logger.error({ err: error }, '操作失败');
  }
}

function generateId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

// 模拟运行
exampleUsage();
```

---

## 4. 核心转储分析

### 4.1 诊断报告生成

Node.js 内置了诊断报告功能，可以在崩溃时自动生成详细的诊断信息。

```bash
# 致命错误时生成诊断报告
node --report-on-fatalerror app.js

# 未捕获异常时生成报告
node --report-uncaught-exception app.js

# 收到信号时生成报告
node --report-on-signal app.js

# 自定义报告目录和文件名
node --report-on-fatalerror --report-directory=./reports --report-filename=crash-report.json app.js

# 组合使用（推荐的生产环境配置）
node \
  --report-on-fatalerror \
  --report-uncaught-exception \
  --report-on-signal \
  --report-directory=./diagnostics \
  --report-filename=report-%Y%m%d-%H%M%S.json \
  app.js
```

### 4.2 诊断报告内容解读

```javascript
// report-demo.js
// 运行：node --report-uncaught-exception report-demo.js

function causeError() {
  const obj = {};
  obj.causeCrash();  // TypeError: obj.causeCrash is not a function
}

causeError();
```

生成的报告包含以下关键部分：

```json
{
  "header": {
    "event": "Exception",
    "trigger": "Exception",
    "filename": "report-20240115-083000.json",
    "dumpEventTime": "2024-01-15T08:30:00Z",
    "dumpEventTimeStamp": "1705305000000",
    "processId": 12345,
    "threadId": 0,
    "nodejsVersion": "v24.0.0",
    "glibcVersion": "2.35",
    "wordSize": 64,
    "arch": "x64",
    "platform": "linux",
    "componentVersions": {
      "node": "24.0.0",
      "v8": "12.0.0",
      "uv": "1.48.0"
    }
  },
  "javascriptStack": {
    "message": "TypeError: obj.causeCrash is not a function",
    "stack": [
      {
        "pc": "0x00007f8b4c0a1234",
        "symbol": "causeError (/app/report-demo.js:5:8)"
      },
      {
        "pc": "0x00007f8b4c0a5678",
        "symbol": "Object.<anonymous> (/app/report-demo.js:8:1)"
      }
    ]
  },
  "nativeStack": [
    {
      "pc": "0x0000000000a1b2c3",
      "symbol": "node::Report::GetNodeReport(...) [node]"
    },
    {
      "pc": "0x0000000000a1b4d5",
      "symbol": "node::Report::OnUncaughtException(...) [node]"
    }
  ],
  "javascriptHeap": {
    "totalMemory": 8500000,
    "totalCommittedMemory": 8200000,
    "usedMemory": 4500000,
    "availableMemory": 1400000000,
    "memoryLimit": 1500000000,
    "heapSpaces": {
      "read_only_space": { "size": 262144, "used": 32500 },
      "old_space": { "size": 4200000, "used": 3800000 },
      "new_space": { "size": 2097152, "used": 1200000 }
    }
  },
  "resourceUsage": {
    "userCpuSeconds": 0.125,
    "kernelCpuSeconds": 0.025,
    "cpuConsumptionPercent": 15.0,
    "maxRss": 45000000,
    "pageFaults": { "IORequired": 120, "IONotRequired": 4500 },
    "fsActivity": { "reads": 50, "writes": 12 }
  },
  "libuv": [
    {
      "type": "async",
      "is_active": true,
      "is_referenced": false
    },
    {
      "type": "timer",
      "is_active": true,
      "is_referenced": true
    }
  ],
  "environmentVariables": {
    "NODE_ENV": "production",
    "PATH": "/usr/local/bin"
  },
  "sharedObjects": [
    "/usr/local/bin/node",
    "/lib/x86_64-linux-gnu/libc.so.6"
  ]
}
```

**关键字段解读：**

| 字段 | 含义 | 排查方向 |
|------|------|----------|
| `javascriptStack` | JS 调用栈 | 定位代码错误位置 |
| `nativeStack` | C++ 层调用栈 | Node.js 运行时问题 |
| `javascriptHeap.memoryLimit` | 堆内存上限 | OOM 相关 |
| `javascriptHeap.usedMemory` | 已用堆内存 | 内存泄漏 |
| `resourceUsage.maxRss` | 最大常驻内存 | 系统内存压力 |
| `libuv` | 事件循环句柄 | 句柄泄漏 |
| `environmentVariables` | 环境变量 | 配置问题 |

### 4.3 Linux 下生成 Core Dump

```bash
# 1. 设置 core dump 大小限制（当前会话）
ulimit -c unlimited

# 2. 查看当前限制
ulimit -a

# 3. 配置 core dump 保存路径
echo '/var/crash/core-%e-%p-%t' | sudo tee /proc/sys/kernel/core_pattern

# 4. 运行 Node.js 应用（带 --abort-on-uncaught-exception 确保生成 core）
node --abort-on-uncaught-exception app.js

# 5. 使用 llnode 或 gdb 分析 core dump
llnode /usr/local/bin/node -c /var/crash/core-node-12345-1705305000

# 在 llnode 中：
(llnode) v8 bt          # 查看 V8 JavaScript 栈
(llnode) v8 findjsobjects  # 查找所有 JS 对象
(llnode) v8 inspect 0x12345  # 检查特定对象
```

**实战案例：自动收集诊断报告**

```javascript
// diagnostic-reporter.js
import { writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';

const REPORT_DIR = process.env.REPORT_DIR || './diagnostics';

// 确保目录存在
try {
  mkdirSync(REPORT_DIR, { recursive: true });
} catch (e) { /* ignore */ }

// 自定义报告处理
process.report.setOptions({
  events: ['exception', 'fatalerror', 'signal'],
  filename: `${REPORT_DIR}/report-${Date.now()}.json`,
  directory: REPORT_DIR
});

// 增强：报告生成后自动上传/通知
const originalWriteReport = process.report.writeReport;
process.report.writeReport = function(...args) {
  const filename = originalWriteReport.apply(this, args);
  console.error(`诊断报告已生成: ${filename}`);

  // 异步上传（不阻塞）
  uploadReport(filename).catch(err => {
    console.error('报告上传失败:', err.message);
  });

  return filename;
};

async function uploadReport(filename) {
  // 实现上传逻辑（如 S3、内部系统等）
  const report = readFileSync(filename);
  // await s3.upload({ Bucket: 'reports', Key: basename(filename), Body: report });
  console.log(`报告已上传: ${filename}`);
}

// 手动触发报告（用于调试）
export function triggerReport(reason = 'manual') {
  const filename = process.report.writeReport(
    `${REPORT_DIR}/manual-${reason}-${Date.now()}.json`
  );
  return filename;
}

// 定期生成快照报告（用于对比分析）
export function startPeriodicReports(intervalMs = 3600000) {
  return setInterval(() => {
    const filename = triggerReport('periodic');
    console.log(`定期报告已生成: ${filename}`);
  }, intervalMs);
}
```

---

## 5. Heap Snapshot 分析

### 5.1 自动生成 Heap Snapshot

```bash
# 接近堆内存限制时自动生成快照（最多3个）
node --heapsnapshot-near-heap-limit=3 app.js

# 指定快照保存目录
node --heapsnapshot-near-heap-limit=3 --diagnostic-dir=./heap-dumps app.js

# 组合内存限制和快照
node --max-old-space-size=512 --heapsnapshot-near-heap-limit=3 app.js
```

### 5.2 代码中动态生成 Heap Snapshot

```javascript
// heap-snapshot.js
import { writeHeapSnapshot } from 'v8';
import { writeFileSync } from 'fs';
import { getHeapStatistics } from 'v8';

// 获取堆统计信息
function logHeapStats() {
  const stats = getHeapStatistics();
  console.log('堆内存统计:', {
    totalHeapSize: `${(stats.total_heap_size / 1024 / 1024).toFixed(2)} MB`,
    usedHeapSize: `${(stats.used_heap_size / 1024 / 1024).toFixed(2)} MB`,
    heapSizeLimit: `${(stats.heap_size_limit / 1024 / 1024).toFixed(2)} MB`,
    totalPhysicalSize: `${(stats.total_physical_size / 1024 / 1024).toFixed(2)} MB`,
    totalAvailableSize: `${(stats.total_available_size / 1024 / 1024).toFixed(2)} MB`,
    mallocedMemory: `${(stats.malloced_memory / 1024 / 1024).toFixed(2)} MB`
  });
}

// 生成堆快照
function takeSnapshot(label = '') {
  const filename = writeHeapSnapshot(`./heap-${label}-${Date.now()}.heapsnapshot`);
  console.log(`堆快照已保存: ${filename}`);
  return filename;
}

// 监控堆内存，超过阈值时自动快照
class HeapMonitor {
  constructor(options = {}) {
    this.threshold = options.threshold || 0.8;  // 80% 阈值
    this.interval = options.interval || 30000;   // 30秒检查一次
    this.maxSnapshots = options.maxSnapshots || 5;
    this.snapshotCount = 0;
    this.timer = null;
  }

  start() {
    this.timer = setInterval(() => {
      const stats = getHeapStatistics();
      const ratio = stats.used_heap_size / stats.heap_size_limit;

      console.log(`堆内存使用率: ${(ratio * 100).toFixed(1)}%`);

      if (ratio > this.threshold && this.snapshotCount < this.maxSnapshots) {
        console.warn(`堆内存超过阈值 ${this.threshold * 100}%，生成快照...`);
        takeSnapshot(`auto-threshold-${this.snapshotCount}`);
        this.snapshotCount++;
      }
    }, this.interval);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}

// 通过信号触发生成快照
process.on('SIGUSR2', () => {
  console.log('收到 SIGUSR2 信号，生成堆快照...');
  takeSnapshot('signal');
});

export { takeSnapshot, logHeapStats, HeapMonitor };
```

### 5.3 Chrome DevTools Memory 面板分析

**分析步骤：**

1. 在 Chrome DevTools 中打开 "Memory" 面板
2. 点击 "Load" 按钮加载 `.heapsnapshot` 文件
3. 查看 "Summary" 视图：
   - **Constructor**：对象类型
   - **Distance**：到 GC root 的距离
   - **Shallow Size**：对象自身大小
   - **Retained Size**：对象及其引用总大小

**实战案例：内存泄漏排查**

```javascript
// memory-leak-demo.js
import { writeHeapSnapshot } from 'v8';

// 模拟内存泄漏场景：全局缓存未清理
class LeakyCache {
  constructor() {
    this.cache = new Map();
  }

  // 泄漏：缓存无限增长，没有淘汰策略
  add(key, value) {
    this.cache.set(key, {
      data: value,
      timestamp: Date.now(),
      // 大对象引用
      buffer: Buffer.alloc(1024 * 1024)  // 1MB
    });
  }

  get(key) {
    return this.cache.get(key)?.data;
  }
}

// 修复：带 LRU 淘汰的缓存
class FixedCache {
  constructor(maxSize = 100) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  add(key, value) {
    // LRU：先删除最旧的
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      data: value,
      timestamp: Date.now()
    });
  }

  get(key) {
    const entry = this.cache.get(key);
    if (entry) {
      // 更新访问时间
      this.cache.delete(key);
      this.cache.set(key, { ...entry, timestamp: Date.now() });
      return entry.data;
    }
    return null;
  }
}

// 演示：生成多个快照用于对比
async function demonstrateLeak() {
  const leaky = new LeakyCache();

  console.log('初始状态');
  writeHeapSnapshot('./heap-initial.heapsnapshot');

  // 模拟大量请求
  for (let i = 0; i < 50; i++) {
    leaky.add(`key-${i}`, { id: i, data: 'x'.repeat(10000) });
  }

  console.log('添加50个条目后');
  writeHeapSnapshot('./heap-after-50.heapsnapshot');

  for (let i = 50; i < 100; i++) {
    leaky.add(`key-${i}`, { id: i, data: 'x'.repeat(10000) });
  }

  console.log('添加100个条目后');
  writeHeapSnapshot('./heap-after-100.heapsnapshot');

  // 使用修复后的缓存对比
  const fixed = new FixedCache(10);
  for (let i = 0; i < 100; i++) {
    fixed.add(`key-${i}`, { id: i });
  }

  console.log('固定缓存添加100个条目（只保留10个）');
  writeHeapSnapshot('./heap-fixed.heapsnapshot');
}

demonstrateLeak();
```

**Chrome DevTools 分析步骤：**

1. 加载 `heap-initial.heapsnapshot` 和 `heap-after-100.heapsnapshot`
2. 在第二个快照上选择 "Comparison" 视图
3. 对比 `# Delta` 列，找到增长最多的对象类型
4. 点击对象类型查看具体实例
5. 在 "Retainers" 面板中追踪引用链，找到泄漏源

### 5.4 Retainers 分析

在 Chrome DevTools 中：

1. 选择一个对象实例
2. 查看底部的 "Retainers" 面板
3. 追踪从 GC Root 到该对象的路径
4. 找到阻止垃圾回收的引用

常见泄漏模式：
- 全局变量引用
- 闭包捕获
- 事件监听器未移除
- 定时器未清理
- Map/Set 无限增长

---

## 6. CPU Profile 分析

### 6.1 生成 CPU Profile

```bash
# 启动时生成 CPU Profile（应用退出时保存）
node --cpu-prof app.js

# 指定输出目录
node --cpu-prof --cpu-prof-dir=./profiles app.js

# 指定采样间隔（微秒，默认 1000）
node --cpu-prof --cpu-prof-interval=500 app.js

# 命名文件
node --cpu-prof --cpu-prof-name=startup app.js
```

### 6.2 代码中动态生成 CPU Profile

```javascript
// cpu-profile.js
import { Session } from 'inspector';
import { writeFileSync } from 'fs';

const session = new Session();
session.connect();

function post(method, params) {
  return new Promise((resolve, reject) => {
    session.post(method, params, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

/**
 * 录制指定时长的 CPU Profile
 */
export async function recordCpuProfile(durationMs = 5000, filename = `cpu-${Date.now()}.cpuprofile`) {
  console.log(`开始录制 CPU Profile，时长 ${durationMs}ms...`);

  // 启用 Profiler
  await post('Profiler.enable');
  await post('Profiler.setSamplingInterval', { interval: 100 });

  // 开始录制
  await post('Profiler.start');

  // 等待指定时间
  await new Promise(r => setTimeout(r, durationMs));

  // 停止并获取结果
  const { profile } = await post('Profiler.stop');

  // 保存文件
  writeFileSync(filename, JSON.stringify(profile));
  console.log(`CPU Profile 已保存: ${filename}`);

  // 分析热点
  analyzeProfile(profile);

  return filename;
}

/**
 * 简单分析热点函数
 */
function analyzeProfile(profile) {
  const nodes = new Map();

  // 收集所有节点
  function collectNodes(node) {
    nodes.set(node.id, node);
    if (node.children) {
      node.children.forEach(collectNodes);
    }
  }
  collectNodes(profile.nodes[0]);

  // 计算自耗时并排序
  const selfTimes = profile.nodes
    .map(node => ({
      name: node.callFrame.functionName || '(anonymous)',
      url: `${node.callFrame.url}:${node.callFrame.lineNumber}`,
      selfTime: node.hitCount * (profile.sampleInterval || 1000) / 1000
    }))
    .filter(n => n.selfTime > 0)
    .sort((a, b) => b.selfTime - a.selfTime)
    .slice(0, 10);

  console.log('\n=== CPU 热点 Top 10 ===');
  selfTimes.forEach((n, i) => {
    console.log(`${i + 1}. ${n.name} (${n.url}) - ${n.selfTime.toFixed(2)}ms`);
  });
}

// 通过信号触发
let isRecording = false;
process.on('SIGUSR1', async () => {
  if (isRecording) {
    console.log('已有录制在进行中');
    return;
  }
  isRecording = true;
  try {
    await recordCpuProfile(10000, `./cpu-signal-${Date.now()}.cpuprofile`);
  } finally {
    isRecording = false;
  }
});

export { session };
```

### 6.3 Chrome DevTools Performance 面板解读

1. 在 Chrome DevTools 中打开 "Performance" 面板
2. 点击加载按钮选择 `.cpuprofile` 文件
3. 查看 "Chart" 视图：
   - **纵轴**：调用栈深度
   - **横轴**：时间
   - **宽度**：在该函数中花费的时间
   - **颜色**：不同函数用不同颜色区分

**关键指标：**

| 指标 | 含义 | 优化方向 |
|------|------|----------|
| Self Time | 函数自身执行时间 | 优化算法复杂度 |
| Total Time | 函数及子调用总时间 | 减少子调用次数 |
| Call Count | 调用次数 | 减少重复计算，使用缓存 |

### 6.4 火焰图分析

```bash
# 使用 0x 生成交互式火焰图
npx 0x app.js

# 或使用 clinic.js
npx clinic doctor -- node app.js
npx clinic flame -- node app.js
nclinic bubbleprof -- node app.js
```

**实战案例：识别性能瓶颈**

```javascript
// cpu-bottleneck.js
import { recordCpuProfile } from './cpu-profile.js';

// 模拟性能问题

// 问题1：低效的字符串拼接
function inefficientStringJoin(items) {
  let result = '';
  for (const item of items) {
    result += JSON.stringify(item) + ',';  // 每次创建新字符串
  }
  return result;
}

// 修复：使用数组 join
function efficientStringJoin(items) {
  return items.map(i => JSON.stringify(i)).join(',');
}

// 问题2：重复的正则编译
function validateEmailsSlow(emails) {
  return emails.filter(email => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;  // 每次创建新 RegExp
    return regex.test(email);
  });
}

// 修复：预编译正则
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function validateEmailsFast(emails) {
  return emails.filter(email => EMAIL_REGEX.test(email));
}

// 问题3：低效的数组查找
function findUserSlow(users, id) {
  return users.find(u => u.id === id);  // O(n)
}

// 修复：使用 Map
function buildUserIndex(users) {
  return new Map(users.map(u => [u.id, u]));
}
function findUserFast(index, id) {
  return index.get(id);  // O(1)
}

// 问题4：同步阻塞操作
function processDataBlocking(data) {
  const results = [];
  for (const item of data) {
    // 模拟 CPU 密集型计算
    for (let i = 0; i < 1000000; i++) {
      Math.sqrt(i);
    }
    results.push(item * 2);
  }
  return results;
}

// 修复：分批处理，让出事件循环
async function processDataYielding(data, batchSize = 100) {
  const results = [];
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);

    // 处理当前批次
    for (const item of batch) {
      results.push(item * 2);
    }

    // 让出事件循环
    if (i + batchSize < data.length) {
      await new Promise(r => setImmediate(r));
    }
  }
  return results;
}

// 基准测试
async function benchmark() {
  const emails = Array.from({ length: 10000 }, (_, i) =>
    i % 10 === 0 ? 'invalid' : `user${i}@example.com`
  );

  console.log('开始性能测试...');

  // 录制低效版本
  const profile1 = await recordCpuProfile(3000, './cpu-inefficient.cpuprofile');

  console.time('inefficient');
  validateEmailsSlow(emails);
  console.timeEnd('inefficient');

  console.time('efficient');
  validateEmailsFast(emails);
  console.timeEnd('efficient');
}

benchmark().catch(console.error);
```

---

## 7. 网络调试

### 7.1 NODE_DEBUG 环境变量

```bash
# 查看所有可用的调试模块
NODE_DEBUG=* node -e "console.log('test')"

# 调试 HTTP 模块
NODE_DEBUG=http node app.js

# 调试多个模块
NODE_DEBUG=http,http2,net,tls node app.js

# 调试 DNS
NODE_DEBUG=dns node app.js

# 调试流
NODE_DEBUG=stream node app.js

# 调试集群
NODE_DEBUG=cluster node app.js

# 调试模块加载
NODE_DEBUG=module node app.js

# 调试 Worker Threads
NODE_DEBUG=worker node app.js
```

**输出示例：**

```bash
$ NODE_DEBUG=http node app.js
HTTP 12345: call onSocket 0 0
HTTP 12345: createConnection api.example.com:443:::: { ... }
HTTP 12345: sockets api.example.com:443:::: 1
HTTP 12345: outgoing message end.
HTTP 12345: AGENT incoming response!
HTTP 12345: CLIENT response onfinish
HTTP 12345: socket close
```

### 7.2 详细的网络调试

```javascript
// network-debug.js
import http from 'http';
import https from 'https';
import { Socket } from 'net';

// 监听所有 HTTP 请求/响应
const originalHttpRequest = http.request;
http.request = function(...args) {
  const req = originalHttpRequest.apply(this, args);

  const startTime = Date.now();
  const url = args[0]?.href || args[0];

  console.log(`[HTTP] -> ${req.method} ${url}`);

  req.on('response', (res) => {
    const duration = Date.now() - startTime;
    console.log(`[HTTP] <- ${req.method} ${url} ${res.statusCode} (${duration}ms)`);

    // 记录响应头
    if (process.env.DEBUG_HTTP_HEADERS) {
      console.log('[HTTP] Response headers:', res.headers);
    }
  });

  req.on('error', (err) => {
    console.error(`[HTTP] !! ${req.method} ${url} ERROR: ${err.message}`);
  });

  return req;
};

// 监听 Socket 事件
const originalSocketWrite = Socket.prototype.write;
Socket.prototype.write = function(data, encoding, cb) {
  if (process.env.DEBUG_SOCKET) {
    console.log(`[SOCKET] write ${data?.length || 0} bytes to ${this.remoteAddress}:${this.remotePort}`);
  }
  return originalSocketWrite.call(this, data, encoding, cb);
};

// DNS 调试
import dns from 'dns';
const originalDnsLookup = dns.lookup;
dns.lookup = function(hostname, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  const startTime = Date.now();
  console.log(`[DNS] lookup ${hostname}`);

  return originalDnsLookup.call(this, hostname, options, (err, address, family) => {
    const duration = Date.now() - startTime;
    if (err) {
      console.error(`[DNS] !! ${hostname} FAILED (${duration}ms): ${err.message}`);
    } else {
      console.log(`[DNS] ${hostname} -> ${address} (IPv${family}, ${duration}ms)`);
    }
    callback(err, address, family);
  });
};
```

### 7.3 抓包分析

```bash
# tcpdump - 抓取特定端口的流量
sudo tcpdump -i any -n port 3000 -w capture.pcap

# 抓取特定主机的 HTTP 流量
sudo tcpdump -i any -n host api.example.com and port 80 -w http.pcap

# 抓取本机 Node.js 应用的流量
sudo tcpdump -i lo -n port 3000 -A -l | grep -E '(GET|POST|HTTP|Host:)'

# Wireshark 过滤表达式
# http.request.method == "GET"
# tcp.port == 3000
# tls.handshake.type == 1
# http.response.code >= 400
```

### 7.4 HTTP 请求/响应日志中间件

```javascript
// http-logger-middleware.js
import { AsyncLocalStorage } from 'async_hooks';

const requestContext = new AsyncLocalStorage();

/**
 * Express/Koa 风格的 HTTP 日志中间件
 */
export function httpLoggerMiddleware(options = {}) {
  const {
    logger = console,
    skipPaths = ['/health', '/favicon.ico'],
    logBody = false,
    maxBodyLength = 1000,
    sensitiveHeaders = ['authorization', 'cookie', 'x-api-key']
  } = options;

  return async function(req, res, next) {
    const startTime = process.hrtime.bigint();
    const requestId = req.headers['x-request-id'] || generateId();

    // 跳过指定路径
    if (skipPaths.some(p => req.path.startsWith(p))) {
      return next();
    }

    // 记录请求
    const requestLog = {
      requestId,
      method: req.method,
      path: req.path,
      query: req.query,
      headers: sanitizeHeaders(req.headers, sensitiveHeaders),
      ip: req.ip || req.connection?.remoteAddress,
      userAgent: req.headers['user-agent']
    };

    if (logBody && req.body) {
      requestLog.body = truncateBody(req.body, maxBodyLength);
    }

    logger.info(requestLog, `[${requestId}] -> ${req.method} ${req.path}`);

    // 拦截响应
    const originalEnd = res.end;
    res.end = function(chunk, encoding) {
      res.end = originalEnd;
      res.end(chunk, encoding);

      const durationMs = Number(process.hrtime.bigint() - startTime) / 1e6;
      const responseLog = {
        requestId,
        statusCode: res.statusCode,
        durationMs: Math.round(durationMs * 100) / 100,
        contentLength: res.getHeader('content-length'),
        responseHeaders: sanitizeHeaders(res.getHeaders(), sensitiveHeaders)
      };

      const level = res.statusCode >= 500 ? 'error'
        : res.statusCode >= 400 ? 'warn'
        : 'info';

      logger[level](responseLog, `[${requestId}] <- ${req.method} ${req.path} ${res.statusCode} (${durationMs.toFixed(2)}ms)`);
    };

    // 记录错误
    res.on('error', (err) => {
      logger.error({ requestId, error: err.message }, `[${requestId}] !! Response error`);
    });

    requestContext.run({ requestId }, () => next());
  };
}

function sanitizeHeaders(headers, sensitive) {
  const sanitized = { ...headers };
  for (const key of sensitive) {
    if (sanitized[key]) {
      sanitized[key] = '***';
    }
  }
  return sanitized;
}

function truncateBody(body, maxLength) {
  const str = typeof body === 'string' ? body : JSON.stringify(body);
  if (str.length <= maxLength) return body;
  return str.slice(0, maxLength) + '... [truncated]';
}

function generateId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

// Express 使用示例
// app.use(httpLoggerMiddleware({ logger: pinoLogger, logBody: true }));
```

**实战案例：完整的网络调试工具集**

```javascript
// network-debug-toolkit.js
import http from 'http';
import https from 'https';
import { performance } from 'perf_hooks';

/**
 * 网络请求追踪器
 */
class NetworkTracer {
  constructor() {
    this.requests = new Map();
    this.intercept();
  }

  intercept() {
    // 拦截 HTTP 请求
    const originalRequest = http.request;
    http.request = (...args) => {
      return this.wrapRequest(originalRequest.call(http, ...args));
    };

    // 拦截 HTTPS 请求
    const originalHttpsRequest = https.request;
    https.request = (...args) => {
      return this.wrapRequest(originalHttpsRequest.call(https, ...args));
    };
  }

  wrapRequest(req) {
    const traceId = `req-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const startTime = performance.now();

    const trace = {
      id: traceId,
      method: req.method,
      host: req.host || req.hostname,
      path: req.path,
      protocol: req.protocol,
      startTime,
      headers: req.getHeaders ? req.getHeaders() : {},
      phases: {}
    };

    this.requests.set(traceId, trace);

    // 追踪各阶段时间
    req.on('socket', (socket) => {
      trace.phases.socket = performance.now() - startTime;

      socket.on('lookup', () => {
        trace.phases.dnsLookup = performance.now() - startTime;
      });

      socket.on('connect', () => {
        trace.phases.tcpConnect = performance.now() - startTime;
      });

      socket.on('secureConnect', () => {
        trace.phases.tlsHandshake = performance.now() - startTime;
      });
    });

    req.on('response', (res) => {
      trace.phases.firstByte = performance.now() - startTime;
      trace.statusCode = res.statusCode;
      trace.responseHeaders = res.headers;

      let bytesReceived = 0;
      res.on('data', (chunk) => {
        bytesReceived += chunk.length;
      });

      res.on('end', () => {
        trace.phases.complete = performance.now() - startTime;
        trace.bytesReceived = bytesReceived;
        this.logTrace(trace);
      });
    });

    req.on('error', (err) => {
      trace.error = err.message;
      trace.phases.error = performance.now() - startTime;
      this.logTrace(trace);
    });

    return req;
  }

  logTrace(trace) {
    const duration = trace.phases.complete || trace.phases.error || 0;
    const phases = [];

    if (trace.phases.dnsLookup) {
      phases.push(`DNS:${(trace.phases.dnsLookup).toFixed(1)}ms`);
    }
    if (trace.phases.tcpConnect) {
      phases.push(`TCP:${(trace.phases.tcpConnect - (trace.phases.dnsLookup || 0)).toFixed(1)}ms`);
    }
    if (trace.phases.tlsHandshake) {
      phases.push(`TLS:${(trace.phases.tlsHandshake - trace.phases.tcpConnect).toFixed(1)}ms`);
    }
    if (trace.phases.firstByte) {
      phases.push(`TTFB:${(trace.phases.firstByte - (trace.phases.tlsHandshake || trace.phases.tcpConnect || 0)).toFixed(1)}ms`);
    }

    const status = trace.error ? `ERROR(${trace.error})` : trace.statusCode;
    console.log(
      `[Network] ${trace.method} ${trace.host}${trace.path} ` +
      `-> ${status} (${duration.toFixed(1)}ms) [${phases.join(' | ')}]`
    );
  }

  getTraces() {
    return Array.from(this.requests.values());
  }

  getSlowTraces(thresholdMs = 1000) {
    return this.getTraces().filter(t =>
      (t.phases.complete || 0) > thresholdMs
    );
  }
}

// 使用
const tracer = new NetworkTracer();

// 测试
async function test() {
  await Promise.all([
    fetch('https://httpbin.org/get'),
    fetch('https://httpbin.org/delay/2')
  ]);

  console.log('\n慢请求:', tracer.getSlowTraces(500));
}

test();

export { NetworkTracer };
```

---

## 附录：调试速查表

### 启动标志速查

```bash
# 调试
node --inspect app.js                    # 启用 Inspector
node --inspect-brk app.js                # 启动后断住
node --inspect-wait app.js               # Node.js 24+，等待调试器

# 诊断报告
node --report-on-fatalerror app.js       # 致命错误生成报告
node --report-uncaught-exception app.js  # 未捕获异常生成报告
node --report-on-signal app.js           # 信号触发报告

# 堆快照
node --heapsnapshot-near-heap-limit=3 app.js  # 接近内存限制时生成

# CPU Profile
node --cpu-prof app.js                   # 生成 CPU Profile
node --cpu-prof-interval=500 app.js      # 设置采样间隔

# 其他
node --trace-warnings app.js             # 追踪警告
node --trace-uncaught app.js             # 追踪未捕获异常
node --abort-on-uncaught-exception app.js # 异常时生成 core dump
node --max-old-space-size=512 app.js     # 设置堆内存上限
```

### 信号速查

| 信号 | 作用 |
|------|------|
| `SIGUSR1` | 启动/停止 CPU Profile 录制 |
| `SIGUSR2` | 生成 Heap Snapshot（自定义实现） |
| `SIGTERM` | 优雅退出 |
| `SIGINT` | 中断（Ctrl+C） |

### 环境变量速查

| 变量 | 作用 |
|------|------|
| `NODE_DEBUG=*` | 启用所有调试输出 |
| `NODE_DEBUG=http` | 调试 HTTP 模块 |
| `NODE_DEBUG=net` | 调试网络模块 |
| `NODE_OPTIONS=--inspect` | 全局设置 Node.js 选项 |
| `UV_THREADPOOL_SIZE=128` | 设置 libuv 线程池大小 |
