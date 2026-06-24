# Node.js Cluster 实战

Node.js 采用单线程事件循环模型，虽然 I/O 密集型任务表现优异，但默认只能利用一个 CPU 核心。`node:cluster` 模块允许在主进程（Primary）下 fork 多个工作进程（Worker），让同一个服务监听同一端口，从而充分利用多核 CPU，提升吞吐量和可用性。

---

## 1. 为什么需要 Cluster

| 问题 | 单进程 Node.js | Cluster 多进程 |
| --- | --- | --- |
| CPU 利用率 | 仅使用一个核心 | 使用所有可用核心 |
| 进程崩溃影响 | 整个服务不可用 | 仅影响单个 Worker，Primary 可重启 |
| 并发吞吐量 | 受限于单核算力 | 多核并行处理 |
| 滚动重启 | 需要借助外部工具 | 可逐个 Worker 重启，保持服务可用 |

Cluster 适合以下场景：

- CPU 密集型接口（复杂计算、图片处理、数据聚合）
- 需要充分利用服务器多核资源的 Web 服务
- 对可用性要求较高、希望进程异常自动恢复的服务

## 2. 核心概念

### 2.1 Primary 与 Worker

- **Primary（主进程）**：负责管理 Worker，本身不处理业务请求。主要职责是 fork Worker、监听 Worker 状态、在 Worker 异常退出时重新 fork。
- **Worker（工作进程）**：实际运行业务代码，监听共享端口处理请求。

### 2.2 端口共享机制

Cluster 通过操作系统级别的端口复用，让多个 Worker 进程监听同一个 TCP 端口。请求由操作系统或 Node.js 内置调度策略分发给不同 Worker。

### 2.3 负载均衡策略

Node.js 提供两种调度策略：

- `cluster.SCHED_NONE`：由操作系统负责调度。
- `cluster.SCHED_RR`（Round-Robin，默认）：Primary 接收连接后以轮询方式分发给 Worker。

```javascript
import cluster from 'node:cluster'

// 查看当前调度策略
console.log(cluster.schedulingPolicy)

// 设置为轮询调度（默认）
cluster.schedulingPolicy = cluster.SCHED_RR
```

## 3. 最简 Cluster 示例

```javascript
// cluster-basic.mjs
import cluster from 'node:cluster'
import http from 'node:http'
import { availableParallelism } from 'node:os'
import process from 'node:process'

const numCPUs = availableParallelism()

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} 正在运行`)

  // 根据 CPU 核心数 fork Worker
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork()
  }

  // Worker 退出时重新 fork，保证可用核心数
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} 退出，code: ${code}, signal: ${signal}`)
    console.log('正在 fork 新的 Worker...')
    cluster.fork()
  })
} else {
  // Worker 共享同一个端口
  http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' })
    res.end(`Hello from Worker ${process.pid}\n`)
  }).listen(8000)

  console.log(`Worker ${process.pid} 已启动`)
}
```

运行效果：

```bash
node cluster-basic.mjs
```

多个 Worker 进程同时监听 `8000` 端口，请求会被分发到不同进程，响应中携带当前处理请求的进程 PID。

## 4. 进程间通信（IPC）

Cluster 的 Primary 与 Worker 之间可以通过 `process.send()` 和 `message` 事件进行通信。常见用途包括：

- Worker 向 Primary 上报统计信息
- Primary 向 Worker 广播配置变更
- Primary 向 Worker 发送关闭或重启指令

### 4.1 Worker 上报请求数

