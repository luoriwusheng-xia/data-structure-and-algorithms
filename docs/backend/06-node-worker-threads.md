# Node.js 多线程实战

本文档深入讲解 Node.js `worker_threads` 模块在大企业级场景中的实战应用。所有代码基于 Node.js 26+ 环境，采用 ES Module 规范。

---

## 1. Worker Threads 核心概念

### 1.1 为什么需要多线程

Node.js 的单线程事件循环模型在处理 I/O 密集型任务时表现优异，但面对 CPU 密集型任务时会出现明显的性能瓶颈：

- **事件循环阻塞**：复杂的计算会占用主线程，导致后续请求无法及时响应
- **无法利用多核**：单线程只能使用一个 CPU 核心
- **超时风险**：长时间计算可能导致连接超时、请求堆积

| 场景 | 单线程处理 | Worker 线程处理 |
|------|-----------|----------------|
| 图片/视频转码 | 事件循环阻塞，API 无响应 | 后台处理，主线程保持响应 |
| 大数据聚合计算 | 逐条处理，耗时线性增长 | 分片并行，充分利用多核 |
| 密码学运算（哈希、加密） | 高 CPU 占用 |  offload 到 Worker |
| JSON/XML 大文件解析 | 阻塞解析 | 流式 + Worker 并行 |

### 1.2 核心 API

```javascript
// worker_threads 核心模块
import {
  Worker,
  isMainThread,
  parentPort,
  workerData,
  BroadcastChannel,
  MessageChannel,
  MessagePort,
  receiveMessageOnPort
} from 'node:worker_threads';
```

| API | 作用 |
|-----|------|
| `Worker` | 创建新的线程实例 |
| `isMainThread` | 判断当前是否在主线程 |
| `parentPort` | Worker 线程中向主线程发送消息 |
| `workerData` | 初始化 Worker 时传入的数据（克隆传输） |
| `BroadcastChannel` | 跨 Worker 广播消息 |
| `MessageChannel` | 创建一对关联的 MessagePort |
| `SharedArrayBuffer` | 多线程共享内存 |

### 1.3 package.json 配置

```json
{
  "name": "node-worker-threads-demo",
  "version": "1.0.0",
  "type": "module",
  "engines": {
    "node": ">=26.0.0"
  },
  "scripts": {
    "start": "node --max-old-space-size=4096 src/main.js",
    "dev": "node --watch src/main.js",
    "test": "node --test test/**/*.test.js"
  }
}
```

---

## 2. Worker Pool 线程池模式

### 2.1 企业级线程池设计

在大规模服务中，无限制地创建 Worker 会导致系统资源耗尽。线程池是生产环境的标准做法。

