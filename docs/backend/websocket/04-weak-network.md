# WebSocket 弱网优化

## 弱网场景分析

弱网环境主要表现为：
- **高延迟**：4G/5G 边缘区域、跨国链路
- **高丢包**：地铁、电梯、地下停车场
- **网络切换**：WiFi <-> 4G 切换、基站切换
- **带宽受限**：限速网络、网络拥塞
- **连接不稳定**：频繁断连、NAT 超时

## 连接保活策略

### 1. 智能重连机制

```javascript
class SmartReconnect {
  constructor() {
    this.attempts = 0;
    this.baseDelay = 1000;
    this.maxDelay = 30000;
    this.maxAttempts = Infinity;
  }

  // 指数退避 + 抖动
  getNextDelay() {
    this.attempts++;

    // 指数退避: 1s, 2s, 4s, 8s, 16s, 30s, 30s...
    const expDelay = Math.min(
      this.baseDelay * Math.pow(2, this.attempts - 1),
      this.maxDelay
    );

    // 添加随机抖动，避免所有客户端同时重连造成 thundering herd
    const jitter = Math.random() * 0.3 * expDelay;
    return expDelay + jitter;
  }

  reset() {
    this.attempts = 0;
  }
}
```

### 2. 网络状态感知

```javascript
class NetworkAwareClient {
  constructor(url) {
    this.url = url;
    this.ws = null;
    this.isOnline = navigator.onLine;

    // 监听浏览器网络状态
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.reconnect();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.ws?.close();
    });

    // 监听页面可见性
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && !this.isConnected) {
        this.reconnect();
      }
    });
  }

  get isConnected() {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}
```

### 3. 心跳自适应

```javascript
class AdaptiveHeartbeat {
  constructor(ws) {
    this.ws = ws;
    this.rttHistory = [];      // RTT 历史记录
    this.interval = 30000;     // 初始心跳间隔
    this.minInterval = 10000;  // 最小间隔
    this.maxInterval = 60000;  // 最大间隔
    this.timer = null;
  }

  start() {
    this.timer = setInterval(() => {
      this.ping();
    }, this.interval);
  }

  ping() {
    this.pingTime = Date.now();
    this.ws.send(JSON.stringify({ type: 'ping', time: this.pingTime }));
  }

  onPong(data) {
    const rtt = Date.now() - data.time;
    this.rttHistory.push(rtt);

    // 保留最近 10 次
    if (this.rttHistory.length > 10) {
      this.rttHistory.shift();
    }

    // 计算平均 RTT
    const avgRtt = this.rttHistory.reduce((a, b) => a + b, 0) / this.rttHistory.length;

    // 根据 RTT 动态调整心跳间隔
    // RTT 高 -> 降低心跳频率，减少网络负担
    // RTT 低 -> 提高心跳频率，更快发现死连接
    if (avgRtt > 1000) {
      this.interval = Math.min(this.interval * 1.2, this.maxInterval);
    } else if (avgRtt < 200) {
      this.interval = Math.max(this.interval * 0.9, this.minInterval);
    }

    // 重启定时器
    clearInterval(this.timer);
    this.start();
  }
}
```

## 消息可靠性保障

### 1. 消息序号与去重

