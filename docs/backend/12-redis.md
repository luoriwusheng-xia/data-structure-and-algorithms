# Redis 入门、实战与 Node.js 接入

Redis 是一个高性能的键值对内存数据库，广泛应用于缓存、会话、排行榜、消息队列、实时计数等场景。本文从基础概念讲起，结合常见实战模式，最后演示如何在 Node.js 中落地使用。

---

## 目录

1. [Redis 入门](#一redis-入门)
2. [Redis 实战场景](#二redis-实战场景)
3. [Node.js 中使用 Redis](#三nodejs-中使用-redis)
4. [生产环境最佳实践](#四生产环境最佳实践)
5. [总结](#五总结)

---

## 一、Redis 入门

### 1.1 什么是 Redis

Redis（Remote Dictionary Server）是一个开源的、基于内存的数据结构存储系统，支持网络访问，可用作：

- **缓存**：加速热点数据读取
- **数据库**：持久化存储结构化数据
- **消息代理**：发布订阅、队列、流

### 1.2 核心特点

| 特点 | 说明 |
|------|------|
| 内存级速度 | 读写可达 10 万 QPS 以上 |
| 丰富的数据类型 | String、Hash、List、Set、Sorted Set、Bitmap、HyperLogLog、Stream 等 |
| 持久化 | 支持 RDB 快照和 AOF 日志 |
| 高可用 | 主从复制、Sentinel 哨兵、Cluster 集群 |
| 原子操作 | 单线程执行命令，天然避免并发竞争 |

### 1.3 数据类型与适用场景

| 类型 | 典型命令 | 场景 |
|------|---------|------|
| String | `SET`、`GET`、`INCR` | 缓存、计数器、分布式锁 |
| Hash | `HSET`、`HGETALL` | 用户信息、商品详情 |
| List | `LPUSH`、`RPOP`、`BLPOP` | 最新消息、任务队列 |
| Set | `SADD`、`SISMEMBER`、`SUNION` | 标签、共同好友、去重 |
| Sorted Set | `ZADD`、`ZREVRANGE` | 排行榜、延迟队列 |
| Bitmap | `SETBIT`、`BITCOUNT` | 签到、在线状态 |
| Stream | `XADD`、`XREADGROUP` | 消息流、事件溯源 |

### 1.4 常用命令

```bash
# 字符串
SET user:1:name "Alice" EX 3600
GET user:1:name
INCR view:count:article:1

# 哈希
HSET user:1 name "Alice" age 25 city "Beijing"
HGETALL user:1

# 列表
LPUSH queue:tasks "send-email"
RPOP queue:tasks

# 集合
SADD tags:article:1 "redis" "cache" "backend"
SISMEMBER tags:article:1 "redis"

# 有序集合
ZADD leaderboard 1500 "player1" 2300 "player2"
ZREVRANGE leaderboard 0 9 WITHSCORES

# 过期与删除
EXPIRE session:abc 3600
TTL session:abc
DEL session:abc
```

### 1.5 持久化

Redis 提供两种持久化方式：

- **RDB（快照）**：按配置周期把内存数据保存到磁盘，恢复速度快，但可能丢数据。
- **AOF（追加日志）**：记录每次写命令，数据更安全，可配置 `appendfsync`：
  - `always`：每次写入都刷盘，最安全最慢
  - `everysec`：每秒刷盘，默认推荐
  - `no`：由操作系统决定，性能最好但最不安全

生产环境通常同时开启 RDB 和 AOF：

```bash
save 900 1
save 300 10
save 60 10000
appendonly yes
appendfsync everysec
```

### 1.6 安装与启动

```bash
# Docker 启动
docker run -d --name redis -p 6379:6379 redis:7-alpine

# 进入容器使用 redis-cli
docker exec -it redis redis-cli
```

---

## 二、Redis 实战场景

### 2.1 缓存模式（Cache Aside）

最常用的缓存策略：读时回源、写时失效。

```
读请求 -> 查缓存 -> 命中返回
              -> 未命中查数据库 -> 写入缓存 -> 返回

写请求 -> 更新数据库 -> 删除缓存
```

### 2.2 分布式锁

利用 `SET key value NX EX seconds` 实现：

```bash
SET lock:order:123 owner-abc NX EX 30
```

- `NX`：只有 key 不存在时才设置成功
- `EX`：设置过期时间，防止死锁

释放锁时使用 Lua 脚本保证原子性：

```lua
if redis.call("get", KEYS[1]) == ARGV[1] then
  return redis.call("del", KEYS[1])
else
  return 0
end
```

### 2.3 限流

固定窗口限流：每秒限制 10 次请求。

```
key = rate:ip:192.168.1.1:current_second
INCR key
EXPIRE key 2
IF value > 10 THEN reject
```

更精确的可以使用滑动窗口或令牌桶，配合 Sorted Set 实现。

### 2.4 会话管理

```bash
SET session:user:10086 "{\"userId\":10086,\"role\":\"admin\"}" EX 7200
```

集中式会话适合多节点无状态服务。

### 2.5 排行榜

```bash
ZADD game:leaderboard 3000 "playerA"
ZADD game:leaderboard 4200 "playerB"
ZREVRANGE game:leaderboard 0 19 WITHSCORES
```

### 2.6 计数器

```bash
INCR article:1:views
GET article:1:views
```

可配合定时任务回写数据库。

---

## 三、Node.js 中使用 Redis

### 3.1 安装客户端

```bash
npm install redis
```

官方 `redis` 包支持 Promise、集群、发布订阅、哨兵等现代特性。

### 3.2 建立连接

```javascript
// lib/redis.js
import { createClient } from 'redis';

const client = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

client.on('error', (err) => console.error('Redis Client Error', err));
client.on('connect', () => console.log('Redis connected'));

await client.connect();

export default client;
```

### 3.3 基础数据类型操作

```javascript
import client from './lib/redis.js';

// String
await client.set('user:1:name', 'Alice', { EX: 3600 });
const name = await client.get('user:1:name');
await client.incr('article:1:views');

// Hash
await client.hSet('user:1', {
  name: 'Alice',
  age: 25,
  city: 'Beijing'
});
const user = await client.hGetAll('user:1');

// List
await client.lPush('queue:tasks', 'send-email');
const task = await client.rPop('queue:tasks');

// Set
await client.sAdd('tags:1', ['redis', 'cache']);
const isMember = await client.sIsMember('tags:1', 'redis');

// Sorted Set
await client.zAdd('leaderboard', [
  { score: 1500, value: 'player1' },
  { score: 2300, value: 'player2' }
]);
const top = await client.zRangeWithScores('leaderboard', 0, 9, { REV: true });
```

### 3.4 缓存封装

```javascript
// lib/cache.js
import client from './redis.js';

export async function getOrSet(key, factory, ttl = 300) {
  const cached = await client.get(key);
  if (cached) return JSON.parse(cached);

  const value = await factory();
  if (value !== undefined && value !== null) {
    await client.set(key, JSON.stringify(value), { EX: ttl });
  }
  return value;
}

export async function invalidate(pattern) {
  const keys = await client.keys(pattern);
  if (keys.length) {
    await client.del(keys);
  }
}
```

使用示例：

```javascript
import { getOrSet, invalidate } from './lib/cache.js';
import { findUserById } from './services/user.js';

const user = await getOrSet(
  `user:${userId}`,
  () => findUserById(userId),
  600
);

// 用户更新后清除缓存
await invalidate(`user:${userId}`);
```

### 3.5 分布式锁

```javascript
// lib/lock.js
import client from './redis.js';
import crypto from 'node:crypto';

const UNLOCK_SCRIPT = `
  if redis.call("get", KEYS[1]) == ARGV[1] then
    return redis.call("del", KEYS[1])
  else
    return 0
  end
`;

export async function acquireLock(resource, ttl = 30) {
  const token = crypto.randomUUID();
  const key = `lock:${resource}`;
  const result = await client.set(key, token, { NX: true, EX: ttl });

  if (result === 'OK') {
    return {
      token,
      async release() {
        await client.eval(UNLOCK_SCRIPT, {
          keys: [key],
          arguments: [token]
        });
      }
    };
  }
  return null;
}
```

使用示例：

```javascript
const lock = await acquireLock(`order:${orderId}`, 30);
if (!lock) {
  throw new Error('资源正在处理中');
}

try {
  await processOrder(orderId);
} finally {
  await lock.release();
}
```

### 3.6 限流中间件

```javascript
// middleware/rate-limit.js
import client from '../lib/redis.js';

export function createRateLimit({ window = 60, max = 100 }) {
  return async (req, res, next) => {
    const ip = req.ip || 'unknown';
    const key = `rate:${ip}:${Math.floor(Date.now() / 1000 / window)}`;

    const count = await client.incr(key);
    if (count === 1) {
      await client.expire(key, window);
    }

    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - count));

    if (count > max) {
      res.status(429).json({ error: 'Too many requests' });
      return;
    }

    next();
  };
}
```

### 3.7 发布订阅

```javascript
// lib/pubsub.js
import { createClient } from 'redis';

const publisher = createClient({ url: process.env.REDIS_URL });
const subscriber = publisher.duplicate();

await publisher.connect();
await subscriber.connect();

export async function publish(channel, message) {
  await publisher.publish(channel, JSON.stringify(message));
}

export async function subscribe(channel, handler) {
  await subscriber.subscribe(channel, (message) => {
    handler(JSON.parse(message));
  });
}
```

### 3.8 Pipeline 批量操作

Pipeline 可以一次性发送多个命令，减少网络往返。

```javascript
const pipeline = client.multi();

pipeline.set('key:1', 'value1');
pipeline.set('key:2', 'value2');
pipeline.incr('counter');

const results = await pipeline.exec();
console.log(results);
```

### 3.9 连接集群

```javascript
import { createCluster } from 'redis';

const cluster = createCluster({
  rootNodes: [
    { url: 'redis://10.0.0.1:6379' },
    { url: 'redis://10.0.0.2:6379' },
    { url: 'redis://10.0.0.3:6379' }
  ]
});

cluster.on('error', (err) => console.error('Redis Cluster Error', err));
await cluster.connect();

await cluster.set('foo', 'bar');
```

---

## 四、生产环境最佳实践

### 4.1 缓存设计

- 设置合理的过期时间，避免脏数据长期存在
- 写操作先更新数据库，再删除缓存（Cache Aside）
- 高并发下使用延迟双删或消息队列保证最终一致
- 对空值也进行短暂缓存，避免缓存击穿

### 4.2 大 Key 与热 Key

- 单个 value 不建议超过 10 KB
- Hash、List 元素过多时考虑分片
- 热 Key 可以使用本地缓存 + Redis 二级缓存，或读写分离

### 4.3 连接管理

- 使用单例客户端，避免频繁创建连接
- Node.js 多进程部署时，每个进程维护少量连接
- 优雅关闭时调用 `client.quit()`

### 4.4 内存与淘汰

```bash
maxmemory 1gb
maxmemory-policy allkeys-lru
```

常见淘汰策略：

| 策略 | 说明 |
|------|------|
| `noeviction` | 不淘汰，写满后返回错误 |
| `allkeys-lru` | 最近最少使用淘汰 |
| `allkeys-lfu` | 最少使用频率淘汰 |
| `volatile-lru` | 只淘汰设置了过期时间的 key |
| `volatile-ttl` | 优先淘汰即将过期的 key |

### 4.5 监控指标

- 内存使用率
- 连接数
- 命令 QPS
- 缓存命中率
- 慢查询数量
- 主从复制延迟

---

## 五、总结

Redis 凭借极高的读写性能和丰富的数据结构，成为后端开发的基础设施之一。本文覆盖了：

- 核心数据类型与常用命令
- 缓存、锁、限流、会话、排行榜等实战模式
- Node.js 中连接、操作、封装、集群的完整示例

掌握 Redis 的关键在于：根据场景选对数据结构，设计好缓存一致性策略，并在线上关注内存、连接和命中率。