```javascript
// cluster-ipc.mjs
import cluster from 'node:cluster'
import http from 'node:http'
import { availableParallelism } from 'node:os'
import process from 'node:process'

const numCPUs = availableParallelism()

if (cluster.isPrimary) {
  let numReqs = 0

  // 每秒打印总请求数
  setInterval(() => {
    console.log(`总请求数: ${numReqs}`)
  }, 1000)

  // 处理 Worker 上报的消息
  function messageHandler(msg) {
    if (msg?.cmd === 'notifyRequest') {
      numReqs += 1
    }
  }

  // fork Worker
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork()
  }

  // 为每个 Worker 注册消息监听
  for (const id in cluster.workers) {
    cluster.workers[id].on('message', messageHandler)
  }

  cluster.on('exit', (worker) => {
    console.log(`Worker ${worker.process.pid} 退出`)
    cluster.fork()
  })
} else {
  http.createServer((req, res) => {
    res.writeHead(200)
    res.end('hello world\n')

    // 处理完请求后通知 Primary
    process.send({ cmd: 'notifyRequest' })
  }).listen(8000)
}
```

### 4.2 Primary 向 Worker 发送消息

```javascript
if (cluster.isPrimary) {
  const worker = cluster.fork()

  // Worker 启动就绪后发送消息
  worker.on('online', () => {
    worker.send({ type: 'config', data: { env: 'production' } })
  })
} else if (cluster.isWorker) {
  process.on('message', (msg) => {
    console.log(`Worker ${process.pid} 收到消息:`, msg)
  })
}
```

## 5. 优雅退出与故障恢复

生产环境中，Worker 应该能够优雅地处理关闭信号，完成当前请求后再退出，避免连接被强制中断。

```javascript
// cluster-graceful.mjs
import cluster from 'node:cluster'
import http from 'node:http'
import { availableParallelism } from 'node:os'
import process from 'node:process'

const numCPUs = availableParallelism()

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} 正在运行`)

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork()
  }

  cluster.on('exit', (worker, code, signal) => {
    // 非主动 disconnect 导致的退出才需要重启
    if (signal !== 'SIGTERM' && code !== 0) {
      console.error(`Worker ${worker.process.pid} 异常退出，准备重启`)
      cluster.fork()
    }
  })

  // 收到 SIGTERM 时优雅关闭所有 Worker
  process.on('SIGTERM', () => {
    console.log('Primary 收到 SIGTERM，开始优雅关闭 Worker')
    for (const id in cluster.workers) {
      cluster.workers[id].send({ cmd: 'shutdown' })
    }
  })
} else {
  const server = http.createServer((req, res) => {
    res.writeHead(200)
    res.end(`Response from Worker ${process.pid}\n`)
  })

  server.listen(8000, () => {
    console.log(`Worker ${process.pid} 已监听 8000`)
  })

  // 收到关闭指令后优雅退出
  process.on('message', (msg) => {
    if (msg?.cmd === 'shutdown') {
      console.log(`Worker ${process.pid} 正在优雅关闭`)
      // 停止接收新连接
      server.close(() => {
        process.exit(0)
      })

      // 超时强制退出
      setTimeout(() => {
        console.error(`Worker ${process.pid} 关闭超时，强制退出`)
        process.exit(1)
      }, 5000).unref()
    }
  })
}
```

## 6. 实战：带重启策略的 Cluster 服务

将以上能力组合，构建一个企业级可用的 Cluster 服务：

```javascript
// cluster-server.mjs
import cluster from 'node:cluster'
import http from 'node:http'
import { availableParallelism } from 'node:os'
import process from 'node:process'

