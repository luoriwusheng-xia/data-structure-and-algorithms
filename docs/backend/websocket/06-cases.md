# WebSocket 完整实战案例

## 案例一：实时聊天室

### 功能需求
- 多房间支持
- 在线人数显示
- 历史消息加载
- 消息已读回执
- 图片/文件传输

### 项目结构

```
chat-room/
├── server/
│   ├── index.js          # 入口
│   ├── room.js           # 房间管理
│   ├── message.js        # 消息处理
│   └── middleware/
│       └── auth.js       # JWT 认证
└── client/
    ├── index.html
    └── chat.js
```

### 服务端核心代码

```javascript
// server/index.js
const WebSocket = require('ws');
const jwt = require('jsonwebtoken');

const wss = new WebSocket.Server({ port: 8080 });
const rooms = new Map();

// 房间类
class ChatRoom {
  constructor(id) {
    this.id = id;
    this.clients = new Map(); // userId -> { ws, userInfo }
    this.messages = [];       // 最近 100 条消息
  }

  join(userId, userInfo, ws) {
    this.clients.set(userId, { ws, userInfo, joinedAt: Date.now() });
    this.broadcast({
      type: 'system',
      content: `${userInfo.nickname} 进入房间`,
      timestamp: Date.now()
    });
    this.broadcastUserList();
  }

  leave(userId) {
    const client = this.clients.get(userId);
    if (client) {
      this.clients.delete(userId);
      this.broadcast({
        type: 'system',
        content: `${client.userInfo.nickname} 离开房间`,
        timestamp: Date.now()
      });
      this.broadcastUserList();
    }
  }

  broadcast(message, excludeUserId = null) {
    const data = JSON.stringify(message);
    for (const [uid, client] of this.clients) {
      if (uid !== excludeUserId && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(data);
      }
    }
  }

  broadcastUserList() {
    const users = Array.from(this.clients.values()).map(c => c.userInfo);
    this.broadcast({ type: 'userList', users });
  }

  addMessage(message) {
    this.messages.push(message);
    if (this.messages.length > 100) {
      this.messages.shift();
    }
    this.broadcast(message);
  }

  getHistory() {
    return this.messages.slice(-50);
  }
}

wss.on('connection', (ws, req) => {
  // Token 验证
  const url = new URL(req.url, 'http://localhost');
  const token = url.searchParams.get('token');
  let userInfo;

  try {
    userInfo = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    ws.close(1008, 'Unauthorized');
    return;
  }

  let currentRoom = null;

  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw);

      switch (msg.type) {
        case 'join':
          if (currentRoom) currentRoom.leave(userInfo.userId);
          if (!rooms.has(msg.roomId)) {
            rooms.set(msg.roomId, new ChatRoom(msg.roomId));
          }
          currentRoom = rooms.get(msg.roomId);
          currentRoom.join(userInfo.userId, userInfo, ws);

          // 发送历史消息
          ws.send(JSON.stringify({
            type: 'history',
            messages: currentRoom.getHistory()
          }));
          break;

        case 'chat':
          if (currentRoom) {
            currentRoom.addMessage({
              type: 'chat',
              userId: userInfo.userId,
              nickname: userInfo.nickname,
              content: msg.content,
              timestamp: Date.now()
            });
          }
          break;

        case 'typing':
          if (currentRoom) {
            currentRoom.broadcast({
              type: 'typing',
              userId: userInfo.userId,
              nickname: userInfo.nickname
            }, userInfo.userId);
          }
          break;
      }
    } catch (err) {
      ws.send(JSON.stringify({ type: 'error', message: err.message }));
    }
  });

  ws.on('close', () => {
    if (currentRoom) {
      currentRoom.leave(userInfo.userId);
    }
  });
});
```

### 客户端核心代码

```javascript
// client/chat.js
class ChatClient {
  constructor(token) {
    this.ws = new WebSocket(`ws://localhost:8080?token=${token}`);
    this.roomId = null;
    this.setupHandlers();
  }

  setupHandlers() {
    this.ws.onopen = () => console.log('已连接');

    this.ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      switch (msg.type) {
        case 'chat':
          this.appendMessage(msg);
          break;
        case 'system':
          this.appendSystemMessage(msg.content);
          break;
        case 'userList':
          this.updateUserList(msg.users);
          break;
        case 'history':
          msg.messages.forEach(m => this.appendMessage(m));
          break;
        case 'typing':
          this.showTyping(msg.nickname);
          break;
      }
    };
  }

  join(roomId) {
    this.roomId = roomId;
    this.send({ type: 'join', roomId });
  }

  sendChat(content) {
    this.send({ type: 'chat', content });
  }

  sendTyping() {
    // 节流：每 3 秒最多发送一次
    if (this.typingTimer) return;
    this.send({ type: 'typing' });
    this.typingTimer = setTimeout(() => {
      this.typingTimer = null;
    }, 3000);
  }

  send(data) {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }
}
```

## 案例二：实时数据看板

股票/加密货币实时行情推送：

```javascript
// server.js - 行情推送服务
class PriceFeed {
  constructor(wss) {
    this.wss = wss;
    this.subscriptions = new Map(); // symbol -> Set<ws>
    this.prices = new Map();
  }