```javascript
// lib/worker-pool.js
import { Worker } from 'node:worker_threads';
import { EventEmitter } from 'node:events';
import os from 'node:os';

/**
 * 企业级 Worker 线程池
 *
 * 特性：
 * - 动态扩容/缩容
 * - 任务队列 + 超时控制
 * - Worker 异常自动恢复
 * - 性能指标收集
 * - 优雅关闭
 */
export class WorkerPool extends EventEmitter {
  /**
   * @param {string} workerScript - Worker 脚本路径
   * @param {Object} options
   * @param {number} options.minWorkers - 最小 Worker 数（默认: CPU 核心数）
   * @param {number} options.maxWorkers - 最大 Worker 数（默认: CPU 核心数 * 2）
   * @param {number} options.maxQueueSize - 任务队列最大长度（默认: 1000）
   * @param {number} options.taskTimeout - 单个任务超时时间 ms（默认: 30000）
   * @param {number} options.idleTimeout - Worker 空闲回收时间 ms（默认: 60000）
   * @param {Object} options.workerOptions - 传递给 Worker 构造函数的选项
   */
  constructor(workerScript, options = {}) {
    super();

    this.workerScript = workerScript;
    this.minWorkers = options.minWorkers || os.cpus().length;
    this.maxWorkers = options.maxWorkers || os.cpus().length * 2;
    this.maxQueueSize = options.maxQueueSize || 1000;
    this.taskTimeout = options.taskTimeout || 30000;
    this.idleTimeout = options.idleTimeout || 60000;
    this.workerOptions = options.workerOptions || {};

    // 状态
    this.workers = new Map();        // workerId -> Worker 实例
    this.busyWorkers = new Set();     // 忙碌中的 Worker ID
    this.taskQueue = [];              // 等待执行的任务
    this.taskIdCounter = 0;           // 任务 ID 生成器
    this.pendingTasks = new Map();    // taskId -> { resolve, reject, timer }

    // 指标
    this.metrics = {
      totalTasks: 0,
      completedTasks: 0,
      failedTasks: 0,
      timeoutTasks: 0,
      avgExecutionTime: 0,
      totalExecutionTime: 0
    };

    this.shuttingDown = false;
    this.idleCheckInterval = null;

    this.#init();
  }

  #init() {
    // 创建最小 Worker 数
    for (let i = 0; i < this.minWorkers; i++) {
      this.#createWorker();
    }

    // 启动空闲检查
    this.idleCheckInterval = setInterval(() => {
      this.#checkIdleWorkers();
    }, 10000);

    this.emit('ready', { minWorkers: this.minWorkers });
  }

  #createWorker() {
    if (this.workers.size >= this.maxWorkers) return null;

    const workerId = `worker-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const worker = new Worker(this.workerScript, {
      ...this.workerOptions,
      workerData: {
        ...this.workerOptions.workerData,
        workerId
      }
    });

    worker.workerId = workerId;
    worker.createdAt = Date.now();
    worker.taskCount = 0;
    worker.lastActiveAt = Date.now();

    worker.on('message', (result) => {
      this.#handleWorkerMessage(workerId, result);
    });

    worker.on('error', (error) => {
      this.#handleWorkerError(workerId, error);
    });

    worker.on('exit', (code) => {
      this.#handleWorkerExit(workerId, code);
    });

    this.workers.set(workerId, worker);
    this.emit('workerCreated', { workerId, totalWorkers: this.workers.size });

    return worker;
  }

  #handleWorkerMessage(workerId, result) {
    const worker = this.workers.get(workerId);
    if (worker) {
      worker.lastActiveAt = Date.now();
      worker.taskCount++;
    }

    this.busyWorkers.delete(workerId);

    // 处理结果
    if (result && result.__taskId) {
      const pending = this.pendingTasks.get(result.__taskId);
      if (pending) {
        clearTimeout(pending.timer);
        this.pendingTasks.delete(result.__taskId);

        const executionTime = Date.now() - pending.startTime;
        this.#updateMetrics(executionTime, !result.error);

        if (result.error) {
          pending.reject(new Error(result.error));
        } else {
          pending.resolve(result.data);
        }
      }
    }

    // 处理下一个任务
    this.#processQueue();
  }

  #handleWorkerError(workerId, error) {
    this.emit('workerError', { workerId, error });
    console.error(`Worker ${workerId} error:`, error);

    // 清理该 Worker 上的所有 pending 任务
    for (const [taskId, pending] of this.pendingTasks) {
      if (pending.workerId === workerId) {
        clearTimeout(pending.timer);
        this.pendingTasks.delete(taskId);
        pending.reject(error);
        this.metrics.failedTasks++;
      }
    }

    this.#removeWorker(workerId);
  }

  #handleWorkerExit(workerId, code) {
    this.busyWorkers.delete(workerId);

    if (code !== 0 && !this.shuttingDown) {
      console.warn(`Worker ${workerId} exited with code ${code}, replacing...`);
      this.#createWorker();
    }

    this.#removeWorker(workerId);
  }

  #removeWorker(workerId) {
    const worker = this.workers.get(workerId);
    if (worker) {
      worker.removeAllListeners();
      this.workers.delete(workerId);
      this.busyWorkers.delete(workerId);
      this.emit('workerRemoved', { workerId, remainingWorkers: this.workers.size });
    }
  }

  #updateMetrics(executionTime, success) {
    this.metrics.totalExecutionTime += executionTime;
    this.metrics.completedTasks++;
    this.metrics.avgExecutionTime = this.metrics.totalExecutionTime / this.metrics.completedTasks;

    if (!success) {
      this.metrics.failedTasks++;
    }
  }

  #processQueue() {
    if (this.shuttingDown || this.taskQueue.length === 0) return;

    // 找一个空闲 Worker
    let availableWorker = null;
    for (const [workerId, worker] of this.workers) {
      if (!this.busyWorkers.has(workerId)) {
        availableWorker = worker;
        break;
      }
    }

    // 如果没有空闲 Worker，尝试创建新的
    if (!availableWorker && this.workers.size < this.maxWorkers) {
      availableWorker = this.#createWorker();
    }

    // 还是没有，等待
    if (!availableWorker) return;

    const task = this.taskQueue.shift();
    this.busyWorkers.add(availableWorker.workerId);

    // 设置超时
    const timer = setTimeout(() => {
      const pending = this.pendingTasks.get(task.taskId);
      if (pending) {
        this.pendingTasks.delete(task.taskId);
        pending.reject(new Error(`Task ${task.taskId} timeout after ${this.taskTimeout}ms`));
        this.metrics.timeoutTasks++;

        // 终止超时的 Worker 并创建新的
        const worker = this.workers.get(availableWorker.workerId);
        if (worker) {
          worker.terminate();
        }
      }
    }, this.taskTimeout);

    this.pendingTasks.set(task.taskId, {
      resolve: task.resolve,
      reject: task.reject,
      timer,
      startTime: Date.now(),
      workerId: availableWorker.workerId
    });

    availableWorker.postMessage({
      __taskId: task.taskId,
      payload: task.payload
    });

    // 继续处理队列
    this.#processQueue();
  }

  #checkIdleWorkers() {
    if (this.shuttingDown) return;

    const now = Date.now();
    const workersToRemove = [];

    for (const [workerId, worker] of this.workers) {
      if (
        !this.busyWorkers.has(workerId) &&
        this.workers.size > this.minWorkers &&
        now - worker.lastActiveAt > this.idleTimeout
      ) {
        workersToRemove.push(workerId);
      }
    }

    // 只移除多余的 Worker
    const targetSize = Math.max(this.minWorkers, this.workers.size - workersToRemove.length);
    const toRemove = workersToRemove.slice(0, this.workers.size - targetSize);

    for (const workerId of toRemove) {
      const worker = this.workers.get(workerId);
      if (worker) {
        worker.terminate();
      }
    }
  }

  /**
   * 提交任务到线程池
   * @param {any} payload - 任务数据（会被结构化克隆）
   * @returns {Promise<any>}
   */
  async execute(payload) {
    if (this.shuttingDown) {
      throw new Error('Worker pool is shutting down');
    }

    if (this.taskQueue.length >= this.maxQueueSize) {
      throw new Error(`Task queue is full (${this.maxQueueSize})`);
    }

    this.metrics.totalTasks++;

    return new Promise((resolve, reject) => {
      const taskId = ++this.taskIdCounter;
      this.taskQueue.push({ taskId, payload, resolve, reject });
      this.#processQueue();
    });
  }

  /**
   * 批量提交任务
   * @param {Array<any>} payloads
   * @returns {Promise<Array<any>>}
   */
  async executeBatch(payloads) {
    return Promise.all(payloads.map(payload => this.execute(payload)));
  }

  /**
   * 获取线程池状态
   */
  getStatus() {
    return {
      workers: this.workers.size,
      busyWorkers: this.busyWorkers.size,
      idleWorkers: this.workers.size - this.busyWorkers.size,
      queueLength: this.taskQueue.length,
      pendingTasks: this.pendingTasks.size,
      metrics: { ...this.metrics }
    };
  }

  /**
   * 优雅关闭
   * @param {number} timeout - 等待超时时间 ms
   */
  async shutdown(timeout = 30000) {
    this.shuttingDown = true;

    // 停止接受新任务，等待队列清空
    const startTime = Date.now();
    while (
      (this.taskQueue.length > 0 || this.pendingTasks.size > 0) &&
      Date.now() - startTime < timeout
    ) {
      await new Promise(r => setTimeout(r, 100));
    }

    // 清理剩余任务
    for (const [taskId, pending] of this.pendingTasks) {
      clearTimeout(pending.timer);
      pending.reject(new Error('Worker pool shutdown'));
    }
    this.pendingTasks.clear();

    // 终止所有 Worker
    const terminatePromises = [];
    for (const [workerId, worker] of this.workers) {
      terminatePromises.push(worker.terminate());
    }
    await Promise.all(terminatePromises);

    clearInterval(this.idleCheckInterval);
    this.workers.clear();
    this.busyWorkers.clear();
    this.taskQueue = [];

    this.emit('shutdown');
  }
}
```

### 2.2 通用 Worker 脚本

```javascript
// lib/generic-worker.js
import { parentPort, workerData } from 'node:worker_threads';

/**
 * 通用计算 Worker
 * 接收任务数据，执行指定的计算函数，返回结果
 */

// 预加载常用模块（仅执行一次）
const modules = new Map();

async function getModule(name) {
  if (!modules.has(name)) {
    const mod = await import(name);
    modules.set(name, mod);
  }
  return modules.get(name);
}

/**
 * 注册的任务处理器
 * key: taskType, value: handler function
 */
const taskHandlers = new Map();

/**
 * 注册任务处理器
 */
export function registerHandler(taskType, handler) {
  taskHandlers.set(taskType, handler);
}

/**
 * 内置处理器示例：复杂计算
 */
registerHandler('fibonacci', (n) => {
  function fib(num) {
    if (num < 2) return num;
    return fib(num - 1) + fib(num - 2);
  }
  return fib(n);
});

registerHandler('matrixMultiply', ({ a, b }) => {
  const rows = a.length;
  const cols = b[0].length;
  const result = Array(rows).fill(null).map(() => Array(cols).fill(0));

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      for (let k = 0; k < b.length; k++) {
        result[i][j] += a[i][k] * b[k][j];
      }
    }
  }
  return result;
});

registerHandler('hash', async ({ algorithm, data }) => {
  const crypto = await import('node:crypto');
  const hash = crypto.createHash(algorithm || 'sha256');
  hash.update(data);
  return hash.digest('hex');
});

// Worker 初始化
if (parentPort) {
  console.log(`Worker ${workerData?.workerId || 'unknown'} started`);

  parentPort.on('message', async (message) => {
    const { __taskId, payload } = message;

    try {
      const { type, data } = payload;
      const handler = taskHandlers.get(type);

      if (!handler) {
        throw new Error(`Unknown task type: ${type}`);
      }

      const result = await handler(data);

      parentPort.postMessage({
        __taskId,
        data: result
      });
    } catch (error) {
      parentPort.postMessage({
        __taskId,
        error: error.message
      });
    }
  });

  // 通知主线程 Worker 已就绪
  parentPort.postMessage({ type: 'ready', workerId: workerData?.workerId });
}
```

### 2.3 使用示例

```javascript
// examples/pool-demo.js
import { WorkerPool } from '../lib/worker-pool.js';
import path from 'node:path';