const PORT = Number(process.env.PORT) || 3000
const WORKER_COUNT = Number(process.env.WORKER_COUNT) || availableParallelism()

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} 启动，计划创建 ${WORKER_COUNT} 个 Worker`)

  // fork 所有 Worker
  for (let i = 0; i < WORKER_COUNT; i++) {
    forkWorker()
  }

  // Worker 异常退出时重启
  cluster.on('exit', (worker, code, signal) => {
    const wasGraceful = signal === 'SIGTERM' || code === 0
    console.log(
      `Worker ${worker.process.pid} 退出 (code=${code}, signal=${signal}, graceful=${wasGraceful})`
    )
    if (!wasGraceful) {
      forkWorker()
    }
  })

  // 收到重启信号时逐个重启 Worker
  process.on('SIGUSR2', async () => {
    console.log('收到 SIGUSR2，开始滚动重启 Worker')
    const workers = Object.values(cluster.workers)
    for (const worker of workers) {
      if (!worker) continue
      worker.send({ cmd: 'shutdown' })
      await new Promise((resolve) => worker.once('exit', resolve))
      forkWorker()
    }
  })

  function forkWorker() {
    const worker = cluster.fork()
    worker.on('message', (msg) => {
      if (msg?.type === 'ready') {
        console.log(`Worker ${worker.process.pid} 已就绪`)
      }
    })
  }
} else {
  const server = http.createServer((req, res) => {
    // 模拟一个 CPU 密集型接口
    if (req.url === '/heavy') {
      let sum = 0
      for (let i = 0; i < 1e7; i++) {
        sum += i
      }
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ pid: process.pid, sum }))
      return
    }

    res.writeHead(200, { 'Content-Type': 'text/plain' })
    res.end(`Hello from Worker ${process.pid}\n`)
  })

  server.listen(PORT, () => {
    console.log(`Worker ${process.pid} 监听 ${PORT}`)
    // 通知 Primary 当前 Worker 已就绪
    process.send({ type: 'ready' })
  })

  // 优雅关闭
  process.on('message', (msg) => {
    if (msg?.cmd === 'shutdown') {
      server.close(() => process.exit(0))
      setTimeout(() => process.exit(1), 10_000).unref()
    }
  })
}
```

启动与测试：

```bash
# 启动服务
node cluster-server.mjs

# 滚动重启（Linux/macOS）
kill -SIGUSR2 <primary_pid>

# 压测
wrk -t4 -c100 -d10s http://localhost:3000/heavy
```

## 7. Cluster 与 Worker Threads 如何选择

| 维度 | Cluster | Worker Threads |
| --- | --- | --- |
| 执行单元 | 独立进程 | 同一进程内的线程 |
| 内存 | 每个 Worker 独立内存 | 可共享 `SharedArrayBuffer` |
| 崩溃隔离 | 进程级隔离，安全性高 | 单个线程崩溃会导致整个进程退出 |
| 通信成本 | IPC，成本较高 | MessagePort，成本较低 |
| 共享端口 | 原生支持 | 不支持 |
| 适用场景 | Web 服务多核扩展、进程容灾 | CPU 密集型任务并行计算 |

简单判断：

- 要做 **HTTP 服务多核部署** → 用 Cluster。
- 要在后台 **并行跑计算任务** → 用 Worker Threads。
- 两者也可以组合：Cluster 负责多进程监听端口，Worker Threads 负责进程内重计算。

## 8. 最佳实践

1. **Primary 只做管理**：不要在 Primary 中处理请求，保持轻量。
2. **Worker 数量建议等于 CPU 核心数**：过多 Worker 会增加上下文切换开销。
3. **捕获未处理异常**：在 Worker 中使用 `process.on('uncaughtException')` 做兜底，避免整个进程崩溃。
4. **优雅退出**：处理 `SIGTERM`/`SIGINT`，关闭连接后再退出。
5. **监控与日志**：记录每个 Worker 的 PID、重启次数、请求量，便于排查问题。
6. **结合 PM2 / Kubernetes**：Cluster 适合单机构建多核能力；多机部署时建议配合 PM2 或容器编排工具。

## 9. 总结

`node:cluster` 是 Node.js 官方提供的多进程扩展方案，能够以极低的学习成本将单进程服务扩展到多核。它的核心设计是 **Primary 管理 + Worker 处理 + 端口共享**，配合 IPC 和优雅退出机制，可以构建出高可用、易维护的企业级服务。

不过，Cluster 只解决单机多核问题。如果需要跨机器水平扩展，还需要配合反向代理（Nginx）、负载均衡和容器编排等方案。
