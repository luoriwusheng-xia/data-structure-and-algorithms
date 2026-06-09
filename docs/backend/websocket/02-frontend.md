# WebSocket 前端实战

## 浏览器原生 WebSocket API

### 基础用法

```javascript
// 创建连接
const ws = new WebSocket('wss://example.com/socket');

// 连接建立
ws.onopen = () => {
  console.log('连接已建立');
  ws.send(JSON.stringify({ type: 'join', roomId: 'room_001' }));
};

// 接收消息
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('收到消息:', data);
};

// 连接关闭
ws.onclose = (event) => {
  console.log('连接关闭', event.code, event.reason);
};

// 发生错误
ws.onerror = (error) => {
  console.error('WebSocket 错误:', error);
};
```

### 生产级 WebSocket 客户端封装

实际项目中需要处理重连、心跳、断线检测等问题：

```javascript
/**
 * 生产级 WebSocket 客户端封装
 *
 * 设计要点：
 * - 自动重连：网络抖动或服务器重启后自动恢复连接
 * - 心跳保活：检测并清理死连接，避免 NAT/代理超时断开
 * - 事件驱动：通过 on/emit 模式解耦业务逻辑
 * - 手动关闭识别：区分用户主动关闭和异常断开，避免不必要的重连
 */
class WebSocketClient {
  constructor(url, options = {}) {
    this.url = url;
    this.options = {
      reconnectBaseDelay: 1000,   // 重连基础延迟（指数退避起始值）
      reconnectMaxDelay: 30000,   // 重连最大延迟（指数退避上限）
      maxReconnectAttempts: 10,   // 最大重连次数，防止无限重连耗尽资源
      heartbeatInterval: 30000,   // 心跳间隔 30s，平衡及时性与开销
      heartbeatMsg: { type: 'ping' },
      ...options
    };

    this.ws = null;
    this.reconnectAttempts = 0;
    this.heartbeatTimer = null;   // 心跳定时器引用，用于清理
    this.reconnectTimer = null;   // 重连定时器引用，用于清理
    this.listeners = new Map();   // 自定义事件中心，替代原生事件
    this.isManualClose = false;   // 标记是否用户主动关闭，控制是否触发重连
  }

  /**
   * 建立连接
   * @returns {Promise} 连接成功 resolve，失败 reject
   *
   * 注意：connect() 可被重复调用（重连时内部复用），
   * 每次调用会创建新的 WebSocket 实例，旧实例的事件监听需由浏览器 GC 回收
   */
  connect() {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = (event) => {
          // 连接成功时重置重连计数器，否则错误次数会持续累积
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          this.emit('open', event);
          resolve(event);
        };

        this.ws.onmessage = (event) => {
          const data = this.parseMessage(event.data);
          // 过滤心跳响应，避免将 ping/pong 暴露给业务层
          if (data.type === 'pong') return;
          this.emit('message', data);
        };

        this.ws.onclose = (event) => {
          this.stopHeartbeat();
          this.emit('close', event);

          // 非手动关闭则自动重连
          // 这里的判断很关键：用户主动 close() 时不应重连
          if (!this.isManualClose) {
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = (error) => {
          this.emit('error', error);
          reject(error);
        };
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * 发送消息
   * @param {string|Object} data - 字符串直接发送，对象自动 JSON 序列化
   * @returns {boolean} 发送成功返回 true，未连接时返回 false
   */
  send(data) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const payload = typeof data === 'string' ? data : JSON.stringify(data);
      this.ws.send(payload);
      return true;
    }
    return false;
  }

  /**
   * 启动心跳定时器
   * 先执行 stopHeartbeat() 防止重复启动多个定时器
   */
  startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send(this.options.heartbeatMsg);
      }
    }, this.options.heartbeatInterval);
  }

  // 停止心跳定时器
  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /**
   * 计划重连
   * 使用指数退避（Exponential Backoff）计算延迟，避免断开后立即重连造成服务器压力（惊群效应）
   * 延迟序列：1s, 2s, 4s, 8s, 16s, 30s, 30s... 上限 30s
   * 额外添加随机抖动打散并发重连时间点
   */
  scheduleReconnect() {
    if (this.reconnectAttempts >= this.options.maxReconnectAttempts) {
      this.emit('maxReconnectReached');
      return;
    }

    this.reconnectAttempts++;
    this.emit('reconnecting', this.reconnectAttempts);

    const expDelay = Math.min(
      this.options.reconnectBaseDelay * 2 ** (this.reconnectAttempts - 1),
      this.options.reconnectMaxDelay
    );
    const jitter = Math.random() * 0.2 * expDelay; // 20% 随机抖动
    const delay = Math.floor(expDelay + jitter);

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  /**
   * 注册事件监听器
   * @param {string} event - 事件名：open | message | close | error | reconnecting | maxReconnectReached
   * @param {Function} callback - 回调函数
   * @returns {Function} 返回取消监听的函数，便于组件卸载时清理
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const idx = callbacks.indexOf(callback);
      if (idx > -1) callbacks.splice(idx, 1);
    }
  }

  emit(event, data) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(cb => cb(data));
    }
  }

  /**
   * 关闭连接
   * @param {number} code - 关闭状态码，1000 表示正常关闭
   * @param {string} reason - 关闭原因
   *
   * 流程：标记手动关闭 -> 停止心跳 -> 清除重连定时器 -> 关闭原生连接
   */
  close(code = 1000, reason = '') {
    this.isManualClose = true;
    this.stopHeartbeat();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.ws?.close(code, reason);
  }

  /**
   * 解析消息体
   * 尝试 JSON 解析，失败时回退为原始字符串，避免解析异常导致整个消息丢失
   */
  parseMessage(data) {
    try {
      return JSON.parse(data);
    } catch {
      return { type: 'raw', data };
    }
  }

  // 获取原生 WebSocket 连接状态（CONNECTING=0, OPEN=1, CLOSING=2, CLOSED=3）
  get readyState() {
    return this.ws?.readyState ?? WebSocket.CLOSED;
  }

  // 连接是否处于打开状态
  get isConnected() {
    return this.readyState === WebSocket.OPEN;
  }
}

export default WebSocketClient;
```

