# Node.js 日志系统设计与实战

日志是后端系统可观测性的基石。一套设计良好的日志系统不仅能帮助排查故障，还能支撑监控告警、审计合规和业务分析。

---

## 目录

1. [日志系统设计原则](#一日志系统设计原则)
2. [日志级别与规范](#二日志级别与规范)
3. [结构化日志](#三结构化日志)
4. [Node.js 日志库选型](#四nodejs-日志库选型)
5. [实战：基于 Pino 的日志系统](#五实战基于-pino-的日志系统)
6. [日志采集与存储](#六日志采集与存储)
7. [性能与安全](#七性能与安全)
8. [总结](#八总结)

---

## 一、日志系统设计原则

### 1.1 核心目标

- **可排查**：出现问题时能通过日志快速定位根因。
- **可度量**：日志数据可用于统计 QPS、延迟、错误率等指标。
- **可审计**：关键操作留痕，满足合规要求。
- **低成本**：避免无效日志淹没系统，控制存储和传输开销。

### 1.2 设计原则

| 原则 | 说明 |
|------|------|
| **分级输出** | 不同环境输出不同级别日志，生产环境避免 DEBUG 刷屏 |
| **结构化** | 使用 JSON 格式，便于日志系统解析和检索 |
| **上下文关联** | 通过 requestId、traceId 串联单次请求的所有日志 |
| **异步落盘** | 避免同步写日志阻塞事件循环 |
| **敏感信息脱敏** | 密码、Token、身份证号等不可明文输出 |
| **可采样** | 高频低价值日志支持采样，降低存储成本 |

---

## 二、日志级别与规范

### 2.1 标准日志级别

```
FATAL  >  ERROR  >  WARN  >  INFO  >  DEBUG  >  TRACE
```

| 级别 | 使用场景 |
|------|---------|
| `FATAL` | 系统级致命错误，需要立即人工介入 |
| `ERROR` | 业务异常、接口失败、数据库连接中断 |
| `WARN`  | 非预期但可恢复的情况，如限流、降级 |
| `INFO`  | 关键业务流程记录，如请求开始/结束 |
| `DEBUG` | 调试信息，仅在开发/测试环境开启 |
| `TRACE` | 最详细的调用链路信息 |

### 2.2 日志内容规范

每条日志建议包含以下字段：

```json
{
  "level": "INFO",
  "timestamp": "2026-06-16T12:00:00.123Z",
  "service": "order-service",
  "env": "production",
  "requestId": "req_abc123",
  "traceId": "trace_xyz789",
  "userId": "10086",
  "msg": "订单创建成功",
  "duration": 45,
  "method": "POST",
  "path": "/api/orders",
  "statusCode": 200,
  "ip": "192.168.1.100"
}
```

---

## 三、结构化日志

### 3.1 为什么用 JSON

- 方便 ELK、Grafana Loki、Datadog 等日志平台解析。
- 支持按字段过滤、聚合、告警。
- 避免多行日志被截断或解析错误。

### 3.2 自定义日志格式示例

```javascript
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label.toUpperCase() }),
    bindings: (bindings) => ({
      pid: bindings.pid,
      service: process.env.SERVICE_NAME || 'app'
    })
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  base: {
    env: process.env.NODE_ENV || 'development'
  }
});

logger.info({ userId: '10086', action: 'login' }, '用户登录成功');
```

输出：

```json
{
  "level": "INFO",
  "time": "2026-06-16T12:00:00.123Z",
  "pid": 12345,
  "service": "app",
  "env": "development",
  "userId": "10086",
  "action": "login",
  "msg": "用户登录成功"
}
```

---

## 四、Node.js 日志库选型

| 库 | 特点 | 适用场景 |
|----|------|---------|
| **Pino** | 高性能、低开销、生态丰富 | 大中型项目首选 |
| **Winston** | 灵活、传输器丰富、历史悠久 | 需要复杂路由和格式化 |
| **Bunyan** | 原生 JSON、子 logger 友好 | 结构化日志需求 |
| **Log4js** | 类似 Java log4j | 熟悉 log4j 的团队 |
| **Consola** | 轻量、美观 | 开发阶段或 Nuxt 项目 |

性能对比（每秒日志条数，越高越好）：

| 库 | 基本日志 | 结构化日志 |
|----|---------|-----------|
| Pino | ~100k | ~80k |
| Winston | ~30k | ~20k |
| Bunyan | ~25k | ~18k |

---

## 五、实战：基于 Pino 的日志系统

### 5.1 安装依赖

```bash
npm install pino pino-http pino-pretty
```

### 5.2 封装日志器

```javascript
// lib/logger.js
import pino from 'pino';
import { randomUUID } from 'node:crypto';

const isDev = process.env.NODE_ENV !== 'production';

export const logger = pino({
  level: process.env.LOG_LEVEL || (isDev ? 'debug' : 'info'),
  transport: isDev
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname'
        }
      }
    : undefined,
  formatters: {
    level: (label) => ({ level: label.toUpperCase() }),
    bindings: () => ({
      service: process.env.SERVICE_NAME || 'node-app'
    })
  },
  base: {
    env: process.env.NODE_ENV || 'development'
  }
});

/**
 * 为每次请求创建子日志器，自动绑定 requestId
 */
export function createRequestLogger(req) {
  const requestId = req.headers['x-request-id'] || randomUUID();
  req.requestId = requestId;

  return logger.child({
    requestId,
    traceId: req.headers['x-trace-id'],
    userAgent: req.headers['user-agent'],
    ip: req.ip
  });
}
```

### 5.3 Express 中间件集成

```javascript
// middleware/request-log.js
import pinoHttp from 'pino-http';
import { logger } from '../lib/logger.js';

export const requestLogger = pinoHttp({
  logger,
  genReqId: (req) => req.headers['x-request-id'] || randomUUID(),
  customLogLevel: (req, res, err) => {
    if (res.statusCode >= 500 || err) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
  customSuccessMessage: (req, res) => {
    return `${req.method} ${req.url} completed in ${res.responseTime}ms`;
  }
});
```

```javascript
// app.js
import express from 'express';
import { requestLogger } from './middleware/request-log.js';
import { logger } from './lib/logger.js';

const app = express();
app.use(requestLogger);

app.get('/health', (req, res) => {
  req.log.info('健康检查请求');
  res.json({ status: 'ok' });
});

app.get('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  req.log.debug({ userId: id }, '查询用户信息');

  try {
    const user = await getUserById(id);
    req.log.info({ userId: id }, '查询用户成功');
    res.json(user);
  } catch (error) {
    req.log.error({ err: error, userId: id }, '查询用户失败');
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
```

### 5.4 异步上下文传递 requestId

```javascript
import { AsyncLocalStorage } from 'node:async_hooks';

const asyncLocalStorage = new AsyncLocalStorage();

export function runWithContext(context, callback) {
  return asyncLocalStorage.run(context, callback);
}

export function getLogger() {
  const context = asyncLocalStorage.getStore();
  if (context) {
    return logger.child(context);
  }
  return logger;
}

// 使用
app.use((req, res, next) => {
  const requestId = req.headers['x-request-id'] || randomUUID();
  runWithContext({ requestId }, () => next());
});

// 业务代码任意位置
getLogger().info('无需手动传递 requestId');
```

---

## 六、日志采集与存储

### 6.1 本地文件 + 日志代理

生产环境常见模式：

```
Node.js App → 写本地文件 → Filebeat/Fluentd → Elasticsearch/Loki
```

Pino 配置多目标：

```javascript
import pino from 'pino';

const transport = pino.transport({
  targets: [
    {
      target: 'pino/file',
      options: { destination: '/var/log/app/app.log' },
      level: 'info'
    },
    {
      target: 'pino/file',
      options: { destination: '/var/log/app/error.log' },
      level: 'error'
    }
  ]
});

export const logger = pino({ level: 'info' }, transport);
```

### 6.2 直接推送日志平台

适合容器化环境：

```javascript
import pino from 'pino';

const transport = pino.transport({
  target: 'pino-sentry',
  options: {
    dsn: process.env.SENTRY_DSN,
    level: 'error'
  }
});

export const logger = pino({ level: 'info' }, transport);
```

### 6.3 日志轮转

使用 `logrotate` 或 `pino-roll`：

```bash
# /etc/logrotate.d/node-app
/var/log/app/*.log {
  daily
  rotate 30
  compress
  delaycompress
  missingok
  notifempty
  create 0644 node node
  sharedscripts
  postrotate
    kill -USR1 $(cat /var/run/app.pid)
  endscript
}
```

---

## 七、性能与安全

### 7.1 性能优化

- 生产环境禁用 `pino-pretty`，使用 JSON 输出。
- 高频日志开启采样：

```javascript
logger.info({ sampled: Math.random() < 0.01 }, '高频日志采样输出');
```

- 避免在热路径调用 JSON.stringify 序列化大对象。
- 使用子 logger 而非每次创建新 logger。

### 7.2 安全与脱敏

```javascript
function sanitize(obj) {
  const sensitive = ['password', 'token', 'secret', 'idCard', 'phone'];
  const clone = { ...obj };
  for (const key of sensitive) {
    if (clone[key]) clone[key] = '***';
  }
  return clone;
}

logger.info({ body: sanitize(req.body) }, '请求体');
```

Pino 也可通过 `redact` 自动脱敏：

```javascript
const logger = pino({
  redact: {
    paths: ['req.headers.authorization', 'body.password', 'body.idCard'],
    censor: '***'
  }
});
```

---

## 八、总结

Node.js 日志系统的设计要点：

- **分级 + 结构化**：JSON 格式是生产环境的标准。
- **requestId 全链路**：通过 `AsyncLocalStorage` 隐式传递上下文。
- **Pino 优先**：性能与生态兼顾，适合大多数项目。
- **敏感信息脱敏**：安全红线，不可妥协。
- **异步采集**：本地文件 + 日志代理，或直接推送日志平台。

一套好的日志系统，是后端从“能跑”走向“可运维”的关键分水岭。
