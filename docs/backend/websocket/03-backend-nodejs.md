# WebSocket 后端实战 (Node.js)

## 原生 ws 库

Node.js 最常用的 WebSocket 库是 `ws`，轻量且功能完善。

```bash
npm install ws
```

### 基础服务器

```javascript
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws, req) => {
  const clientIp = req.socket.remoteAddress;
  console.log(`新连接: ${clientIp}`);

  // 接收消息
  ws.on('message', (data) => {
    console.log('收到:', data.toString());
    // 广播给所有客户端
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data.toString());
      }
    });
  });

  // 连接关闭
  ws.on('close', () => {
    console.log('连接关闭');
  });

  // 发送欢迎消息
  ws.send(JSON.stringify({ type: 'welcome', message: '连接成功' }));
});

console.log('WebSocket 服务器运行在 ws://localhost:8080');
```

### 与 Express 集成

```javascript
const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// HTTP 路由
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    connections: wss.clients.size,
    uptime: process.uptime()
  });
});

// WebSocket 处理
wss.on('connection', (ws, req) => {
  // 从 URL 参数获取 token
  const url = new URL(req.url, `http://${req.headers.host}`);
  const token = url.searchParams.get('token');

  // 简单的 token 校验
  if (!validateToken(token)) {
    ws.close(1008, 'Invalid token');
    return;
  }

  ws.on('message', (data) => handleMessage(ws, data));
  ws.on('close', () => handleDisconnect(ws));
  ws.on('error', (err) => console.error('WS Error:', err));
});

server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
```

### 房间/频道管理

聊天室、直播间等场景需要按房间隔离消息：

```javascript
class RoomManager {
  constructor() {
    this.rooms = new Map(); // roomId -> Set<ws>
    this.clientRooms = new Map(); // ws -> Set<roomId>
  }

  join(ws, roomId) {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set());
    }
    this.rooms.get(roomId).add(ws);

    if (!this.clientRooms.has(ws)) {
      this.clientRooms.set(ws, new Set());
    }
    this.clientRooms.get(ws).add(roomId);
  }

  leave(ws, roomId) {
    this.rooms.get(roomId)?.delete(ws);
    this.clientRooms.get(ws)?.delete(roomId);

    // 清理空房间
    if (this.rooms.get(roomId)?.size === 0) {
      this.rooms.delete(roomId);
    }
  }

  leaveAll(ws) {
    const rooms = this.clientRooms.get(ws);
    if (rooms) {
      for (const roomId of rooms) {
        this.rooms.get(roomId)?.delete(ws);
      }
      this.clientRooms.delete(ws);
    }
  }

  // 广播给房间内所有人（排除发送者）
  broadcast(roomId, message, excludeWs = null) {
    const clients = this.rooms.get(roomId);
    if (!clients) return;

    const data = typeof message === 'string' ? message : JSON.stringify(message);

    for (const client of clients) {
      if (client !== excludeWs && client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    }
  }

  // 广播给房间内所有人
  broadcastAll(roomId, message) {
    this.broadcast(roomId, message, null);
  }

  getRoomSize(roomId) {
    return this.rooms.get(roomId)?.size ?? 0;
  }
}

const roomManager = new RoomManager();

// 使用示例
wss.on('connection', (ws) => {
  ws.on('message', (raw) => {
    const msg = JSON.parse(raw);

    switch (msg.type) {
      case 'join':
        roomManager.join(ws, msg.roomId);
        ws.send(JSON.stringify({ type: 'joined', roomId: msg.roomId }));
        break;

      case 'leave':
        roomManager.leave(ws, msg.roomId);
        break;

      case 'chat':
        roomManager.broadcast(msg.roomId, {
          type: 'chat',
          userId: msg.userId,
          content: msg.content,
          timestamp: Date.now()
        }, ws);
        break;
    }
  });

  ws.on('close', () => {
    roomManager.leaveAll(ws);
  });
});
```

## 心跳与连接保活

服务器端需要检测死连接并及时清理：

```javascript
class HeartbeatManager {
  constructor(options = {}) {
    this.heartbeatInterval = options.heartbeatInterval || 30000;
    this.heartbeatTimeout = options.heartbeatTimeout || 60000;
    this.clients = new Map(); // ws -> { lastPong, isAlive }
  }