### 使用示例

```javascript
import WebSocketClient from './WebSocketClient';

const client = new WebSocketClient('wss://api.example.com/ws', {
  heartbeatInterval: 30000,
  reconnectBaseDelay: 1000,
  reconnectMaxDelay: 30000
});

// 监听各类事件
client.on('open', () => {
  console.log('连接成功');
  client.send({ type: 'subscribe', channel: 'notifications' });
});

client.on('message', (data) => {
  switch (data.type) {
    case 'notification':
      showToast(data.content);
      break;
    case 'price_update':
      updatePrice(data.symbol, data.price);
      break;
  }
});

client.on('reconnecting', (attempt) => {
  console.log(`第 ${attempt} 次重连...`);
});

client.on('close', () => {
  console.log('连接断开');
});

// 建立连接
client.connect();

// 页面卸载时关闭
window.addEventListener('beforeunload', () => {
  client.close();
});
```

## 在 Vue/React 中使用

### Vue 3 Composable

```javascript
// composables/useWebSocket.js
import { ref, onMounted, onUnmounted } from 'vue';
import WebSocketClient from '../utils/WebSocketClient';

export function useWebSocket(url, options = {}) {
  const client = ref(null);
  const isConnected = ref(false);
  const lastMessage = ref(null);
  const error = ref(null);

  onMounted(() => {
    client.value = new WebSocketClient(url, options);

    client.value.on('open', () => { isConnected.value = true; });
    client.value.on('close', () => { isConnected.value = false; });
    client.value.on('message', (msg) => { lastMessage.value = msg; });
    client.value.on('error', (err) => { error.value = err; });

    client.value.connect();
  });

  onUnmounted(() => {
    client.value?.close();
  });

  const send = (data) => client.value?.send(data);

  return {
    client,
    isConnected,
    lastMessage,
    error,
    send
  };
}

// 组件中使用
// const { isConnected, lastMessage, send } = useWebSocket('wss://api.example.com/ws');
```

### React Hook