const workerScript = path.resolve(import.meta.dirname, '../lib/generic-worker.js');

async function demo() {
  // 创建线程池
  const pool = new WorkerPool(workerScript, {
    minWorkers: 2,
    maxWorkers: 8,
    taskTimeout: 10000,
    idleTimeout: 30000
  });

  pool.on('ready', ({ minWorkers }) => {
    console.log(`Pool ready with ${minWorkers} workers`);
  });

  pool.on('workerCreated', ({ workerId, totalWorkers }) => {
    console.log(`Worker created: ${workerId} (total: ${totalWorkers})`);
  });

  // 单任务执行
  console.log('\n--- 单任务 ---');
  const fibResult = await pool.execute({
    type: 'fibonacci',
    data: 40
  });
  console.log(`fib(40) = ${fibResult}`);

  // 批量任务（并行）
  console.log('\n--- 批量任务 ---');
  const tasks = [35, 38, 40, 37, 39].map(n => ({
    type: 'fibonacci',
    data: n
  }));

  const startTime = Date.now();
  const results = await pool.executeBatch(tasks);
  console.log(`5 tasks completed in ${Date.now() - startTime}ms`);
  results.forEach((r, i) => console.log(`  fib(${tasks[i].data}) = ${r}`));

  // 矩阵乘法
  console.log('\n--- 矩阵乘法 ---');
  const matrixResult = await pool.execute({
    type: 'matrixMultiply',
    data: {
      a: [[1, 2], [3, 4]],
      b: [[5, 6], [7, 8]]
    }
  });
  console.log('Result:', matrixResult);

  // 查看状态
  console.log('\n--- 线程池状态 ---');
  console.log(pool.getStatus());

  // 优雅关闭
  await pool.shutdown();
}

demo().catch(console.error);
```

---

## 3. 实战：电商大数据聚合计算

### 3.1 场景描述

大型电商平台每日需要处理海量订单数据，进行多维度的实时聚合统计（按地区、品类、时间等）。单线程处理百万级数据需要数分钟，严重影响报表生成时效。

### 3.2 分片并行聚合架构

```javascript
// workers/aggregator-worker.js
import { parentPort, workerData } from 'node:worker_threads';

/**
 * 数据聚合 Worker
 * 接收一批订单数据，按指定维度聚合
 */

function aggregateOrders(orders, dimensions) {
  const result = new Map();

  for (const order of orders) {
    // 构建聚合键
    const keys = dimensions.map(dim => {
      if (dim === 'date') {
        return order.createdAt?.slice(0, 10) || 'unknown';
      }
      if (dim === 'hour') {
        return order.createdAt?.slice(0, 13) || 'unknown';
      }
      if (dim === 'region') {
        // 从地址中提取省份
        const match = order.address?.match(/^(.+?)[省市]/);
        return match ? match[1] : 'unknown';
      }
      return order[dim] || 'unknown';
    });

    const key = keys.join('|');

    if (!result.has(key)) {
      result.set(key, {
        dimensions: Object.fromEntries(dimensions.map((d, i) => [d, keys[i]])),
        totalAmount: 0,
        totalOrders: 0,
        totalItems: 0,
        avgOrderValue: 0,
        minAmount: Infinity,
        maxAmount: 0
      });
    }

    const agg = result.get(key);
    agg.totalAmount += order.amount || 0;
    agg.totalOrders += 1;
    agg.totalItems += order.itemCount || 1;
    agg.minAmount = Math.min(agg.minAmount, order.amount || 0);
    agg.maxAmount = Math.max(agg.maxAmount, order.amount || 0);
  }

  // 计算平均值
  for (const agg of result.values()) {
    agg.avgOrderValue = agg.totalOrders > 0 ? agg.totalAmount / agg.totalOrders : 0;
  }

  return Array.from(result.values());
}

if (parentPort) {
  parentPort.on('message', (message) => {
    const { __taskId, payload } = message;
    const { orders, dimensions } = payload;

    try {
      const startTime = performance.now();
      const aggregated = aggregateOrders(orders, dimensions);
      const executionTime = performance.now() - startTime;

      parentPort.postMessage({
        __taskId,
        data: {
          results: aggregated,
          processedCount: orders.length,
          executionTime
        }
      });
    } catch (error) {
      parentPort.postMessage({
        __taskId,
        error: error.message
      });
    }
  });
}
```

```javascript
// services/order-aggregator.js
import { WorkerPool } from '../lib/worker-pool.js';
import path from 'node:path';

const WORKER_SCRIPT = path.resolve(import.meta.dirname, '../workers/aggregator-worker.js');

/**
 * 订单聚合服务
 * 利用多线程并行处理大数据集
 */
export class OrderAggregator {
  constructor(options = {}) {
    this.pool = new WorkerPool(WORKER_SCRIPT, {
      minWorkers: options.minWorkers || 4,
      maxWorkers: options.maxWorkers || 16,
      maxQueueSize: 100,
      taskTimeout: 120000,
      ...options
    });
  }

  /**
   * 聚合订单数据
   * @param {Array} orders - 订单数组
   * @param {Array<string>} dimensions - 聚合维度
   * @param {Object} options
   * @param {number} options.chunkSize - 每批处理的数据量（默认 10000）
   * @returns {Promise<Array>} 聚合结果
   */
  async aggregate(orders, dimensions, options = {}) {
    const chunkSize = options.chunkSize || 10000;
    const totalOrders = orders.length;

    console.log(`[Aggregator] Starting aggregation of ${totalOrders} orders...`);
    const overallStart = performance.now();

    // 1. 数据分片
    const chunks = [];
    for (let i = 0; i < totalOrders; i += chunkSize) {
      chunks.push(orders.slice(i, i + chunkSize));
    }

    console.log(`[Aggregator] Split into ${chunks.length} chunks (${chunkSize} orders/chunk)`);

    // 2. 并行处理每个分片
    const tasks = chunks.map(chunk => ({
      type: 'aggregate',
      data: {
        orders: chunk,
        dimensions
      }
    }));

    // 使用自定义 payload 格式
    const workerTasks = chunks.map(chunk => ({
      orders: chunk,
      dimensions
    }));

    // 重写为直接使用 execute
    const results = await Promise.all(
      workerTasks.map(task => this.pool.execute(task))
    );

    // 3. 合并各分片的聚合结果
    const merged = this.#mergeResults(
      results.map(r => r.results),
      dimensions
    );

    const totalTime = performance.now() - overallStart;
    console.log(`[Aggregator] Completed in ${totalTime.toFixed(2)}ms, ${merged.length} groups`);

    return {
      data: merged,
      statistics: {
        totalOrders,
        totalGroups: merged.length,
        chunksProcessed: chunks.length,
        executionTime: totalTime,
        avgChunkTime: results.reduce((sum, r) => sum + r.executionTime, 0) / results.length
      }
    };
  }

  #mergeResults(chunkResults, dimensions) {
    const merged = new Map();

    for (const chunk of chunkResults) {
      for (const item of chunk) {
        const key = dimensions.map(d => item.dimensions[d]).join('|');

        if (!merged.has(key)) {
          merged.set(key, { ...item });
        } else {
          const existing = merged.get(key);
          existing.totalAmount += item.totalAmount;
          existing.totalOrders += item.totalOrders;
          existing.totalItems += item.totalItems;
          existing.minAmount = Math.min(existing.minAmount, item.minAmount);
          existing.maxAmount = Math.max(existing.maxAmount, item.maxAmount);
          existing.avgOrderValue = existing.totalAmount / existing.totalOrders;
        }
      }
    }

    return Array.from(merged.values());
  }

  getStatus() {
    return this.pool.getStatus();
  }

  async shutdown() {
    await this.pool.shutdown();
  }
}
```

### 3.3 性能对比

```javascript
// benchmark/aggregator-benchmark.js
import { OrderAggregator } from '../services/order-aggregator.js';