```javascript
class ReliableMessageChannel {
  constructor() {
    this.sendSeq = 0;          // 发送序号
    this.recvSeq = 0;          // 接收序号
    this.pendingMessages = new Map(); // 待确认消息
    this.receivedMessages = new Set(); // 已接收消息（去重）
  }

  send(data) {
    const message = {
      seq: ++this.sendSeq,
      timestamp: Date.now(),
      data
    };

    this.pendingMessages.set(message.seq, message);
    this.ws.send(JSON.stringify(message));

    // 超时重传
    setTimeout(() => this.retransmit(message.seq), 3000);
  }

  retransmit(seq) {
    if (this.pendingMessages.has(seq)) {
      const msg = this.pendingMessages.get(seq);
      this.ws.send(JSON.stringify(msg));
      // 再次设置超时
      setTimeout(() => this.retransmit(seq), 5000);
    }
  }

  onMessage(raw) {
    const msg = JSON.parse(raw);

    // 发送确认
    if (msg.seq) {
      this.ws.send(JSON.stringify({ type: 'ack', seq: msg.seq }));
    }

    // 处理确认
    if (msg.type === 'ack') {
      this.pendingMessages.delete(msg.seq);
      return;
    }

    // 去重
    if (this.receivedMessages.has(msg.seq)) {
      return; // 已处理过
    }
    this.receivedMessages.add(msg.seq);

    // 处理消息
    this.handleData(msg.data);

    // 清理过期的接收记录
    if (this.receivedMessages.size > 10000) {
      const oldSeq = msg.seq - 5000;
      this.receivedMessages.forEach(seq => {
        if (seq < oldSeq) this.receivedMessages.delete(seq);
      });
    }
  }
}
```

### 2. 断点续传（消息回溯）

```javascript
// 客户端：记录最后接收的消息 ID
class MessageCursor {
  constructor() {
    this.lastMessageId = localStorage.getItem('ws_last_msg_id') || 0;
  }

  update(id) {
    this.lastMessageId = id;
    localStorage.setItem('ws_last_msg_id', id);
  }

  // 重连后请求遗漏的消息
  onReconnect(ws) {
    ws.send(JSON.stringify({
      type: 'catchup',
      since: this.lastMessageId
    }));
  }
}

// 服务器：存储近期消息
class MessageBuffer {
  constructor(maxSize = 10000) {
    this.buffer = []; // 环形缓冲区
    this.maxSize = maxSize;
    this.index = new Map(); // messageId -> message
  }

  push(message) {
    this.buffer.push(message);
    this.index.set(message.id, message);

    if (this.buffer.length > this.maxSize) {
      const old = this.buffer.shift();
      this.index.delete(old.id);
    }
  }

  // 获取 since 之后的所有消息
  getSince(messageId) {
    const idx = this.buffer.findIndex(m => m.id === messageId);
    if (idx === -1) return this.buffer; // 可能已经淘汰，返回全部
    return this.buffer.slice(idx + 1);
  }
}
```

## 数据压缩

弱网环境下减少数据量至关重要：

```javascript
// 使用 MessagePack 替代 JSON
const msgpack = require('msgpack-lite');

// 压缩后发送
const compressed = msgpack.encode(data);
ws.send(compressed);

// 接收后解压
ws.on('message', (data) => {
  const message = msgpack.decode(data);
});

// 或者使用 pako 进行 zlib 压缩（适合大消息）
const pako = require('pako');

function compress(data) {
  const json = JSON.stringify(data);
  return pako.deflate(json);
}

function decompress(data) {
  const inflated = pako.inflate(data, { to: 'string' });
  return JSON.parse(inflated);
}
```

## 连接降级策略

当 WebSocket 不可用时，优雅降级到长轮询：

```javascript
class ConnectionWithFallback {
  constructor(url) {
    this.wsUrl = url;
    this.httpUrl = url.replace('ws', 'http');
    this.mode = 'websocket'; // 'websocket' | 'polling'
  }

  async connect() {
    try {
      this.ws = new WebSocket(this.wsUrl);
      await this.waitForOpen();
      this.mode = 'websocket';
    } catch (err) {
      console.log('WebSocket 失败，降级到长轮询');
      this.mode = 'polling';
      this.startPolling();
    }
  }

  startPolling() {
    const poll = async () => {
      try {
        const res = await fetch(`${this.httpUrl}/poll`, {
          headers: { 'X-Client-ID': this.clientId }
        });
        const messages = await res.json();
        messages.forEach(msg => this.handleMessage(msg));
      } catch (err) {
        // 长轮询也失败，等待后重试
        await this.delay(5000);
      }
      if (this.mode === 'polling') {
        poll(); // 继续轮询
      }
    };
    poll();
  }

  send(data) {
    if (this.mode === 'websocket' && this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      // 降级模式下用 HTTP 发送
      fetch(`${this.httpUrl}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    }
  }
}
```