```javascript
// hooks/useWebSocket.js
import { useEffect, useRef, useState, useCallback } from 'react';
import WebSocketClient from '../utils/WebSocketClient';

export function useWebSocket(url, options = {}) {
  const clientRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);

  useEffect(() => {
    const client = new WebSocketClient(url, options);
    clientRef.current = client;

    client.on('open', () => setIsConnected(true));
    client.on('close', () => setIsConnected(false));
    client.on('message', (msg) => setLastMessage(msg));

    client.connect();

    return () => client.close();
  }, [url]);

  const send = useCallback((data) => {
    return clientRef.current?.send(data);
  }, []);

  return { isConnected, lastMessage, send };
}
```

## 弱网环境下的典型问题

弱网环境（高延迟、高丢包、网络切换）下，原生 WebSocket 会直接暴露出以下问题，`WebSocketClient` 类的每个设计点都对应解决一类场景：

### 1. 网络抖动导致频繁断开

**场景**：地铁进隧道、电梯里、4G/5G 基站切换时，TCP 连接被中间件（NAT、负载均衡器）静默丢弃，浏览器不会立刻感知，直到下一次发送或心跳超时才发现断开。

**原生表现**：`onclose` 突然触发，`onerror` 通常无详细信息，业务层直接断线。

**对应代码**：`isManualClose` 字段 + `scheduleReconnect()`

```javascript
this.ws.onclose = (event) => {
  // 非手动关闭则自动重连
  if (!this.isManualClose) {
    this.scheduleReconnect();
  }
};
```

只有用户主动调用 `client.close()` 时 `isManualClose` 才为 `true`，网络原因导致的断开都会触发自动重连。

### 2. 消息发送失败直接丢失

**场景**：用户正在编辑一条消息点击发送，恰好此时网络断开，`ws.send()` 静默失败，消息永久丢失。

**原生表现**：`send()` 在 `CONNECTING` 状态时直接抛异常或静默丢弃，`CLOSING/CLOSED` 状态则直接报错。

**对应代码**：`send()` 先判断 `readyState`

```javascript
send(data) {
  if (this.ws?.readyState === WebSocket.OPEN) {
    this.ws.send(payload);
    return true;  // 调用方知道发送成功
  }
  return false;   // 调用方知道发送失败，可缓存重试
}
```

返回 `boolean` 让调用层感知结果，而不是像原生 API 那样静默失败。

### 3. 断线期间的消息堆积

**场景**：断网 30 秒期间，用户发了 5 条消息、点了 3 个赞，恢复网络后这些数据需要补发。

**对应方案**：`ReliableWebSocket` 中的 `messageQueue`

```javascript
if (!this.isConnected) {
  this.messageQueue.push(message);  // 断线时入队
  return false;
}
// 重连后 flushQueue() 逐个发出
```

### 4. 断网恢复后连接不会自动恢复

**场景**：用户走出电梯或隧道，WiFi / 4G 已恢复，但页面仍是"离线"状态，需要等待好几秒甚至几十秒才自动重连。

**原生表现**：
- 断网期间 TCP 连接被中间件（NAT、负载均衡器）静默丢弃，浏览器不会立刻触发 `onclose`
- `scheduleReconnect()` 的指数退避定时器仍在按固定间隔触发，但每次连接尝试都会失败
- 网络恢复瞬间，如果当前正处于两次退避等待之间，客户端要等到**下一次定时器触发**才能尝试重连，用户体验差

**对应代码**：监听浏览器 `online` 事件，网络恢复时**立即打断**退避等待队列，重置计数器并主动发起连接：

```javascript
window.addEventListener('online', () => {
  // 只有非手动关闭且当前未连接时才处理
  if (!this.isConnected && !this.isManualClose) {
    // 清除当前的重连定时器，跳过剩余的退避等待时间
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    // 重置退避计数器，避免网络恢复后仍以高延迟重连
    this.reconnectAttempts = 0;
    this.connect();
  }
});
```

**原理**：指数退避在网络持续不可达时非常有用（避免频繁请求），但一旦网络恢复，等待下一次退避间隔反而是负担。`online` 事件作为外部信号，可以立刻将"网络恢复 → 连接恢复"的延迟从"下一次退避间隔"缩短到"一次 WebSocket 握手时间"。

### 5. 心跳超时误判死连接

**场景**：网络延迟飙升到 5 秒，心跳包响应变慢，客户端误以为是死连接而主动断开，反而加剧了不稳定。

**对应代码**：心跳间隔不宜过短（默认 30s），且 `startHeartbeat()` 在每次 `onopen` 时重新启动