// 生成测试数据
function generateOrders(count) {
  const regions = ['北京', '上海', '广州', '深圳', '杭州', '成都', '武汉', '西安'];
  const categories = ['电子', '服装', '食品', '家居', '美妆', '图书'];
  const orders = [];

  for (let i = 0; i < count; i++) {
    orders.push({
      id: `ORDER-${i}`,
      amount: Math.random() * 1000 + 10,
      itemCount: Math.floor(Math.random() * 10) + 1,
      region: regions[Math.floor(Math.random() * regions.length)],
      category: categories[Math.floor(Math.random() * categories.length)],
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      address: `${regions[Math.floor(Math.random() * regions.length)]}市某某区某某路${Math.floor(Math.random() * 1000)}号`
    });
  }

  return orders;
}

// 单线程聚合
function singleThreadAggregate(orders, dimensions) {
  const result = new Map();

  for (const order of orders) {
    const keys = dimensions.map(dim => {
      if (dim === 'date') return order.createdAt?.slice(0, 10);
      if (dim === 'region') {
        const match = order.address?.match(/^(.+?)[省市]/);
        return match ? match[1] : 'unknown';
      }
      return order[dim];
    });

    const key = keys.join('|');
    if (!result.has(key)) {
      result.set(key, { totalAmount: 0, totalOrders: 0 });
    }
    result.get(key).totalAmount += order.amount;
    result.get(key).totalOrders += 1;
  }

  return Array.from(result.values());
}

async function benchmark() {
  const orderCounts = [10000, 50000, 100000, 500000];
  const dimensions = ['region', 'category'];

  console.log('=== 订单聚合性能对比 ===\n');

  for (const count of orderCounts) {
    console.log(`\n--- ${count.toLocaleString()} 条订单 ---`);
    const orders = generateOrders(count);

    // 单线程
    const stStart = performance.now();
    singleThreadAggregate(orders, dimensions);
    const stTime = performance.now() - stStart;
    console.log(`单线程: ${stTime.toFixed(2)}ms`);

    // 多线程
    const aggregator = new OrderAggregator({
      minWorkers: 4,
      maxWorkers: 8
    });

    const mtStart = performance.now();
    await aggregator.aggregate(orders, dimensions, { chunkSize: 10000 });
    const mtTime = performance.now() - mtStart;
    console.log(`多线程: ${mtTime.toFixed(2)}ms`);
    console.log(`加速比: ${(stTime / mtTime).toFixed(2)}x`);

    await aggregator.shutdown();
  }
}

benchmark().catch(console.error);
```

---

## 4. 实战：图片处理流水线

### 4.1 场景描述

电商平台需要处理用户上传的商品图片：压缩、生成缩略图、添加水印、格式转换等。使用 `sharp` 库配合 Worker Threads 可以充分利用多核 CPU。

```bash
npm install sharp
```

### 4.2 图片处理 Worker

```javascript
// workers/image-processor.js
import { parentPort, workerData } from 'node:worker_threads';
import path from 'node:path';

/**
 * 图片处理 Worker
 * 使用 sharp 进行高性能图片处理
 */
let sharp;

async function init() {
  sharp = (await import('sharp')).default;
}

const PROCESSORS = {
  /**
   * 压缩图片
   */
  async compress({ input, output, quality = 80 }) {
    await sharp(input)
      .jpeg({ quality, progressive: true, mozjpeg: true })
      .toFile(output);

    return { operation: 'compress', output };
  },

  /**
   * 生成缩略图
   */
  async thumbnail({ input, output, width = 300, height = 300 }) {
    await sharp(input)
      .resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: 85 })
      .toFile(output);

    return { operation: 'thumbnail', output, size: `${width}x${height}` };
  },

  /**
   * 添加水印
   */
  async watermark({ input, output, watermarkText, position = 'southeast' }) {
    const image = sharp(input);
    const metadata = await image.metadata();

    // 根据图片大小计算水印文字大小
    const fontSize = Math.max(12, Math.floor(Math.min(metadata.width, metadata.height) * 0.03));

    // 创建水印 SVG
    const svg = `
      <svg width="${metadata.width}" height="${metadata.height}">
        <text x="${metadata.width - 20}" y="${metadata.height - 20}"
              font-family="Arial" font-size="${fontSize}"
              fill="rgba(255,255,255,0.5)" text-anchor="end">${watermarkText}</text>
      </svg>
    `;

    await image
      .composite([{ input: Buffer.from(svg), gravity: position }])
      .toFile(output);

    return { operation: 'watermark', output };
  },

  /**
   * 格式转换
   */
  async convert({ input, output, format, options = {} }) {
    const pipeline = sharp(input);

    switch (format) {
      case 'webp':
        pipeline.webp({ quality: options.quality || 85 });
        break;
      case 'avif':
        pipeline.avif({ quality: options.quality || 70 });
        break;
      case 'png':
        pipeline.png({ compressionLevel: 9 });
        break;
      case 'jpeg':
      case 'jpg':
        pipeline.jpeg({ quality: options.quality || 85 });
        break;
      default:
        throw new Error(`Unsupported format: ${format}`);
    }

    await pipeline.toFile(output);
    return { operation: 'convert', output, format };
  },

  /**
   * 批量处理（压缩 + 缩略图 + 水印）
   */
  async pipeline({ input, outputDir, config }) {
    const results = [];
    const basename = path.basename(input, path.extname(input));

    // 1. 压缩原图
    if (config.compress) {
      const output = path.join(outputDir, `${basename}_compressed.jpg`);
      results.push(await this.compress({
        input,
        output,
        quality: config.compress.quality
      }));
    }

    // 2. 生成缩略图
    if (config.thumbnail) {
      const output = path.join(outputDir, `${basename}_thumb.jpg`);
      results.push(await this.thumbnail({
        input,
        output,
        width: config.thumbnail.width,
        height: config.thumbnail.height
      }));
    }

    // 3. 添加水印
    if (config.watermark) {
      const output = path.join(outputDir, `${basename}_marked.jpg`);
      results.push(await this.watermark({
        input: results[0]?.output || input,
        output,
        watermarkText: config.watermark.text
      }));
    }

    // 4. 生成 WebP 版本
    if (config.webp) {
      const output = path.join(outputDir, `${basename}.webp`);
      results.push(await this.convert({
        input: results[0]?.output || input,
        output,
        format: 'webp'
      }));
    }

    return { operation: 'pipeline', results };
  }
};

if (parentPort) {
  init().then(() => {
    parentPort.postMessage({ type: 'ready', workerId: workerData?.workerId });

    parentPort.on('message', async (message) => {
      const { __taskId, payload } = message;
      const { operation, params } = payload;

      try {
        const processor = PROCESSORS[operation];
        if (!processor) {
          throw new Error(`Unknown operation: ${operation}`);
        }

        const result = await processor.call(PROCESSORS, params);

        parentPort.postMessage({
          __taskId,
          data: result
        });
      } catch (error) {
        parentPort.postMessage({
          __taskId,
          error: error.message
        });
      }
    });
  });
}
```

### 4.3 图片处理服务

```javascript
// services/image-service.js
import { WorkerPool } from '../lib/worker-pool.js';
import path from 'node:path';
import fs from 'node:fs/promises';