  add(ws) {
    this.clients.set(ws, {
      lastPong: Date.now(),
      isAlive: true
    });

    // 监听 pong 响应
    ws.on('pong', () => {
      const client = this.clients.get(ws);
      if (client) {
        client.lastPong = Date.now();
        client.isAlive = true;
      }
    });
  }

  remove(ws) {
    this.clients.delete(ws);
  }

  start() {
    // 定期发送 ping
    setInterval(() => {
      for (const [ws, client] of this.clients) {
        if (!client.isAlive) {
          // 超时未响应，终止连接
          ws.terminate();
          this.clients.delete(ws);
          continue;
        }

        client.isAlive = false;
        ws.ping();
      }
    }, this.heartbeatInterval);
  }
}

const heartbeat = new HeartbeatManager();
heartbeat.start();

wss.on('connection', (ws) => {
  heartbeat.add(ws);

  ws.on('close', () => {
    heartbeat.remove(ws);
  });
});
```

## 连接限流与防护

```javascript
const rateLimit = new Map(); // ip -> { count, resetTime }

function checkRateLimit(ip, maxRequests = 100, windowMs = 60000) {
  const now = Date.now();
  const record = rateLimit.get(ip);

  if (!record || now > record.resetTime) {
    rateLimit.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

// 连接级别限流
wss.on('connection', (ws, req) => {
  const ip = req.socket.remoteAddress;

  if (!checkRateLimit(ip, 50, 60000)) {
    ws.close(1008, 'Rate limit exceeded');
    return;
  }

  // 消息频率限制
  let messageCount = 0;
  const messageWindow = Date.now() + 10000; // 10秒窗口

  ws.on('message', () => {
    messageCount++;
    if (messageCount > 100) {
      ws.close(1008, 'Message rate exceeded');
    }
  });
});
```

## Socket.io（高级封装）

`socket.io` 提供了更高级的抽象，内置房间、命名空间、自动重连、降级策略等：

```bash
npm install socket.io
```

### 基础用法

```javascript
// server.js
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: { origin: '*' },
  pingInterval: 10000,
  pingTimeout: 5000
});

io.on('connection', (socket) => {
  console.log('用户连接:', socket.id);

  // 加入房间
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    socket.to(roomId).emit('user-joined', socket.id);
  });

  // 发送消息到房间
  socket.on('send-message', ({ roomId, message }) => {
    io.to(roomId).emit('new-message', {
      sender: socket.id,
      message,
      timestamp: Date.now()
    });
  });

  // 私聊
  socket.on('private-message', ({ toUserId, message }) => {
    io.to(toUserId).emit('private-message', {
      from: socket.id,
      message
    });
  });

  // 广播（排除自己）
  socket.on('broadcast', (message) => {
    socket.broadcast.emit('broadcast', message);
  });

  // 断开连接
  socket.on('disconnect', (reason) => {
    console.log('断开:', reason);
  });
});
```

### 命名空间

```javascript
// 按功能模块划分
const chatNamespace = io.of('/chat');
const notificationNamespace = io.of('/notifications');

chatNamespace.on('connection', (socket) => {
  // 仅聊天相关逻辑
});

notificationNamespace.use((socket, next) => {
  // 认证中间件
  const token = socket.handshake.auth.token;
  if (verifyToken(token)) {
    next();
  } else {
    next(new Error('Unauthorized'));
  }
});
```

## 集群与 Redis 适配器

多服务器部署时需要 Redis 来同步消息：

```bash
npm install @socket.io/redis-adapter redis
```

```javascript
const { createAdapter } = require('@socket.io/redis-adapter');
const { createClient } = require('redis');

const pubClient = createClient({ url: 'redis://localhost:6379' });
const subClient = pubClient.duplicate();