```javascript
// 连接成功时重置重连计数器
this.reconnectAttempts = 0;
this.startHeartbeat();
```

### 6. 重连风暴（Thundering Herd）

**场景**：服务器重启后，1000 个客户端同时检测到断开并立即重连，瞬间打满服务器连接池。

**对应代码**：`scheduleReconnect()` 使用指数退避 + 随机抖动

```javascript
const expDelay = Math.min(
  this.options.reconnectBaseDelay * 2 ** (this.reconnectAttempts - 1),
  this.options.reconnectMaxDelay
);
const jitter = Math.random() * 0.2 * expDelay; // 20% 随机抖动
const delay = Math.floor(expDelay + jitter);

this.reconnectTimer = setTimeout(() => {
  this.connect();
}, delay);  // 延迟序列：1s, 2s, 4s, 8s, 16s, 30s... 上限 30s
```

指数退避避免客户端在服务器恢复瞬间同时发起重连（惊群效应），随机抖动进一步打散并发时间点。

### 7. 浏览器后台冻结定时器

**场景**：用户切换标签页到后台，浏览器将 `setInterval` 节流到最低 1 分钟一次，心跳停止发送，服务器误判客户端已死而断开连接。

**影响**：切回前台时发现连接已死，需要重新走一遍重连流程。

**缓解方案**：监听 `visibilitychange`，页面重新可见时主动检测连接状态：

```javascript
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && !client.isConnected) {
    client.connect();
  }
});
```

### 8. `onerror` 几乎无法获取有效信息

**场景**：连接失败时想知道是 DNS 错误、TLS 握手失败还是服务器拒绝，但浏览器 WebSocket 的 `error` 事件对象里几乎没有可用字段。

**原生表现**：`console.log(error)` 输出 `{}` 或 `undefined`。

**对应代码**：`connect()` 返回 Promise，`reject` 时至少能知道是在哪个阶段失败

```javascript
client.connect()
  .then(() => console.log('握手成功'))
  .catch((err) => console.log('连接阶段失败', err));
```

配合 `reconnecting` 事件，业务层可以给用户展示"第 N 次重连中..."的反馈。

---

## 消息队列与断线缓存

弱网环境下，发送失败的消息需要缓存并在重连后重发：

```javascript
class ReliableWebSocket extends WebSocketClient {
  constructor(url, options = {}) {
    super(url, options);
    this.messageQueue = [];     // 待发送消息队列
    this.pendingAcks = new Map(); // 等待确认的消息
    this.messageId = 0;
  }

  send(data, requireAck = false) {
    const message = {
      id: ++this.messageId,
      timestamp: Date.now(),
      data
    };

    // 如果未连接，加入队列
    if (!this.isConnected) {
      this.messageQueue.push(message);
      return false;
    }

    // 调用父类 WebSocketClient 的 send，直接发送原始消息，避免 ReliableWebSocket.send 递归入队
    const sent = super.send(message);

    if (requireAck && sent) {
      this.pendingAcks.set(message.id, message);
      // 超时未确认则重发
      setTimeout(() => {
        if (this.pendingAcks.has(message.id)) {
          this.send(data, requireAck);
        }
      }, 5000);
    }

    return sent;
  }

  // 连接成功后发送队列中的消息
  onopen(event) {
    super.onopen?.(event);
    this.flushQueue();
  }

  flushQueue() {
    while (this.messageQueue.length > 0 && this.isConnected) {
      const msg = this.messageQueue.shift();
      super.send(msg);
    }
  }

  // 收到服务端确认后移除待确认记录，在 onmessage 中调用
  handleAck(messageId) {
    this.pendingAcks.delete(messageId);
  }
}
```

### ReliableWebSocket 使用方式

```javascript
const client = new ReliableWebSocket('wss://api.example.com/ws');

client.on('message', (msg) => {
  // 收到服务端回执，解除该消息的 pending 状态
  if (msg.type === 'ack') {
    client.handleAck(msg.id);
    return;
  }

  // 处理业务消息
  console.log('收到:', msg);
});

// 发送消息并要求确认（requireAck = true）
client.on('open', () => {
  client.send({ type: 'chat', text: '你好' }, true);
});
```