const WORKER_SCRIPT = path.resolve(import.meta.dirname, '../workers/image-processor.js');

/**
 * 图片处理服务
 * 支持批量并行处理，适合电商图片上传场景
 */
export class ImageService {
  constructor(options = {}) {
    this.pool = new WorkerPool(WORKER_SCRIPT, {
      minWorkers: options.minWorkers || 2,
      maxWorkers: options.maxWorkers || Math.min(8, navigator?.hardwareConcurrency || 4),
      taskTimeout: 60000,
      idleTimeout: 300000,
      workerOptions: {
        execArgv: ['--max-old-space-size=512'] // Worker 内存限制
      }
    });
  }

  /**
   * 单张图片流水线处理
   */
  async processImage(input, outputDir, config) {
    await fs.mkdir(outputDir, { recursive: true });

    return this.pool.execute({
      operation: 'pipeline',
      params: { input, outputDir, config }
    });
  }

  /**
   * 批量处理图片
   */
  async processBatch(inputs, outputDir, config, options = {}) {
    await fs.mkdir(outputDir, { recursive: true });

    const concurrency = options.concurrency || 4;
    const results = [];

    // 控制并发数
    for (let i = 0; i < inputs.length; i += concurrency) {
      const batch = inputs.slice(i, i + concurrency);
      const batchResults = await Promise.all(
        batch.map(input =>
          this.pool.execute({
            operation: 'pipeline',
            params: { input, outputDir, config }
          }).catch(error => ({
            error: true,
            input,
            message: error.message
          }))
        )
      );
      results.push(...batchResults);
    }

    return {
      total: inputs.length,
      success: results.filter(r => !r.error).length,
      failed: results.filter(r => r.error).length,
      results
    };
  }

  async shutdown() {
    await this.pool.shutdown();
  }
}
```

---

## 5. 实战：SharedArrayBuffer 高性能数据共享

### 5.1 场景描述

高频交易系统、实时数据流处理等场景需要在多个 Worker 之间共享大量数据，传统的 `postMessage` 拷贝传输性能不足。`SharedArrayBuffer` 允许多个线程直接读写同一块内存。

### 5.2 共享内存环形缓冲区

```javascript
// lib/shared-ring-buffer.js
/**
 * 基于 SharedArrayBuffer 的无锁环形缓冲区
 * 适用于高频数据生产者-消费者场景
 */
export class SharedRingBuffer {
  /**
   * @param {SharedArrayBuffer} sab - 共享内存（若为空则新建）
   * @param {number} capacity - 元素容量
   * @param {number} elementSize - 每个元素的字节数
   */
  constructor(sab, capacity = 1024, elementSize = 64) {
    const headerSize = 16; // 4 个 Int32: head, tail, size, capacity
    const dataSize = capacity * elementSize;

    if (sab) {
      this.sab = sab;
      this.header = new Int32Array(sab, 0, 4);
      this.capacity = this.header[3];
      this.elementSize = elementSize;
      this.data = new Uint8Array(sab, headerSize);
    } else {
      this.sab = new SharedArrayBuffer(headerSize + dataSize);
      this.header = new Int32Array(this.sab, 0, 4);
      this.capacity = capacity;
      this.elementSize = elementSize;
      this.data = new Uint8Array(this.sab, headerSize);

      Atomics.store(this.header, 0, 0); // head
      Atomics.store(this.header, 1, 0); // tail
      Atomics.store(this.header, 2, 0); // size
      Atomics.store(this.header, 3, capacity); // capacity
    }
  }

  /**
   * 写入数据
   * @returns {boolean} 是否成功
   */
  enqueue(data) {
    const tail = Atomics.load(this.header, 1);
    const nextTail = (tail + 1) % this.capacity;

    // 检查是否已满
    if (nextTail === Atomics.load(this.header, 0)) {
      return false; // 缓冲区已满
    }

    // 写入数据
    const offset = tail * this.elementSize;
    const encoded = new TextEncoder().encode(JSON.stringify(data));
    const len = Math.min(encoded.length, this.elementSize - 4);

    // 前 4 字节存长度
    new DataView(this.sab, 16 + offset, 4).setInt32(0, len, true);
    // 后面存数据
    this.data.set(encoded.slice(0, len), offset + 4);

    // 更新 tail
    Atomics.store(this.header, 1, nextTail);
    Atomics.add(this.header, 2, 1);

    // 通知等待的消费者
    Atomics.notify(this.header, 1, 1);

    return true;
  }

  /**
   * 读取数据
   * @param {number} timeout - 等待超时 ms（0 表示不等待）
   * @returns {any|null}
   */
  dequeue(timeout = 0) {
    const head = Atomics.load(this.header, 0);

    // 检查是否为空
    if (head === Atomics.load(this.header, 1)) {
      if (timeout > 0) {
        Atomics.wait(this.header, 1, head, timeout);
        return this.dequeue(0); // 重新尝试
      }
      return null;
    }

    // 读取数据
    const offset = head * this.elementSize;
    const len = new DataView(this.sab, 16 + offset, 4).getInt32(0, true);
    const bytes = this.data.slice(offset + 4, offset + 4 + len);
    const data = JSON.parse(new TextDecoder().decode(bytes));

    // 更新 head
    const nextHead = (head + 1) % this.capacity;
    Atomics.store(this.header, 0, nextHead);
    Atomics.sub(this.header, 2, 1);

    return data;
  }

  /**
   * 获取当前大小
   */
  get size() {
    return Atomics.load(this.header, 2);
  }

  get buffer() {
    return this.sab;
  }
}
```

### 5.3 实时数据流处理

```javascript
// workers/stream-processor.js
import { parentPort, workerData } from 'node:worker_threads';
import { SharedRingBuffer } from '../lib/shared-ring-buffer.js';

/**
 * 实时数据流处理 Worker
 * 从共享内存环形缓冲区读取数据并处理
 */

let buffer;
let running = false;
let processedCount = 0;

function init() {
  const { sharedBuffer, workerIndex, totalWorkers } = workerData;
  buffer = new SharedRingBuffer(sharedBuffer);

  console.log(`Stream processor ${workerIndex}/${totalWorkers} started`);

  running = true;
  processLoop();
}

async function processLoop() {
  while (running) {
    const item = buffer.dequeue(100); // 等待最多 100ms

    if (item) {
      try {
        const result = await processItem(item);
        processedCount++;

        // 每 1000 条报告一次
        if (processedCount % 1000 === 0) {
          parentPort.postMessage({
            type: 'progress',
            workerIndex: workerData.workerIndex,
            processed: processedCount
          });
        }

        // 将结果传回主线程
        if (result) {
          parentPort.postMessage({
            type: 'result',
            data: result
          });
        }
      } catch (error) {
        parentPort.postMessage({
          type: 'error',
          error: error.message,
          item
        });
      }
    }
  }
}

async function processItem(item) {
  // 模拟复杂的数据处理
  const { type, data } = item;

  switch (type) {
    case 'price':
      return processPriceData(data);
    case 'order':
      return processOrderData(data);
    case 'metric':
      return processMetricData(data);
    default:
      return null;
  }
}

function processPriceData(data) {
  // 价格异动检测
  const { symbol, price, timestamp } = data;

  // 简单示例：检测超过 5% 的涨跌幅
  // 实际生产中会维护滑动窗口历史数据
  return {
    type: 'price_alert',
    symbol,
    price,
    timestamp,
    alert: Math.abs((price - (price * 0.95)) / price) > 0.05
  };
}

