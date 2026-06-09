# 瀑布式数据流 (Streaming Data)

## 什么是瀑布式数据

瀑布式数据（也叫流式数据）指数据以**持续、不间断的流**形式推送，而非一次性返回完整结果。典型场景：

- **AI 大模型对话**：逐字/逐句返回生成内容（如 ChatGPT 的打字机效果）
- **实时日志**：服务器日志实时推送
- **股票行情**：逐笔成交数据推送
- **文件传输**：大文件分片传输
- **视频直播**：音视频流

## 逐块推送实现

### 服务端：Node.js 分块发送

```javascript
// 模拟 AI 生成回复，逐字发送
async function streamResponse(ws, prompt) {
  const words = generateResponse(prompt).split('');

  for (const char of words) {
    // 模拟生成延迟
    await delay(30 + Math.random() * 50);

    if (ws.readyState !== WebSocket.OPEN) break;

    ws.send(JSON.stringify({
      type: 'stream',
      chunk: char,
      done: false
    }));
  }

  // 发送完成标记
  ws.send(JSON.stringify({
    type: 'stream',
    chunk: '',
    done: true
  }));
}

// 大文件分片传输
async function streamFile(ws, filePath, chunkSize = 64 * 1024) {
  const fs = require('fs');
  const stream = fs.createReadStream(filePath, { highWaterMark: chunkSize });
  let sequence = 0;

  for await (const chunk of stream) {
    if (ws.readyState !== WebSocket.OPEN) {
      stream.destroy();
      break;
    }

    ws.send(JSON.stringify({
      type: 'file_chunk',
      sequence: ++sequence,
      total: Math.ceil(fs.statSync(filePath).size / chunkSize),
      data: chunk.toString('base64')
    }));

    // 流量控制：等待客户端确认再继续
    await waitForAck(ws, sequence);
  }

  ws.send(JSON.stringify({ type: 'file_complete', sequence }));
}
```

### 客户端：逐块接收与渲染

```javascript
class StreamHandler {
  constructor() {
    this.buffers = new Map(); // streamId -> chunks[]
    this.renderedText = '';
  }

  onMessage(message) {
    switch (message.type) {
      case 'stream':
        this.handleStreamChunk(message);
        break;
      case 'file_chunk':
        this.handleFileChunk(message);
        break;
    }
  }

  handleStreamChunk({ chunk, done, streamId = 'default' }) {
    if (!this.buffers.has(streamId)) {
      this.buffers.set(streamId, []);
    }

    const buffer = this.buffers.get(streamId);

    if (!done) {
      buffer.push(chunk);
      // 实时渲染：打字机效果
      this.renderedText += chunk;
      this.updateDisplay(this.renderedText);
    } else {
      // 流结束
      const fullText = buffer.join('');
      this.onStreamComplete(streamId, fullText);
      this.buffers.delete(streamId);
    }
  }

  // 带缓冲的平滑渲染（避免过于频繁的 DOM 更新）
  smoothRender(streamId) {
    const buffer = this.buffers.get(streamId);
    if (!buffer || buffer.length === 0) return;

    // 每 50ms 渲染一次，合并期间收到的所有字符
    if (this.renderTimer) return;

    this.renderTimer = setInterval(() => {
      const chunks = this.buffers.get(streamId);
      if (!chunks || chunks.length === 0) {
        clearInterval(this.renderTimer);
        this.renderTimer = null;
        return;
      }

      const text = chunks.splice(0, chunks.length).join('');
      this.appendText(text);
    }, 50);
  }

  appendText(text) {
    const el = document.getElementById('output');
    el.textContent += text;
    // 自动滚动到底部
    el.scrollTop = el.scrollHeight;
  }
}
```

## 背压控制 (Backpressure)

当生产者速度超过消费者时，需要背压控制防止内存溢出：

```javascript
class BackpressureController {
  constructor(ws, highWaterMark = 100, lowWaterMark = 20) {
    this.ws = ws;
    this.queue = [];
    this.highWaterMark = highWaterMark;
    this.lowWaterMark = lowWaterMark;
    this.isPaused = false;
    this.processing = false;
  }

  push(data) {
    this.queue.push(data);

    // 超过高水位，暂停生产
    if (this.queue.length >= this.highWaterMark && !this.isPaused) {
      this.isPaused = true;
      this.ws.send(JSON.stringify({ type: 'pause' }));
    }

    this.process();
  }

  async process() {
    if (this.processing) return;
    this.processing = true;

    while (this.queue.length > 0) {
      const data = this.queue.shift();
      await this.consume(data);

      // 低于低水位，恢复生产
      if (this.queue.length <= this.lowWaterMark && this.isPaused) {
        this.isPaused = false;
        this.ws.send(JSON.stringify({ type: 'resume' }));
      }
    }

    this.processing = false;
  }

  async consume(data) {
    // 实际处理逻辑
    await this.render(data);
  }
}
```

## 服务端推送 (SSE) vs WebSocket 选择

| 场景 | 推荐方案 | 原因 |
|------|---------|------|
| 单向服务器推送（股票行情、日志）| SSE | 基于 HTTP，自动重连，更简单 |
| 双向实时通信（聊天、游戏）| WebSocket | 全双工，更低延迟 |
| AI 流式输出 | 两者皆可 | SSE 更简单；WebSocket 支持更多交互 |
| 大文件传输 | WebSocket | 二进制支持更好，可自定义分片 |

### SSE 简单示例

```javascript
// 服务端 (Express)
app.get('/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const sendData = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  // 模拟实时数据
  const interval = setInterval(() => {
    sendData({ time: Date.now(), price: Math.random() * 100 });
  }, 1000);

  req.on('close', () => {
    clearInterval(interval);
  });
});

// 客户端
const es = new EventSource('/events');
es.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log(data);
};
```

## 大列表虚拟滚动 + WebSocket 更新

```javascript
class VirtualListWithLiveUpdate {
  constructor(container, itemHeight, visibleCount) {
    this.container = container;
    this.itemHeight = itemHeight;
    this.visibleCount = visibleCount;
    this.items = [];        // 全部数据
    this.visibleItems = []; // 可视区域数据
    this.scrollTop = 0;
  }

  // WebSocket 推送新数据时
  onNewData(data) {
    // 插入到顶部（最新数据在前）
    this.items.unshift(data);

    // 如果用户在顶部，自动展示新数据
    if (this.scrollTop < this.itemHeight) {
      this.render();
    } else {
      // 用户正在浏览历史，显示"有新消息"提示
      this.showNewMessageHint();
    }
  }

  // 批量更新优化
  onBatchUpdate(newItems) {
    // 使用 requestAnimationFrame 批量渲染
    requestAnimationFrame(() => {
      this.items.unshift(...newItems);
      this.render();
    });
  }

  render() {
    const start = Math.floor(this.scrollTop / this.itemHeight);
    const end = start + this.visibleCount;
    const visible = this.items.slice(start, end);

    // 只渲染可视区域
    this.container.innerHTML = visible.map((item, idx) => `
      <div style="height:${this.itemHeight}px;top:${(start + idx) * this.itemHeight}px">
        ${this.renderItem(item)}
      </div>
    `).join('');
  }
}
```