**流程说明**：
1. 调用 `client.send(data, true)` 时，消息被标记为需要确认，存入 `pendingAcks`
2. 服务端收到后需回复 `{ type: 'ack', id: messageId }`
3. 客户端在 `onmessage` 中调用 `handleAck(msg.id)` 将其从 `pendingAcks` 移除
4. 若 5 秒内未收到 `ack`，`setTimeout` 回调发现该消息仍在 `pendingAcks` 中，自动重发

---

## 消息缓冲

### 场景

用户在断网期间继续操作页面（点赞、评论、发送消息），这些操作产生的数据不能丢失，需要在网络恢复后补发。

点击"断开连接"模拟断网，然后多次点击"模拟发送消息"将消息加入缓冲队列，最后点击"恢复连接"观察分批 flush 过程：

<script setup>
import { defineAsyncComponent } from 'vue'
const MessageBufferFlow = defineAsyncComponent(() =>
  import('./MessageBufferFlow.vue')
)
</script>

<MessageBufferFlow :batch-size="3" :interval="800" />

### 缓冲策略

简单的数组 `push/shift` 在消息量大时会导致两个问题：

1. **内存无限增长**：用户离线几小时，缓冲队列可能堆积上千条消息
2. **恢复后拥塞**：重连瞬间一次性发出上千条消息，服务端和带宽同时被打满

合理的缓冲策略需要三个限制：

| 限制 | 说明 | 推荐值 |
|------|------|--------|
| **队列上限** | 超过上限时丢弃最早的消息（FIFO） | 100 ~ 500 条 |
| **单次 flush 数量** | 每次重连后最多连续发出 N 条 | 20 ~ 50 条 |
| **flush 间隔** | 每批之间留出让路时间 | 50 ~ 100 ms |

### 带流控的缓冲实现

```javascript
class BufferedWebSocket extends WebSocketClient {
  constructor(url, options = {}) {
    super(url, options);
    this.messageQueue = [];           // 待发送消息队列
    this.maxQueueSize = options.maxQueueSize || 100;    // 队列上限
    this.flushBatchSize = options.flushBatchSize || 20; // 单次 flush 数量
    this.flushInterval = options.flushInterval || 50;   // 批次间隔 ms
  }

  send(data) {
    // 已连接时直接发送
    if (this.isConnected) {
      return super.send(data);
    }

    // 未连接时入队，队列满则丢弃最老的消息
    if (this.messageQueue.length >= this.maxQueueSize) {
      const dropped = this.messageQueue.shift();
      this.emit('dropped', dropped);  // 通知业务层有消息被丢弃
    }

    this.messageQueue.push({
      id: ++this.messageId,
      timestamp: Date.now(),
      data
    });

    this.emit('buffered', this.messageQueue.length);
    return false;
  }

  // 连接成功后分批发消息，避免拥塞
  flushQueue() {
    const flushBatch = () => {
      let sent = 0;
      while (
        this.messageQueue.length > 0 &&
        this.isConnected &&
        sent < this.flushBatchSize
      ) {
        const msg = this.messageQueue.shift();
        super.send(msg);
        sent++;
      }

      // 还有剩余消息，延迟后继续下一批
      if (this.messageQueue.length > 0 && this.isConnected) {
        setTimeout(flushBatch, this.flushInterval);
      }
    };

    flushBatch();
  }

  connect() {
    return super.connect().then((event) => {
      // 连接成功后自动 flush 缓冲队列
      if (this.messageQueue.length > 0) {
        this.flushQueue();
      }
      return event;
    });
  }
}
```

### 使用示例

```javascript
const client = new BufferedWebSocket('wss://api.example.com/ws', {
  maxQueueSize: 200,      // 最多缓冲 200 条
  flushBatchSize: 30,     // 每次重连后先发出 30 条
  flushInterval: 100      // 每批间隔 100ms
});

// 监听缓冲状态，给用户展示"已缓存 N 条消息"
client.on('buffered', (count) => {
  showToast(`网络异常，已缓存 ${count} 条消息`);
});

// 监听丢弃事件，提示用户部分操作可能未生效
client.on('dropped', (msg) => {
  console.warn('消息被丢弃:', msg);
});

// 断网期间用户操作正常执行，消息自动入队
client.send({ type: 'like', postId: '123' });
client.send({ type: 'comment', text: '好看' });
// ... 断网期间继续操作

// 网络恢复后，client.connect() 或重连成功后自动 flush
// 消息按入队顺序分批发出，用户无感知
```

