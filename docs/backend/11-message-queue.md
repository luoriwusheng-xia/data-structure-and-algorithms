# Node.js 消息队列接入与实战场景

消息队列是后端解耦、削峰填谷、异步处理的核心基础设施。本文介绍 Node.js 如何接入主流消息队列，以及在高并发场景下的实战经验。

---

## 目录

1. [消息队列能解决什么问题](#一消息队列能解决什么问题)
2. [主流消息队列对比](#二主流消息队列对比)
3. [RabbitMQ 实战](#三rabbitmq-实战)
4. [Kafka 实战](#四kafka-实战)
5. [Redis Stream 实战](#五redis-stream-实战)
6. [消息队列设计模式](#六消息队列设计模式)
7. [生产环境最佳实践](#七生产环境最佳实践)
8. [总结](#八总结)

---

## 一、消息队列能解决什么问题

### 1.1 典型场景

| 场景 | 问题 | 消息队列方案 |
|------|------|-------------|
| 订单创建后发短信/邮件 | 同步调用拖慢接口 | 异步消息，解耦核心流程 |
| 秒杀大流量 | 数据库被打挂 | 消息队列削峰，异步消费 |
| 服务 A 调用服务 B | B 故障导致 A 失败 | 消息队列缓冲，失败重试 |
| 日志收集 | 多服务日志分散 | 统一投递到消息队列聚合 |
| 任务调度 | 定时/延迟任务难管理 | 延迟队列 |

### 1.2 核心收益

- **解耦**：生产者与消费者互不感知。
- **异步**：提高接口响应速度。
- **削峰**：平滑突发流量。
- **可靠**：支持持久化和重试。
- **扩展**：消费者可水平扩展。

---

## 二、主流消息队列对比

| 特性 | RabbitMQ | Kafka | Redis Stream | RocketMQ |
|------|----------|-------|--------------|----------|
| 定位 | 通用消息队列 | 高吞吐日志流 | 轻量流处理 | 金融级消息队列 |
| 吞吐量 | 万级/秒 | 百万级/秒 | 万级/秒 | 十万级/秒 |
| 消息持久化 | 支持 | 持久化到磁盘 | 支持 | 支持 |
| 延迟消息 | 插件支持 | 原生不支持 | 不支持 | 支持 |
| 顺序性 | 队列内有序 | 分区内有序 | 有序 | 队列内有序 |
| 适用场景 | 任务队列、RPC | 日志、事件流 | 实时排行榜、简单队列 | 电商、金融 |

Node.js 生态推荐：

- **RabbitMQ**：amqplib
- **Kafka**：kafkajs
- **Redis Stream**：ioredis

---

## 三、RabbitMQ 实战

### 3.1 安装 amqplib

```bash
npm install amqplib
```

### 3.2 生产者

```javascript
// producers/order-producer.js
import amqp from 'amqplib';

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';

export async function publishOrderCreated(order) {
  const connection = await amqp.connect(RABBITMQ_URL);
  const channel = await connection.createChannel();

  const exchange = 'order.events';
  const routingKey = 'order.created';

  await channel.assertExchange(exchange, 'topic', { durable: true });

  const message = Buffer.from(JSON.stringify(order));
  channel.publish(exchange, routingKey, message, {
    persistent: true,
    messageId: order.id,
    timestamp: Date.now()
  });

  console.log(`Order ${order.id} published`);

  await channel.close();
  await connection.close();
}
```

### 3.3 消费者

```javascript
// consumers/email-consumer.js
import amqp from 'amqplib';

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';

async function startEmailConsumer() {
  const connection = await amqp.connect(RABBITMQ_URL);
  const channel = await connection.createChannel();

  const exchange = 'order.events';
  const queue = 'email.notification.queue';
  const bindingKey = 'order.created';

  await channel.assertExchange(exchange, 'topic', { durable: true });
  await channel.assertQueue(queue, { durable: true });
  await channel.bindQueue(queue, exchange, bindingKey);

  channel.prefetch(10); // 限流

  channel.consume(queue, async (msg) => {
    if (!msg) return;

    try {
      const order = JSON.parse(msg.content.toString());
      await sendEmail(order.userEmail, '订单创建成功', order);
      channel.ack(msg);
    } catch (error) {
      console.error('邮件发送失败:', error);
      // 重试 3 次后进入死信队列
      channel.nack(msg, false, msg.fields.deliveryTag <= 3);
    }
  });

  console.log('Email consumer started');
}

startEmailConsumer().catch(console.error);
```

### 3.4 延迟队列

```javascript
// 声明延迟队列（通过 TTL + 死信队列实现）
await channel.assertExchange('order.delay.exchange', 'direct', { durable: true });
await channel.assertQueue('order.delay.queue', {
  durable: true,
  arguments: {
    'x-message-ttl': 30 * 60 * 1000, // 30 分钟
    'x-dead-letter-exchange': 'order.timeout.exchange',
    'x-dead-letter-routing-key': 'order.timeout'
  }
});
```

---

## 四、Kafka 实战

### 4.1 安装 kafkajs

```bash
npm install kafkajs
```

### 4.2 生产者

```javascript
// producers/log-producer.js
import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'node-app',
  brokers: process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092']
});

const producer = kafka.producer();

export async function sendLog(log) {
  await producer.connect();
  await producer.send({
    topic: 'app-logs',
    messages: [
      {
        key: log.service,
        value: JSON.stringify(log),
        headers: {
          'x-request-id': log.requestId
        }
      }
    ]
  });
}
```

### 4.3 消费者组

```javascript
// consumers/log-consumer.js
import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'log-consumer',
  brokers: process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092']
});

const consumer = kafka.consumer({ groupId: 'log-processor-group' });

async function start() {
  await consumer.connect();
  await consumer.subscribe({ topic: 'app-logs', fromBeginning: false });

  await consumer.run({
    eachBatchAutoResolve: false,
    eachBatch: async ({ batch, resolveOffset, heartbeat }) => {
      for (const message of batch.messages) {
        const log = JSON.parse(message.value.toString());
        await processLog(log);
        await resolveOffset(message.offset);
        await heartbeat();
      }
    }
  });
}

start().catch(console.error);
```

---

## 五、Redis Stream 实战

### 5.1 安装 ioredis

```bash
npm install ioredis
```

### 5.2 生产与消费

```javascript
// lib/redis-queue.js
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export async function pushTask(stream, task) {
  await redis.xadd(stream, '*', 'data', JSON.stringify(task));
}

export async function consumeTasks(stream, group, consumer, handler) {
  // 创建消费组（幂等）
  try {
    await redis.xgroup('CREATE', stream, group, '$', 'MKSTREAM');
  } catch (error) {
    if (!error.message.includes('BUSYGROUP')) throw error;
  }

  while (true) {
    const results = await redis.xreadgroup(
      'GROUP', group, consumer,
      'BLOCK', 5000,
      'STREAMS', stream, '>'
    );

    if (!results) continue;

    for (const [, messages] of results) {
      for (const [id, fields] of messages) {
        try {
          const task = JSON.parse(fields[1]);
          await handler(task);
          await redis.xack(stream, group, id);
        } catch (error) {
          console.error('Task failed:', error);
        }
      }
    }
  }
}
```

---

## 六、消息队列设计模式

### 6.1 发布/订阅（Pub/Sub）

一个事件被多个消费者独立处理。

```
Producer ──> Exchange ──> Queue A ──> Consumer A
            └──> Queue B ──> Consumer B
```

### 6.2 工作队列（Work Queue）

多个消费者竞争消费，提高处理能力。

```
Producer ──> Queue ──> Consumer A
            └───────> Consumer B
```

### 6.3 死信队列（DLQ）

处理失败的消息进入死信队列，人工或自动重试。

```
Main Queue ──> Consumer
     │
     └─（重试超限）──> Dead Letter Queue
```

### 6.4 延迟队列

适用于订单超时取消、定时任务等场景。

---

## 七、生产环境最佳实践

### 7.1 幂等性

消费者必须保证幂等，防止重复消费导致数据错误。

```javascript
async function processPayment(paymentId) {
  const lockKey = `payment:lock:${paymentId}`;
  const locked = await redis.set(lockKey, '1', 'EX', 60, 'NX');
  if (!locked) return; // 已在处理中

  try {
    await doProcessPayment(paymentId);
  } finally {
    await redis.del(lockKey);
  }
}
```

### 7.2 消息体设计

```json
{
  "messageId": "msg_abc123",
  "eventType": "order.created",
  "timestamp": "2026-06-16T12:00:00Z",
  "version": "1.0",
  "payload": {
    "orderId": "ORD-123",
    "userId": "10086"
  }
}
```

### 7.3 监控指标

- 消息堆积量（Lag）
- 消费速率
- 消费延迟
- 失败重试次数
- 死信队列长度

### 7.4 连接管理

- 生产者/消费者使用连接池。
- 进程退出前优雅关闭 channel 和 connection。
- 网络断开后自动重连。

---

## 八、总结

Node.js 接入消息队列的关键选择：

| 场景 | 推荐方案 |
|------|---------|
| 任务异步/延迟 | RabbitMQ |
| 日志/事件流/大数据 | Kafka |
| 轻量队列/实时处理 | Redis Stream |
| 金融级可靠性 | RocketMQ |

核心原则：

- **解耦优先**：核心业务与附属流程通过消息队列解耦。
- **幂等必做**：消费者必须具备幂等性。
- **监控到位**：关注堆积、延迟、失败率。
- **优雅关闭**：避免消息丢失。

消息队列用得好的系统，往往更健壮、更容易扩展。