function processOrderData(data) {
  // 订单风险检测
  const { orderId, amount, userId } = data;

  return {
    type: 'order_check',
    orderId,
    risk: amount > 100000 ? 'high' : amount > 10000 ? 'medium' : 'low'
  };
}

function processMetricData(data) {
  // 指标聚合
  return {
    type: 'metric_aggregated',
    ...data,
    processedAt: Date.now()
  };
}

if (parentPort) {
  parentPort.on('message', (message) => {
    if (message.type === 'stop') {
      running = false;
      parentPort.postMessage({
        type: 'stopped',
        processed: processedCount
      });
    }
  });

  init();
}
```

```javascript
// services/stream-engine.js
import { Worker } from 'node:worker_threads';
import { SharedRingBuffer } from '../lib/shared-ring-buffer.js';
import path from 'node:path';
import { EventEmitter } from 'node:events';

const WORKER_SCRIPT = path.resolve(import.meta.dirname, '../workers/stream-processor.js');

/**
 * 实时流处理引擎
 * 多消费者并行处理共享内存中的数据
 */
export class StreamEngine extends EventEmitter {
  constructor(options = {}) {
    super();
    this.consumerCount = options.consumerCount || 4;
    this.bufferCapacity = options.bufferCapacity || 100000;
    this.elementSize = options.elementSize || 256;

    this.ringBuffer = new SharedRingBuffer(
      null,
      this.bufferCapacity,
      this.elementSize
    );

    this.consumers = [];
    this.producing = false;
  }

  async start() {
    // 启动消费者 Worker
    for (let i = 0; i < this.consumerCount; i++) {
      const worker = new Worker(WORKER_SCRIPT, {
        workerData: {
          sharedBuffer: this.ringBuffer.buffer,
          workerIndex: i,
          totalWorkers: this.consumerCount
        }
      });

      worker.on('message', (message) => {
        this.emit(message.type, message);
      });

      worker.on('error', (error) => {
        this.emit('error', { workerIndex: i, error });
      });

      this.consumers.push(worker);
    }

    this.emit('started', { consumers: this.consumerCount });
  }

  /**
   * 推送数据到处理队列
   */
  push(type, data) {
    const success = this.ringBuffer.enqueue({ type, data, timestamp: Date.now() });

    if (!success) {
      this.emit('overflow', { type, data });
    }

    return success;
  }

  /**
   * 批量推送
   */
  pushBatch(items) {
    let success = 0;
    let failed = 0;

    for (const item of items) {
      if (this.push(item.type, item.data)) {
        success++;
      } else {
        failed++;
      }
    }

    return { success, failed };
  }

  getStatus() {
    return {
      bufferSize: this.ringBuffer.size,
      bufferCapacity: this.bufferCapacity,
      consumers: this.consumers.length,
      utilization: (this.ringBuffer.size / this.bufferCapacity * 100).toFixed(2) + '%'
    };
  }

  async stop() {
    // 通知所有消费者停止
    const stopPromises = this.consumers.map(worker =>
      new Promise((resolve) => {
        worker.once('message', (msg) => {
          if (msg.type === 'stopped') {
            resolve(msg.processed);
          }
        });
        worker.postMessage({ type: 'stop' });
      })
    );

    await Promise.all(stopPromises);

    // 终止 Worker
    for (const worker of this.consumers) {
      await worker.terminate();
    }

    this.consumers = [];
    this.emit('stopped');
  }
}
```

---

## 6. 实战：加密运算 offload

### 6.1 场景描述

用户注册、密码验证、文件校验等场景涉及大量加密哈希运算（bcrypt、Argon2、SHA 等），这些 CPU 密集型操作会阻塞事件循环。

```bash
npm install bcrypt argon2
```

### 6.2 加密 Worker

```javascript
// workers/crypto-worker.js
import { parentPort, workerData } from 'node:worker_threads';

/**
 * 加密运算 Worker
 * 将 CPU 密集型密码学运算 offload 到独立线程
 */

const OPERATIONS = {
  /**
   * bcrypt 密码哈希
   */
  async bcryptHash({ password, rounds = 12 }) {
    const bcrypt = await import('bcrypt');
    return bcrypt.hash(password, rounds);
  },

  /**
   * bcrypt 密码验证
   */
  async bcryptCompare({ password, hash }) {
    const bcrypt = await import('bcrypt');
    return bcrypt.compare(password, hash);
  },

  /**
   * Argon2 密码哈希（更现代的选择）
   */
  async argon2Hash({ password, options = {} }) {
    const argon2 = await import('argon2');
    return argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: options.memoryCost || 65536,
      timeCost: options.timeCost || 3,
      parallelism: options.parallelism || 4,
      ...options
    });
  },

  /**
   * Argon2 验证
   */
  async argon2Verify({ password, hash }) {
    const argon2 = await import('argon2');
    return argon2.verify(hash, password);
  },

  /**
   * PBKDF2 密钥派生
   */
  async pbkdf2({ password, salt, iterations = 100000, keyLength = 64, digest = 'sha512' }) {
    const { pbkdf2Sync } = await import('node:crypto');
    return pbkdf2Sync(password, salt, iterations, keyLength, digest).toString('hex');
  },

  /**
   * 大文件 SHA-256 校验
   */
  async fileHash({ filePath, algorithm = 'sha256' }) {
    const { createHash } = await import('node:crypto');
    const { createReadStream } = await import('node:fs');

    return new Promise((resolve, reject) => {
      const hash = createHash(algorithm);
      const stream = createReadStream(filePath);

      stream.on('data', chunk => hash.update(chunk));
      stream.on('end', () => resolve(hash.digest('hex')));
      stream.on('error', reject);
    });
  },

  /**
   * 批量哈希
   */
  async batchHash({ items, algorithm = 'sha256' }) {
    const { createHash } = await import('node:crypto');

    return items.map(item => {
      const hash = createHash(algorithm);
      hash.update(typeof item === 'string' ? item : JSON.stringify(item));
      return hash.digest('hex');
    });
  }
};

if (parentPort) {
  parentPort.on('message', async (message) => {
    const { __taskId, payload } = message;
    const { operation, params } = payload;

    try {
      const handler = OPERATIONS[operation];
      if (!handler) {
        throw new Error(`Unknown crypto operation: ${operation}`);
      }

      const startTime = performance.now();
      const result = await handler(params);
      const executionTime = performance.now() - startTime;

      parentPort.postMessage({
        __taskId,
        data: {
          result,
          executionTime
        }
      });
    } catch (error) {
      parentPort.postMessage({
        __taskId,
        error: error.message
      });
    }
  });
}
```

### 6.3 密码服务集成 Express

```javascript
// services/password-service.js
import { WorkerPool } from '../lib/worker-pool.js';
import path from 'node:path';

const WORKER_SCRIPT = path.resolve(import.meta.dirname, '../workers/crypto-worker.js');

/**
 * 密码服务
 * 为 Web 应用提供非阻塞的密码学操作
 */
export class PasswordService {
  constructor(options = {}) {
    this.pool = new WorkerPool(WORKER_SCRIPT, {
      minWorkers: options.minWorkers || 2,
      maxWorkers: options.maxWorkers || 8,
      taskTimeout: 30000
    });

    this.config = {
      bcryptRounds: options.bcryptRounds || 12,
      argon2MemoryCost: options.argon2MemoryCost || 65536,
      argon2TimeCost: options.argon2TimeCost || 3
    };
  }