  subscribe(ws, symbols) {
    for (const symbol of symbols) {
      if (!this.subscriptions.has(symbol)) {
        this.subscriptions.set(symbol, new Set());
      }
      this.subscriptions.get(symbol).add(ws);
    }

    // 立即发送当前价格
    const snapshot = symbols
      .filter(s => this.prices.has(s))
      .map(s => ({ symbol: s, ...this.prices.get(s) }));

    ws.send(JSON.stringify({ type: 'snapshot', data: snapshot }));
  }

  unsubscribe(ws, symbols) {
    for (const symbol of symbols) {
      this.subscriptions.get(symbol)?.delete(ws);
    }
  }

  // 接收上游数据（如交易所 WebSocket）
  onPriceUpdate(symbol, price, volume) {
    const tick = {
      symbol,
      price,
      volume,
      change: this.calculateChange(symbol, price),
      timestamp: Date.now()
    };

    this.prices.set(symbol, tick);

    // 只推送给订阅了该 symbol 的客户端
    const clients = this.subscriptions.get(symbol);
    if (clients) {
      const data = JSON.stringify({ type: 'tick', data: tick });
      for (const ws of clients) {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(data);
        }
      }
    }
  }

  // 批量聚合推送（降低频率）
  startBatchBroadcast(intervalMs = 100) {
    setInterval(() => {
      const updates = this.collectUpdates();
      if (updates.length === 0) return;

      // 按 symbol 分组推送
      for (const update of updates) {
        const clients = this.subscriptions.get(update.symbol);
        if (!clients) continue;

        const data = JSON.stringify({ type: 'batch', data: update.ticks });
        for (const ws of clients) {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(data);
          }
        }
      }
    }, intervalMs);
  }
}
```

## 案例三：在线协同白板

```javascript
// 操作序列化与同步
class WhiteboardSync {
  constructor() {
    this.operations = [];     // 所有操作历史
    this.clients = new Map(); // 用户当前操作状态
  }

  // 接收客户端操作
  handleOperation(ws, op) {
    // 分配全局序列号
    op.id = this.operations.length;
    op.timestamp = Date.now();

    // 处理冲突（OT 算法简化版）
    const transformed = this.transform(op);

    this.operations.push(transformed);

    // 广播给其他客户端
    this.broadcast({
      type: 'op',
      data: transformed
    }, ws);
  }

  // 新用户加入，同步历史 + 当前状态
  syncUser(ws) {
    // 发送完整画布状态（快照）
    ws.send(JSON.stringify({
      type: 'snapshot',
      state: this.getCurrentState()
    }));

    // 发送快照后的增量操作
    ws.send(JSON.stringify({
      type: 'operations',
      ops: this.operations.slice(-100)
    }));
  }
}
```

## 案例四：实时通知系统

```javascript
// 基于用户ID的精准推送
class NotificationService {
  constructor() {
    this.userSockets = new Map(); // userId -> Set<ws>
  }

  addUser(userId, ws) {
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId).add(ws);
  }

  removeUser(userId, ws) {
    this.userSockets.get(userId)?.delete(ws);
  }

  // 发送给特定用户
  sendToUser(userId, notification) {
    const sockets = this.userSockets.get(userId);
    if (!sockets) return false;

    const data = JSON.stringify({
      type: 'notification',
      data: notification
    });

    let sent = false;
    for (const ws of sockets) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(data);
        sent = true;
      }
    }
    return sent;
  }

  // 发送给多个用户
  sendToUsers(userIds, notification) {
    for (const userId of userIds) {
      this.sendToUser(userId, notification);
    }
  }

  // 广播给所有在线用户
  broadcastAll(notification) {
    for (const [userId, sockets] of this.userSockets) {
      for (const ws of sockets) {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'notification',
            data: notification
          }));
        }
      }
    }
  }

  // 离线消息存储（配合 Redis/数据库）
  async notify(userId, notification) {
    const isOnline = this.sendToUser(userId, notification);

    if (!isOnline) {
      // 用户不在线，存入离线队列
      await this.saveOfflineMessage(userId, notification);
    }
  }
}
```

## 性能优化 checklist

1. **连接管理**
   - 设置最大连接数限制
   - 定期清理死连接（心跳检测）
   - 单用户多端登录策略（互踢/共存）

2. **消息优化**
   - 使用二进制格式（MessagePack/Protobuf）
   - 大消息分片传输
   - 批量聚合小消息

3. **扩展性**
   - 使用 Redis 适配器支持多服务器
   - 按业务拆分不同端口/服务
   - 消息队列削峰（Kafka/RabbitMQ）

4. **监控**
   - 连接数、消息 QPS 监控
   - 消息延迟统计
   - 错误率报警
