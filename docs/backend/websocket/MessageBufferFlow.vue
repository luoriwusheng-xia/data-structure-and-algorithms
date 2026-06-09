<template>
  <div class="flow-container">
    <!-- 用户操作 -->
    <div class="flow-node flow-start">
      <div class="node-icon">👤</div>
      <div class="node-title">用户点击发送</div>
      <div class="node-desc">点赞 / 评论 / 发送消息</div>
    </div>

    <div class="flow-arrow">▼</div>

    <!-- 检查连接 -->
    <div class="flow-node flow-decision">
      <div class="node-icon">🔍</div>
      <div class="node-title">检查 WebSocket 状态</div>
      <div class="node-desc">readyState === OPEN ?</div>
    </div>

    <!-- 分支 -->
    <div class="flow-branch">
      <div class="branch-left">
        <div class="branch-arrow-left">◀ 已连接</div>
        <div class="flow-node flow-success">
          <div class="node-icon">✅</div>
          <div class="node-title">直接发送</div>
          <div class="node-desc">ws.send(data) 立即发出</div>
        </div>
        <div class="branch-arrow-down">▼</div>
        <div class="flow-node flow-success">
          <div class="node-icon">📨</div>
          <div class="node-title">服务端处理</div>
          <div class="node-desc">消息送达，业务生效</div>
        </div>
      </div>

      <div class="branch-right">
        <div class="branch-arrow-right">未连接 ▶</div>
        <div class="flow-node flow-warn">
          <div class="node-icon">📥</div>
          <div class="node-title">进入缓冲队列</div>
          <div class="node-desc">messageQueue.push(msg)</div>
        </div>
        <div class="branch-arrow-down">▼</div>
        <div class="flow-node flow-warn">
          <div class="node-icon">🔄</div>
          <div class="node-title">显示"发送中..."</div>
          <div class="node-desc">UI 提示用户消息待发送</div>
        </div>
      </div>
    </div>

    <div class="flow-arrow-merge">▼ 网络恢复 / 重连成功</div>

    <!-- 分批 flush -->
    <div class="flow-node flow-process">
      <div class="node-icon">⚡</div>
      <div class="node-title">flushQueue() 分批发送</div>
      <div class="node-desc">每次 {{ batchSize }} 条，间隔 {{ interval }}ms</div>
    </div>

    <div class="flow-arrow">▼</div>

    <!-- 结果 -->
    <div class="flow-node flow-end">
      <div class="node-icon">🎉</div>
      <div class="node-title">缓冲队列清空</div>
      <div class="node-desc">所有消息已按序送达</div>
    </div>

    <!-- 状态条 -->
    <div class="flow-status-bar">
      <div class="status-item">
        <span class="status-dot" :class="{ active: queueLength > 0 }"></span>
        队列长度: {{ queueLength }}
      </div>
      <div class="status-item">
        <span class="status-dot" :class="{ active: isConnected }"></span>
        连接状态: {{ isConnected ? '已连接' : '已断开' }}
      </div>
      <div class="status-item">
        <span class="status-dot" :class="{ active: isFlushing }"></span>
        发送状态: {{ isFlushing ? '发送中...' : '空闲' }}
      </div>
    </div>

    <!-- 模拟控制 -->
    <div class="flow-controls">
      <button class="ctrl-btn" @click="simulateSend" :disabled="isFlushing">模拟发送消息</button>
      <button class="ctrl-btn" @click="toggleConnection">
        {{ isConnected ? '断开连接' : '恢复连接' }}
      </button>
      <button class="ctrl-btn" @click="reset">重置</button>
    </div>

    <!-- 队列可视化 -->
    <div class="queue-visual">
      <div class="queue-label">缓冲队列:</div>
      <div class="queue-items">
        <div
          v-for="(item, index) in queue"
          :key="item.id"
          class="queue-item"
          :class="{ sending: item.sending, sent: item.sent }"
        >
          {{ item.type }}
        </div>
        <div v-if="queue.length === 0" class="queue-empty">空</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  batchSize: { type: Number, default: 3 },
  interval: { type: Number, default: 800 }
})

const isConnected = ref(true)
const isFlushing = ref(false)
const queue = ref([])
let msgId = 0

const queueLength = computed(() => queue.value.length)