  /**
   * 哈希密码
   */
  async hashPassword(password, algorithm = 'argon2') {
    if (algorithm === 'bcrypt') {
      const { data } = await this.pool.execute({
        operation: 'bcryptHash',
        params: { password, rounds: this.config.bcryptRounds }
      });
      return data.result;
    }

    const { data } = await this.pool.execute({
      operation: 'argon2Hash',
      params: { password }
    });
    return data.result;
  }

  /**
   * 验证密码
   */
  async verifyPassword(password, hash) {
    // 根据 hash 前缀判断算法
    if (hash.startsWith('$2')) {
      const { data } = await this.pool.execute({
        operation: 'bcryptCompare',
        params: { password, hash }
      });
      return data.result;
    }

    const { data } = await this.pool.execute({
      operation: 'argon2Verify',
      params: { password, hash }
    });
    return data.result;
  }

  /**
   * 批量哈希（用于初始化数据等）
   */
  async hashBatch(passwords, algorithm = 'argon2') {
    // 并行处理
    return Promise.all(
      passwords.map(pw => this.hashPassword(pw, algorithm))
    );
  }

  async shutdown() {
    await this.pool.shutdown();
  }
}
```

```javascript
// examples/express-auth.js
import express from 'express';
import { PasswordService } from '../services/password-service.js';

const app = express();
app.use(express.json());

const passwordService = new PasswordService();

// 模拟用户数据库
const users = new Map();