io.adapter(createAdapter(pubClient, subClient));
```

使用 Redis 适配器后，`io.to(roomId).emit()` 会自动广播到所有服务器的客户端。

## 服务端 ACK 与消息补偿

### 为什么服务端也需要 ACK

客户端 `send()` 成功只代表数据进入内核缓冲区，不代表服务端应用层已处理。服务端必须在业务处理完成后回复 ACK，客户端收到 ACK 才算一次完整投递。

```javascript
wss.on('connection', (ws) => {
  // 每个连接维护已处理的消息 ID，用于幂等去重
  const processedIds = new Set();

  ws.on('message', (raw) => {
    const msg = JSON.parse(raw);

    // 1. 先回 ACK，告知客户端"我已收到"
    // 注意：ACK 必须在最前面发送，即使后续业务处理失败
    ws.send(JSON.stringify({ type: 'ack', id: msg.id }));

    // 2. 幂等去重：已处理过的消息直接忽略
    if (processedIds.has(msg.id)) {
      console.log(`消息 ${msg.id} 重复，已处理过`);
      return;
    }
    processedIds.add(msg.id);

    // 3. 执行业务逻辑
    handleBusiness(msg);
  });
});
```

### 消息补偿机制

**场景**：用户断网 5 分钟，期间服务端产生了 100 条新消息（聊天、通知、价格变动）。用户恢复网络后，如果只推送最新一条，中间 99 条就丢失了。

**补偿流程**：

```
客户端                    服务端
  |                        |
  | -- 携带 lastSeq=100 --> |  重连时上报最后收到的序号
  |                        |
  | <-- 补偿 msg#101 --    |  推送断线期间缓存的消息
  | <-- 补偿 msg#102 --    |
  |         ...            |
  | <-- 补偿 msg#200 --    |
  |                        |
  | -- ack 101~200 -------> |  客户端确认收到补偿消息
```

服务端需要为每个用户维护消息缓存：

```javascript
class MessageCompensator {
  constructor(options = {}) {
    // userId -> 环形消息缓冲区
    this.userBuffers = new Map();
    this.maxSize = options.maxSize || 1000;  // 每个用户最多缓存 1000 条
  }

  // 用户发消息时，同时存入该用户所有相关会话的缓冲区
  addMessage(userId, message) {
    if (!this.userBuffers.has(userId)) {
      this.userBuffers.set(userId, []);
    }

    const buffer = this.userBuffers.get(userId);
    buffer.push({
      seq: message.seq,
      data: message,
      timestamp: Date.now()
    });

    // 环形淘汰：超出上限时删除最老的
    if (buffer.length > this.maxSize) {
      buffer.shift();
    }
  }

  // 客户端重连后请求补偿消息
  getCompensation(userId, lastSeq) {
    const buffer = this.userBuffers.get(userId);
    if (!buffer) return [];

    // 返回 lastSeq 之后的所有消息
    const idx = buffer.findIndex(m => m.seq > lastSeq);
    if (idx === -1) return [];  // 客户端已是最新
    return buffer.slice(idx);
  }

  // 清理过期缓存（如用户 7 天未登录）
  cleanExpired(maxAgeMs = 7 * 24 * 60 * 60 * 1000) {
    const now = Date.now();
    for (const [userId, buffer] of this.userBuffers) {
      const oldest = buffer[0]?.timestamp;
      if (oldest && now - oldest > maxAgeMs) {
        this.userBuffers.delete(userId);
      }
    }
  }
}

const compensator = new MessageCompensator();
```

### 分页补偿实现

断线期间消息可能很多（如群聊活跃时 5 分钟 500 条），一次全量推送会导致：

- 客户端内存和渲染压力
- 首屏加载时间变长
- WebSocket 帧过大被中间件拒绝

**分页补偿策略**：

```javascript
class PaginatedCompensator extends MessageCompensator {
  constructor(options = {}) {
    super(options);
    this.pageSize = options.pageSize || 50;  // 每页 50 条
  }