### 与 ACK 机制的配合

缓冲 + ACK 组合使用时，flush 流程如下：

1. 断网期间消息进入 `messageQueue`
2. 网络恢复，`flushQueue()` 分批取出消息
3. 每条消息调用 `super.send()` 发出
4. 若开启了 `requireAck`，消息同时进入 `pendingAcks`
5. 收到服务端 ACK 后从 `pendingAcks` 移除
6. `pendingAcks` 中超时未 ACK 的消息触发重传

缓冲解决"断网期间消息不丢失"，ACK 解决"发出后确保送达"，两者互补。

---

## 消息 ACK 机制

### 为什么需要 ACK

WebSocket 基于 TCP，TCP 能保证数据**有序到达**和**不丢包**，但无法保证**应用层**的可靠投递：

- 客户端 `send()` 返回成功，只代表数据写入内核发送缓冲区，不表示服务端应用层已处理
- 服务端在收到消息后、回复响应前崩溃，消息实际已丢失
- 代理或负载均衡器可能静默丢弃消息而不通知任何一方

ACK（Acknowledgment，确认回执）机制在应用层补上了这一环：发送方必须收到接收方的显式确认，才算一次完整投递。

### 消息 ID 设计

ACK 机制的核心是消息 ID，需要满足两个特性：

| 特性 | 说明 |
|------|------|
| **唯一性** | 同一连接内不重复，防止 ACK 错乱匹配到另一条消息 |
| **单调递增** | 便于服务端检测乱序和重复，实现幂等去重 |

客户端实现：

```javascript
this.messageId = 0;  // 每实例一个计数器

// 生成消息
const message = {
  id: ++this.messageId,   // 1, 2, 3, ... 单调递增
  timestamp: Date.now(),
  data
};
```

### 客户端：发送与超时重传

客户端在发送消息后启动定时器，超时未收到 ACK 则自动重发：

```javascript
send(data, requireAck = false) {
  const message = {
    id: ++this.messageId,
    timestamp: Date.now(),
    data
  };

  if (!this.isConnected) {
    this.messageQueue.push(message);
    return false;
  }

  // 调用父类 WebSocketClient 的 send，直接发送原始消息
  const sent = super.send(message);

  if (requireAck && sent) {
    this.pendingAcks.set(message.id, message);

    // 超时未确认则重发
    setTimeout(() => {
      if (this.pendingAcks.has(message.id)) {
        // 仍留在 pending 中，说明未收到 ack，重发
        this.send(data, requireAck);
      }
    }, 5000);
  }

  return sent;
}

// 收到服务端 ACK 后解除 pending
handleAck(messageId) {
  this.pendingAcks.delete(messageId);
}
```

### 服务端：回复 ACK 与幂等去重

服务端收到消息后必须回复 ACK，且需要处理客户端重传导致的重复消息：

```javascript
// 服务端（Node.js + ws 示例）
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
  // 每个连接维护已处理的消息 ID 集合，用于幂等去重
  const processedIds = new Set();

  ws.on('message', (raw) => {
    const msg = JSON.parse(raw);

    // 1. 回复 ACK，告知客户端"我已收到"
    ws.send(JSON.stringify({ type: 'ack', id: msg.id }));

    // 2. 幂等去重：已处理过的消息直接忽略
    if (processedIds.has(msg.id)) {
      console.log(`消息 ${msg.id} 重复，已处理过，忽略`);
      return;
    }
    processedIds.add(msg.id);

    // 3. 处理业务逻辑
    console.log('处理消息:', msg.data);
    // ... 执行业务操作 ...
  });
});
```

### 幂等性的意义

超时重传必然导致服务端收到重复消息：

```
客户端          服务端
  |  -- msg#5 -->  |
  |     (丢包)     |
  |  -- msg#5 -->  |  服务端实际收到，但 ACK 回包丢失
  |  <-- ACK --    |  客户端未收到 ACK，触发重传
  |  -- msg#5 -->  |  服务端再次收到 msg#5
```