// 注册
app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  try {
    // 密码哈希 offload 到 Worker 线程，不阻塞事件循环
    const hash = await passwordService.hashPassword(password);

    users.set(username, {
      username,
      passwordHash: hash,
      createdAt: new Date().toISOString()
    });

    res.json({ success: true, username });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 登录
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users.get(username);

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  try {
    const valid = await passwordService.verifyPassword(password, user.passwordHash);

    if (valid) {
      res.json({ success: true, username });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 健康检查（不会被加密操作阻塞）
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Auth server running on port ${PORT}`);
  console.log('Password hashing offloaded to worker threads');
});

// 优雅关闭
process.on('SIGTERM', async () => {
  await passwordService.shutdown();
  process.exit(0);
});
```

---

## 7. Worker 通信高级模式

### 7.1 MessageChannel 实现请求-响应

```javascript
// lib/rpc-channel.js
import { MessageChannel } from 'node:worker_threads';

/**
 * 基于 MessageChannel 的 RPC 通道
 * 实现请求-响应模式，支持超时和错误处理
 */
export class RpcChannel {
  constructor() {
    const { port1, port2 } = new MessageChannel();
    this.localPort = port1;
    this.remotePort = port2;
    this.pendingRequests = new Map();
    this.requestId = 0;

    this.localPort.on('message', (message) => {
      if (message.__rpcResponse && this.pendingRequests.has(message.id)) {
        const { resolve, reject, timer } = this.pendingRequests.get(message.id);
        clearTimeout(timer);
        this.pendingRequests.delete(message.id);

        if (message.error) {
          reject(new Error(message.error));
        } else {
          resolve(message.result);
        }
      }
    });
  }

  /**
   * 发送 RPC 请求
   */
  async call(method, params, timeout = 30000) {
    const id = ++this.requestId;

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new Error(`RPC call timeout: ${method}`));
      }, timeout);

      this.pendingRequests.set(id, { resolve, reject, timer });

      this.localPort.postMessage({
        __rpcRequest: true,
        id,
        method,
        params
      });
    });
  }

  /**
   * 获取远程端口（传递给 Worker）
   */
  getRemotePort() {
    return this.remotePort;
  }

  close() {
    this.localPort.close();
    this.remotePort.close();

    for (const { reject } of this.pendingRequests.values()) {
      reject(new Error('Channel closed'));
    }
    this.pendingRequests.clear();
  }
}
```

### 7.2 BroadcastChannel 跨 Worker 广播

```javascript
// examples/broadcast-demo.js
import { Worker, BroadcastChannel } from 'node:worker_threads';
import path from 'node:path';

/**
 * BroadcastChannel 实现跨 Worker 消息广播
 * 适合配置下发、全局事件通知等场景
 */

const workerScript = path.resolve(import.meta.dirname, 'broadcast-worker.js');

// 主线程创建广播通道
const controlChannel = new BroadcastChannel('worker-control');

// 创建多个 Worker
const workers = [];
for (let i = 0; i < 4; i++) {
  const worker = new Worker(workerScript, {
    workerData: { workerIndex: i }
  });
  workers.push(worker);
}

// 向所有 Worker 广播配置更新
function broadcastConfig(config) {
  controlChannel.postMessage({
    type: 'config-update',
    config,
    timestamp: Date.now()
  });
}

// 向所有 Worker 广播关闭信号
function broadcastShutdown() {
  controlChannel.postMessage({
    type: 'shutdown',
    timestamp: Date.now()
  });
}

// 示例：动态调整日志级别
setTimeout(() => {
  broadcastConfig({ logLevel: 'debug', featureFlags: { newAlgorithm: true } });
}, 5000);

// 优雅关闭
setTimeout(async () => {
  broadcastShutdown();
  await Promise.all(workers.map(w => w.terminate()));
  controlChannel.close();
}, 10000);
```

```javascript
// examples/broadcast-worker.js
import { parentPort, workerData, BroadcastChannel } from 'node:worker_threads';

const { workerIndex } = workerData;

// 连接广播通道
const controlChannel = new BroadcastChannel('worker-control');

let config = { logLevel: 'info' };
let running = true;

controlChannel.onmessage = (event) => {
  const { type, config: newConfig } = event.data;

  switch (type) {
    case 'config-update':
      config = { ...config, ...newConfig };
      console.log(`[Worker ${workerIndex}] Config updated:`, config);
      break;
    case 'shutdown':
      console.log(`[Worker ${workerIndex}] Received shutdown signal`);
      running = false;
      break;
  }
};

// Worker 工作循环
async function work() {
  while (running) {
    if (config.logLevel === 'debug') {
      console.log(`[Worker ${workerIndex}] Working...`);
    }
    await new Promise(r => setTimeout(r, 1000));
  }

  controlChannel.close();
  console.log(`[Worker ${workerIndex}] Stopped`);
}

work();
```

---

## 8. 生产环境最佳实践

### 8.1 Worker 监控与诊断

```javascript
// lib/worker-monitor.js
import { Worker } from 'node:worker_threads';
import { EventEmitter } from 'node:events';

/**
 * Worker 健康监控器
 * 监控 Worker 的内存使用、CPU 占用、响应时间等指标
 */
export class WorkerMonitor extends EventEmitter {
  constructor(options = {}) {
    super();
    this.checkInterval = options.checkInterval || 5000;
    this.memoryThreshold = options.memoryThreshold || 512 * 1024 * 1024; // 512MB
    this.unresponsiveThreshold = options.unresponsiveThreshold || 30000;

    this.workers = new Map();
    this.healthChecks = new Map();
    this.interval = null;
  }

  watch(worker, metadata = {}) {
    const workerId = worker.workerId || `worker-${Date.now()}`;
    this.workers.set(workerId, { worker, metadata, lastResponse: Date.now() });

    worker.on('message', (msg) => {
      if (msg.type === 'health') {
        this.healthChecks.set(workerId, {
          ...msg.data,
          checkedAt: Date.now()
        });
        const entry = this.workers.get(workerId);
        if (entry) entry.lastResponse = Date.now();
      }
    });

    worker.on('exit', () => {
      this.workers.delete(workerId);
      this.healthChecks.delete(workerId);
    });
  }

  start() {
    this.interval = setInterval(() => {
      this.#checkHealth();
    }, this.checkInterval);
  }

  #checkHealth() {
    const now = Date.now();

    for (const [workerId, { worker, lastResponse }] of this.workers) {
      const health = this.healthChecks.get(workerId);

      // 检查响应超时
      if (now - lastResponse > this.unresponsiveThreshold) {
        this.emit('unresponsive', { workerId, lastResponse });
        continue;
      }

      // 检查内存使用
      if (health && health.memoryUsage > this.memoryThreshold) {
        this.emit('memoryWarning', {
          workerId,
          memoryUsage: health.memoryUsage,
          threshold: this.memoryThreshold
        });
      }

      // 发送健康检查请求
      worker.postMessage({ type: 'health-check' });
    }
  }

  stop() {
    clearInterval(this.interval);
  }
}
```

### 8.2 Worker 内存管理

```javascript
// workers/memory-aware-worker.js
import { parentPort } from 'node:worker_threads';

/**
 * 内存感知型 Worker
 * 主动监控内存使用，超限时请求主线程回收
 */

const MEMORY_LIMIT = 256 * 1024 * 1024; // 256MB
const CHECK_INTERVAL = 5000;

function getMemoryUsage() {
  const usage = process.memoryUsage();
  return {
    rss: usage.rss,
    heapUsed: usage.heapUsed,
    heapTotal: usage.heapTotal,
    external: usage.external
  };
}

function checkMemory() {
  const usage = getMemoryUsage();

  if (usage.rss > MEMORY_LIMIT * 0.9) {
    // 通知主线程内存即将超限
    parentPort.postMessage({
      type: 'memory-pressure',
      usage
    });

    // 尝试 GC（如果允许）
    if (global.gc) {
      global.gc();
    }
  }

  return usage;
}

// 定期报告健康状态
setInterval(() => {
  const usage = checkMemory();
  parentPort.postMessage({
    type: 'health',
    data: {
      memoryUsage: usage.rss,
      uptime: process.uptime()
    }
  });
}, CHECK_INTERVAL);

parentPort.on('message', async (message) => {
  if (message.type === 'health-check') {
    parentPort.postMessage({
      type: 'health',
      data: {
        memoryUsage: getMemoryUsage().rss,
        uptime: process.uptime()
      }
    });
    return;
  }

  // 处理业务消息...
});
```

### 8.3 错误处理与重试

```javascript
// lib/resilient-worker.js
import { Worker } from 'node:worker_threads';

/**
 * 弹性 Worker 包装器
 * 自动重启、指数退避重试、优雅降级
 */
export class ResilientWorker {
  constructor(script, options = {}) {
    this.script = script;
    this.options = options;
    this.maxRestarts = options.maxRestarts || 5;
    this.restartWindow = options.restartWindow || 60000; // 1分钟
    this.backoffBase = options.backoffBase || 1000;
    this.backoffMax = options.backoffMax || 30000;

    this.worker = null;
    this.restartCount = 0;
    this.restartTimestamps = [];
    this.pendingMessages = [];
    this.messageQueue = [];

    this.#start();
  }

  #start() {
    this.worker = new Worker(this.script, this.options);

    this.worker.on('error', (error) => {
      console.error('Worker error:', error);
      this.#handleFailure();
    });

    this.worker.on('exit', (code) => {
      if (code !== 0) {
        console.warn(`Worker exited with code ${code}`);
        this.#handleFailure();
      }
    });

    // 重发排队中的消息
    for (const msg of this.messageQueue) {
      this.worker.postMessage(msg);
    }
    this.messageQueue = [];
  }

  #handleFailure() {
    const now = Date.now();

    // 清理过期记录
    this.restartTimestamps = this.restartTimestamps.filter(
      t => now - t < this.restartWindow
    );

    if (this.restartTimestamps.length >= this.maxRestarts) {
      console.error('Max restarts reached, entering degraded mode');
      this.#enterDegradedMode();
      return;
    }

    // 计算退避时间
    const backoff = Math.min(
      this.backoffBase * Math.pow(2, this.restartTimestamps.length),
      this.backoffMax
    );

    this.restartTimestamps.push(now);

    console.log(`Restarting worker in ${backoff}ms...`);
    setTimeout(() => this.#start(), backoff);
  }

  #enterDegradedMode() {
    // 在降级模式下，消息被缓存，Worker 不再重启
    this.emit?.('degraded');
  }

  postMessage(message) {
    if (this.worker) {
      this.worker.postMessage(message);
    } else {
      this.messageQueue.push(message);
    }
  }

  on(event, handler) {
    if (this.worker) {
      this.worker.on(event, handler);
    }
  }

  terminate() {
    return this.worker?.terminate();
  }
}
```

---

## 9. 完整项目结构

```
project/
├── package.json              # "type": "module"
├── src/
│   ├── main.js              # 应用入口
│   ├── lib/
│   │   ├── worker-pool.js   # 线程池实现
│   │   ├── shared-ring-buffer.js  # 共享内存环形缓冲区
│   │   ├── rpc-channel.js   # RPC 通信通道
│   │   └── worker-monitor.js # Worker 健康监控
│   ├── workers/
│   │   ├── generic-worker.js    # 通用计算 Worker
│   │   ├── aggregator-worker.js # 数据聚合 Worker
│   │   ├── image-processor.js   # 图片处理 Worker
│   │   ├── stream-processor.js  # 流处理 Worker
│   │   ├── crypto-worker.js     # 加密运算 Worker
│   │   └── memory-aware-worker.js # 内存感知 Worker
│   ├── services/
│   │   ├── order-aggregator.js
│   │   ├── image-service.js
│   │   ├── stream-engine.js
│   │   └── password-service.js
│   └── examples/
│       ├── pool-demo.js
│       ├── express-auth.js
│       └── broadcast-demo.js
├── benchmark/
│   └── aggregator-benchmark.js
└── test/
    └── worker-pool.test.js
```

---

## 10. 总结

| 场景 | 方案 | 关键 API |
|------|------|----------|
| CPU 密集型计算 | Worker Pool + 任务队列 | `Worker`, `workerData` |
| 大数据聚合 | 分片并行 + 结果合并 | `WorkerPool.executeBatch()` |
| 图片/媒体处理 | 专用 Worker + sharp | `Worker` + 第三方库 |
| 高频数据流 | SharedArrayBuffer 环形缓冲区 | `SharedArrayBuffer`, `Atomics` |
| 密码学运算 | Express + Worker Pool | `WorkerPool` + bcrypt/argon2 |
| 配置/事件广播 | BroadcastChannel | `BroadcastChannel` |
| 点对点通信 | MessageChannel | `MessageChannel`, `MessagePort` |

### 关键注意事项

1. **不要滥用 Worker**：创建/销毁 Worker 有开销，配合线程池复用；I/O 密集型任务不需要 Worker
2. **数据序列化**：`postMessage` 使用结构化克隆算法，不能传递函数和某些对象；大数据量优先使用 `SharedArrayBuffer`
3. **内存隔离**：每个 Worker 有独立的 V8 堆，注意内存总量控制
4. **调试困难**：Worker 中的 `console.log` 会输出到主进程 stdout，但堆栈跟踪较复杂；使用 `--inspect` 配合 Chrome DevTools 可以调试 Worker
5. **共享状态**：使用 `Atomics` API 操作 `SharedArrayBuffer`，避免数据竞争
6. **资源限制**：生产环境设置 `--max-old-space-size` 和 Worker 数量上限

Node.js 26+ 在 Worker Threads 方面持续改进，建议关注官方 changelog 获取最新优化。