function simulateSend() {
  const types = ['点赞', '评论', '转发', '收藏']
  const type = types[Math.floor(Math.random() * types.length)]

  if (isConnected.value) {
    // 已连接，直接发送
    return
  }

  // 未连接，进入队列
  queue.value.push({
    id: ++msgId,
    type,
    sending: false,
    sent: false
  })

  // 队列上限 10，超过丢弃最老的
  if (queue.value.length > 10) {
    queue.value.shift()
  }
}

function toggleConnection() {
  if (isConnected.value) {
    // 断开
    isConnected.value = false
  } else {
    // 恢复，触发 flush
    isConnected.value = true
    flushQueue()
  }
}

async function flushQueue() {
  if (isFlushing.value || queue.value.length === 0) return
  isFlushing.value = true

  while (queue.value.length > 0 && isConnected.value) {
    const batch = queue.value.slice(0, props.batchSize)

    for (const item of batch) {
      item.sending = true
    }

    // 模拟网络发送延迟
    await delay(400)

    for (const item of batch) {
      item.sent = true
    }

    await delay(props.interval)

    // 移除已发送的
    queue.value = queue.value.slice(batch.length)
  }

  isFlushing.value = false
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function reset() {
  isConnected.value = true
  isFlushing.value = false
  queue.value = []
  msgId = 0
}
</script>

<style scoped>
.flow-container {
  padding: 24px;
  background: #1a1a2e;
  border-radius: 12px;
  color: #e0e0e0;
  font-family: 'Noto Sans SC', sans-serif;
}

.flow-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 24px;
  border-radius: 10px;
  margin: 0 auto;
  max-width: 320px;
  text-align: center;
}

.flow-start { background: #16213e; border: 2px solid #0f3460; }
.flow-decision { background: #1a1a3e; border: 2px solid #533483; }
.flow-success { background: #0d3328; border: 2px solid #00d26a; }
.flow-warn { background: #3d2b1f; border: 2px solid #f4a261; }
.flow-process { background: #1a2a4a; border: 2px solid #4361ee; }
.flow-end { background: #1a3a2a; border: 2px solid #2ecc71; }

.node-icon {
  font-size: 28px;
  margin-bottom: 8px;
}

.node-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}

.node-desc {
  font-size: 13px;
  color: #a0a0a0;
}

.flow-arrow {
  text-align: center;
  color: #666;
  font-size: 20px;
  padding: 8px 0;
}

.flow-branch {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin: 16px 0;
}

.branch-left,
.branch-right {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  max-width: 260px;
}

.branch-arrow-left,
.branch-arrow-right {
  font-size: 13px;
  color: #888;
  margin-bottom: 8px;
}

.branch-arrow-down {
  text-align: center;
  color: #666;
  font-size: 20px;
  padding: 8px 0;
}

.flow-arrow-merge {
  text-align: center;
  color: #4361ee;
  font-size: 14px;
  font-weight: 500;
  padding: 12px 0;
}

.flow-status-bar {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-top: 24px;
  padding: 12px;
  background: #0f0f23;
  border-radius: 8px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #444;
  transition: background 0.3s;
}

.status-dot.active {
  background: #00d26a;
  box-shadow: 0 0 8px #00d26a66;
}

.flow-controls {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 16px;
}

.ctrl-btn {
  padding: 8px 20px;
  border: none;
  border-radius: 6px;
  background: #4361ee;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}

.ctrl-btn:hover {
  background: #3a52d1;
}

.ctrl-btn:disabled {
  background: #555;
  cursor: not-allowed;
}

.queue-visual {
  margin-top: 20px;
  padding: 16px;
  background: #0f0f23;
  border-radius: 8px;
}

.queue-label {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 12px;
  color: #aaa;
}

.queue-items {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  min-height: 40px;
  align-items: center;
}

.queue-item {
  padding: 6px 14px;
  border-radius: 6px;
  background: #3d2b1f;
  border: 1px solid #f4a261;
  font-size: 13px;
  transition: all 0.3s;
}

.queue-item.sending {
  background: #1a2a4a;
  border-color: #4361ee;
  animation: pulse 0.6s infinite;
}

.queue-item.sent {
  background: #0d3328;
  border-color: #00d26a;
  opacity: 0.6;
}

.queue-empty {
  color: #555;
  font-size: 13px;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>