如果服务端不做去重，同一条消息会被执行多次（如扣款、发通知等）。通过 `processedIds` 集合记录已处理的消息 ID，重复消息在 ACK 回复后直接被丢弃，业务逻辑只执行一次。

### 前端消息去重

服务端幂等去重解决了"服务端不重复处理"的问题，但客户端仍可能收到重复消息。典型场景：

- **重连后补发**：服务端为断线客户端缓存了最近消息，恢复后推送，其中部分消息客户端在断线前已收到
- **广播重复**：服务端内部重试机制导致同一条通知被多次广播
- **代理层重复**：某些网关/代理在异常时会重复投递消息

前端去重与服务端幂等是对称的防护：

```javascript
class DeduplicatedWebSocket extends ReliableWebSocket {
  constructor(url, options = {}) {
    super(url, options);
    // 已接收消息 ID 集合，用于丢弃重复消息
    this.receivedIds = new Set();
    // 集合大小上限，防止内存无限增长
    this.maxReceivedCache = options.maxReceivedCache || 10000;
  }

  onmessage(event) {
    const msg = this.parseMessage(event.data);

    // 过滤心跳响应
    if (msg.type === 'pong') return;

    // 服务端消息通常带有 seq 或 id 字段
    const msgId = msg.seq ?? msg.id;

    if (msgId && this.receivedIds.has(msgId)) {
      console.log(`消息 ${msgId} 重复，前端已处理过，丢弃`);
      return;
    }

    if (msgId) {
      this.receivedIds.add(msgId);
      this.trimReceivedCache();
    }

    this.emit('message', msg);
  }

  trimReceivedCache() {
    if (this.receivedIds.size > this.maxReceivedCache) {
      // Set 按插入顺序迭代，删除最早的 20%
      const toDelete = Math.floor(this.maxReceivedCache * 0.2);
      const iter = this.receivedIds.values();
      for (let i = 0; i < toDelete; i++) {
        const val = iter.next().value;
        this.receivedIds.delete(val);
      }
    }
  }
}
```

**去重策略说明**：

| 场景 | 服务端行为 | 前端行为 |
|------|-----------|---------|
| 客户端重传 | 通过 `processedIds` 幂等去重，只执行一次 | 正常接收 ACK，消息不重复 |
| 服务端广播重复 | 可能多次发送同一消息 | `receivedIds` 检测重复，丢弃 |
| 重连后消息补发 | 推送历史消息缓存 | `receivedIds` 过滤已收到的 |

**关键设计点**：
- `receivedIds` 用 `Set` 保证 O(1) 查找效率
- 大小超过上限时淘汰最早的 20%，而非全部清空，避免刚淘汰的消息立刻又重复收到
- 消息必须携带全局唯一 ID（`seq` 或 `id`），纯文本消息无法去重

### 完整端到端示例

```javascript
// ===== 客户端 =====
const client = new ReliableWebSocket('wss://api.example.com/ws');

client.on('message', (msg) => {
  if (msg.type === 'ack') {
    client.handleAck(msg.id);
    console.log(`消息 ${msg.id} 已确认送达`);
    return;
  }
  console.log('收到服务端消息:', msg);
});

client.on('open', () => {
  // 发送关键消息，要求 ACK
  client.send({ type: 'order', orderId: 'ORD-001', amount: 199 }, true);
});

// ===== 服务端 =====
ws.on('message', (raw) => {
  const msg = JSON.parse(raw);

  // 先回 ACK，再处理业务
  ws.send(JSON.stringify({ type: 'ack', id: msg.id }));

  if (processedIds.has(msg.id)) return;
  processedIds.add(msg.id);

  // 执行业务：创建订单
  createOrder(msg.data);
});
```

### ACK 与心跳的区别

| | ACK | 心跳（Heartbeat） |
|--|-----|------------------|
| **目的** | 确认单条消息已被对方应用层处理 | 检测连接是否存活 |
| **触发** | 发送消息后被动等待 | 按固定间隔主动发送 |
| **丢失后果** | 触发重传，保证消息必达 | 触发断线重连，清理死连接 |
| **范围** | 针对具体消息 | 针对整条连接 |

两者配合使用：心跳保活连接，ACK 保证单条消息的可靠投递。