  // 客户端请求补偿：携带 lastSeq 和期望的 pageSize
  handleCompensationRequest(ws, { lastSeq, pageSize = this.pageSize }) {
    const userId = ws.userId;
    const messages = this.getCompensation(userId, lastSeq);

    if (messages.length === 0) {
      ws.send(JSON.stringify({ type: 'compensation_complete' }));
      return;
    }

    // 只取第一页
    const page = messages.slice(0, pageSize);
    const hasMore = messages.length > pageSize;

    ws.send(JSON.stringify({
      type: 'compensation',
      messages: page.map(m => m.data),
      pagination: {
        total: messages.length,
        pageSize,
        hasMore,
        nextSeq: hasMore ? page[page.length - 1].seq : null
      }
    }));
  }
}

const paginatedCompensator = new PaginatedCompensator({ pageSize: 50 });

// 客户端重连后请求补偿
wss.on('connection', (ws) => {
  ws.on('message', (raw) => {
    const msg = JSON.parse(raw);

    switch (msg.type) {
      case 'compensation_request':
        // { type: 'compensation_request', lastSeq: 150 }
        paginatedCompensator.handleCompensationRequest(ws, msg);
        break;

      case 'compensation_ack':
        // 客户端确认收到当前页，请求下一页
        // { type: 'compensation_ack', lastSeq: 200 }
        paginatedCompensator.handleCompensationRequest(ws, msg);
        break;
    }
  });
});
```

**客户端配合**：

```javascript
// 客户端重连后主动请求补偿
client.on('open', () => {
  client.send({
    type: 'compensation_request',
    lastSeq: localStorage.getItem('last_received_seq') || 0
  });
});

// 收到补偿消息
client.on('message', (msg) => {
  if (msg.type === 'compensation') {
    // 渲染补偿消息
    msg.messages.forEach(renderMessage);

    // 更新最后收到的序号
    const lastSeq = msg.messages[msg.messages.length - 1].seq;
    localStorage.setItem('last_received_seq', lastSeq);

    // 还有更多，继续请求下一页
    if (msg.pagination.hasMore) {
      client.send({
        type: 'compensation_ack',
        lastSeq: lastSeq
      });
    }
  }
});
```

### 补偿策略对比

| 策略 | 适用场景 | 优点 | 缺点 |
|------|---------|------|------|
| **全量补偿** | 断线时间短、消息量少 | 实现简单，一次到位 | 消息量大时客户端卡顿 |
| **分页补偿** | 断线时间长、消息量大 | 流式加载，内存友好 | 实现复杂，多轮交互 |
| **只补最新** | 实时性优先（如行情） | 即时响应 | 中间消息丢失 |

### 完整端到端示例

```javascript
// ===== 服务端 =====
const compensator = new PaginatedCompensator({
  maxSize: 2000,    // 每个用户缓存 2000 条
  pageSize: 50      // 每页 50 条
});

// 消息广播时同时存入各用户补偿缓冲区
function broadcastWithCompensation(roomId, message) {
  message.seq = ++globalSeq;  // 全局递增序号

  const clients = roomManager.getClients(roomId);
  for (const client of clients) {
    // 存入该用户的补偿缓冲区
    compensator.addMessage(client.userId, message);

    // 在线的直接发送
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  }
}

// 客户端重连请求补偿
wss.on('connection', (ws) => {
  ws.on('message', (raw) => {
    const msg = JSON.parse(raw);

    if (msg.type === 'compensation_request') {
      paginatedCompensator.handleCompensationRequest(ws, msg);
    }
  });
});

// ===== 客户端 =====
const client = new ReliableWebSocket('wss://api.example.com/ws');

// 收到任何消息都更新 lastSeq
client.on('message', (msg) => {
  if (msg.seq) {
    localStorage.setItem('last_received_seq', msg.seq);
  }

  if (msg.type === 'compensation') {
    msg.messages.forEach(m => renderMessage(m));

    if (msg.pagination.hasMore) {
      client.send({
        type: 'compensation_ack',
        lastSeq: msg.messages[msg.messages.length - 1].seq
      });
    }
    return;
  }

  renderMessage(msg);
});

// 重连后请求补偿
client.on('open', () => {
  const lastSeq = localStorage.getItem('last_received_seq') || 0;
  client.send({ type: 'compensation_request', lastSeq });
});
```
