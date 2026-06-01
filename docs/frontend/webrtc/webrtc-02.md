# WebRTC 1v1 视频通话最小 MVP 实战

## 技术栈

- **前端**：Vite 8 + Vue 3 + TypeScript + `<script setup>`
- **后端**：Node.js 24 + Express 4.x + Socket.IO（信令服务器）
- **功能**：1v1 视频通话 + 屏幕共享 + 数据通道文字聊天

---

## 1. 项目初始化

### 1.1 目录结构

```
webrtc-mvp/
├── server/                          # 后端信令服务器
│   ├── package.json
│   ├── server.ts                    # 主入口
│   └── tsconfig.json
├── client/                          # 前端 Vue3 应用
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── index.html
│   └── src/
│       ├── main.ts
│       ├── App.vue
│       ├── components/
│       │   └── VideoCall.vue        # 核心视频通话组件
│       └── types/
│           └── webrtc.ts            # 类型定义
└── README.md
```

### 1.2 后端 package.json

`server/package.json`

```json
{
  "name": "webrtc-signaling-server",
  "version": "1.0.0",
  "description": "WebRTC 信令服务器",
  "type": "module",
  "scripts": {
    "dev": "tsx watch server.ts",
    "build": "tsc",
    "start": "node dist/server.js"
  },
  "dependencies": {
    "express": "^4.21.0",
    "socket.io": "^4.8.0"
  },
  "devDependencies": {
    "@types/express": "^5.0.0",
    "@types/node": "^22.0.0",
    "tsx": "^4.19.0",
    "typescript": "^5.7.0"
  }
}
```

### 1.3 后端 tsconfig.json

`server/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "./dist",
    "rootDir": "./",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

### 1.4 前端 package.json

`client/package.json`

```json
{
  "name": "webrtc-client",
  "version": "1.0.0",
  "description": "WebRTC 前端客户端",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "socket.io-client": "^4.8.0",
    "vue": "^3.5.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.2.0",
    "@vue/tsconfig": "^0.7.0",
    "typescript": "^5.7.0",
    "vite": "^6.0.0",
    "vue-tsc": "^2.2.0"
  }
}
```

### 1.5 前端 vite.config.ts

`client/vite.config.ts`

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    // 开发时代理到信令服务器
    proxy: {
      '/socket.io': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        ws: true
      }
    }
  }
})
```

### 1.6 前端 tsconfig.json

`client/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.tsx", "src/**/*.vue"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### 1.7 前端 tsconfig.node.json

`client/tsconfig.node.json`

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": ["vite.config.ts"]
}
```

### 1.8 前端入口 HTML

`client/index.html`

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>WebRTC 视频通话</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

### 1.9 前端入口 main.ts

`client/src/main.ts`

```typescript
import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')
```

### 1.10 安装依赖命令

```bash
# 后端
mkdir -p server && cd server
npm install

# 前端
mkdir -p client && cd client
npm install
```

---

## 2. 后端信令服务器（Express + Socket.IO）

### 2.1 完整 server.ts 代码

`server/server.ts`

```typescript
import express, { Request, Response } from 'express'
import { createServer } from 'http'
import { Server, Socket } from 'socket.io'

// ==================== 类型定义 ====================

interface Room {
  roomId: string
  users: Map<string, UserInfo>  // socketId -> UserInfo
}

interface UserInfo {
  socketId: string
  joinedAt: number
}

// 客户端 -> 服务器 事件
interface ClientToServerEvents {
  'join-room': (data: { roomId: string }, callback: (result: { success: boolean; peerCount: number; error?: string }) => void) => void
  'offer': (data: OfferPayload) => void
  'answer': (data: AnswerPayload) => void
  'ice-candidate': (data: IceCandidatePayload) => void
  'leave-room': () => void
}

// 服务器 -> 客户端 事件
interface ServerToClientEvents {
  'user-joined': (data: { socketId: string }) => void
  'user-left': (data: { socketId: string }) => void
  'offer': (data: OfferPayload) => void
  'answer': (data: AnswerPayload) => void
  'ice-candidate': (data: IceCandidatePayload) => void
  'room-full': () => void
}

interface OfferPayload {
  targetId: string    // 目标用户的 socketId
  sdp: RTCSessionDescriptionInit
}

interface AnswerPayload {
  targetId: string
  sdp: RTCSessionDescriptionInit
}

interface IceCandidatePayload {
  targetId: string
  candidate: RTCIceCandidateInit
}

// ==================== 服务器初始化 ====================

const app = express()
const httpServer = createServer(app)

// CORS 配置：允许前端开发服务器访问
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST'],
    credentials: true
  }
})

// 内存中的房间管理
const rooms = new Map<string, Room>()

// 每个 socket 当前所在的房间
const socketToRoom = new Map<string, string>()

// ==================== Socket.IO 事件处理 ====================

io.on('connection', (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
  console.log(`[连接] 用户已连接: ${socket.id}`)

  // ---- 加入房间 ----
  socket.on('join-room', (data, callback) => {
    const { roomId } = data

    // 获取或创建房间
    let room = rooms.get(roomId)
    if (!room) {
      room = { roomId, users: new Map() }
      rooms.set(roomId, room)
    }

    // 限制房间人数为 2（1v1 通话）
    if (room.users.size >= 2) {
      callback({ success: false, peerCount: room.users.size, error: '房间已满' })
      return
    }

    // 加入 Socket.IO 房间
    socket.join(roomId)

    // 通知房间内已有的用户（如果有）
    for (const [existingSocketId] of room.users) {
      // 通知新用户：已有用户在房间
      socket.emit('user-joined', { socketId: existingSocketId })
      // 通知已有用户：新用户加入
      socket.to(existingSocketId).emit('user-joined', { socketId: socket.id })
    }

    // 将新用户加入房间列表
    room.users.set(socket.id, { socketId: socket.id, joinedAt: Date.now() })
    socketToRoom.set(socket.id, roomId)

    console.log(`[房间] ${socket.id} 加入房间 ${roomId}, 当前人数: ${room.users.size}`)
    callback({ success: true, peerCount: room.users.size })
  })

  // ---- 转发 WebRTC Offer ----
  socket.on('offer', (data) => {
    const { targetId, sdp } = data
    console.log(`[信令] ${socket.id} -> ${targetId}: offer`)
    // 转发给目标用户
    socket.to(targetId).emit('offer', {
      targetId: socket.id,  // 目标用户需要知道是谁发的 offer
      sdp
    })
  })

  // ---- 转发 WebRTC Answer ----
  socket.on('answer', (data) => {
    const { targetId, sdp } = data
    console.log(`[信令] ${socket.id} -> ${targetId}: answer`)
    socket.to(targetId).emit('answer', {
      targetId: socket.id,
      sdp
    })
  })

  // ---- 转发 ICE Candidate ----
  socket.on('ice-candidate', (data) => {
    const { targetId, candidate } = data
    console.log(`[信令] ${socket.id} -> ${targetId}: ice-candidate`)
    socket.to(targetId).emit('ice-candidate', {
      targetId: socket.id,
      candidate
    })
  })

  // ---- 离开房间 ----
  socket.on('leave-room', () => {
    handleUserLeave(socket)
  })

  // ---- 断开连接 ----
  socket.on('disconnect', () => {
    console.log(`[断开] 用户断开: ${socket.id}`)
    handleUserLeave(socket)
  })
})

// ==================== 辅助函数 ====================

function handleUserLeave(socket: Socket): void {
  const roomId = socketToRoom.get(socket.id)
  if (!roomId) return

  const room = rooms.get(roomId)
  if (room) {
    // 从房间中移除用户
    room.users.delete(socket.id)

    // 通知房间内其他用户
    socket.to(roomId).emit('user-left', { socketId: socket.id })

    // 如果房间为空，删除房间
    if (room.users.size === 0) {
      rooms.delete(roomId)
      console.log(`[房间] 房间 ${roomId} 已删除`)
    }

    console.log(`[房间] ${socket.id} 离开房间 ${roomId}, 剩余人数: ${room.users.size}`)
  }

  socketToRoom.delete(socket.id)
  socket.leave(roomId)
}

// ==================== 启动服务器 ====================

const PORT = process.env.PORT || 3000

httpServer.listen(PORT, () => {
  console.log(`[启动] 信令服务器运行在 http://localhost:${PORT}`)
  console.log(`[提示] 同一房间最多允许 2 人（1v1 通话）`)
})
```

### 2.2 Socket.IO 事件设计说明

| 事件 | 方向 | 说明 |
|------|------|------|
| `join-room` | C->S | 加入指定房间，返回房间内已有用户数量 |
| `user-joined` | S->C | 通知有新用户加入房间 |
| `offer` | C->S->C | 转发 SDP Offer |
| `answer` | C->S->C | 转发 SDP Answer |
| `ice-candidate` | C->S->C | 转发 ICE 候选地址 |
| `user-left` | S->C | 通知有用户离开房间 |
| `leave-room` | C->S | 主动离开房间 |

### 2.3 运行方式

```bash
cd server
npm run dev
# 或使用 tsx 直接运行
npx tsx server.ts
```

---

## 3. 前端核心代码

### 3.1 类型定义

`client/src/types/webrtc.ts`

```typescript
// WebRTC 相关类型定义

export interface CallState {
  isInRoom: boolean
  isConnected: boolean      // RTCPeerConnection 是否已连接
  isCalling: boolean        // 是否正在呼叫中
  remotePeerId: string | null
}

export interface ChatMessage {
  id: string
  sender: 'local' | 'remote'
  text: string
  timestamp: number
}

// Socket.IO 事件载荷
export interface OfferPayload {
  targetId: string
  sdp: RTCSessionDescriptionInit
}

export interface AnswerPayload {
  targetId: string
  sdp: RTCSessionDescriptionInit
}

export interface IceCandidatePayload {
  targetId: string
  candidate: RTCIceCandidateInit
}

export interface UserJoinedPayload {
  socketId: string
}

export interface UserLeftPayload {
  socketId: string
}
```

### 3.2 核心视频通话组件

`client/src/components/VideoCall.vue`

```vue
<template>
  <div class="video-call">
    <!-- 顶部状态栏 -->
    <div class="status-bar">
      <span class="status">状态: {{ statusText }}</span>
      <span v-if="remotePeerId" class="peer-id">对方ID: {{ remotePeerId.slice(0, 8) }}...</span>
    </div>

    <!-- 视频区域 -->
    <div class="video-container">
      <!-- 本地视频 -->
      <div class="video-wrapper local">
        <video
          ref="localVideoRef"
          autoplay
          playsinline
          muted
          class="video"
        />
        <span class="video-label">本地</span>
      </div>

      <!-- 远端视频 -->
      <div class="video-wrapper remote">
        <video
          ref="remoteVideoRef"
          autoplay
          playsinline
          class="video"
        />
        <span v-if="!callState.isConnected" class="video-label waiting">
          等待对方加入...
        </span>
        <span v-else class="video-label">远端</span>
      </div>
    </div>

    <!-- 控制按钮 -->
    <div class="controls">
      <template v-if="!callState.isInRoom">
        <input
          v-model="roomId"
          placeholder="输入房间号"
          class="room-input"
          @keyup.enter="joinRoom"
        />
        <button class="btn btn-primary" @click="joinRoom">加入房间</button>
      </template>

      <template v-else>
        <button class="btn" :class="{ 'btn-muted': isAudioMuted }" @click="toggleAudio">
          {{ isAudioMuted ? '取消静音' : '静音' }}
        </button>
        <button class="btn" :class="{ 'btn-muted': isVideoMuted }" @click="toggleVideo">
          {{ isVideoMuted ? '开启视频' : '关闭视频' }}
        </button>
        <button class="btn btn-screen" @click="toggleScreenShare">
          {{ isScreenSharing ? '停止共享' : '屏幕共享' }}
        </button>
        <button class="btn btn-danger" @click="leaveRoom">离开房间</button>
      </template>
    </div>

    <!-- 数据通道聊天 -->
    <div v-if="callState.isInRoom" class="chat-section">
      <div class="chat-messages" ref="chatMessagesRef">
        <div
          v-for="msg in messages"
          :key="msg.id"
          :class="['message', msg.sender]"
        >
          <span class="msg-text">{{ msg.text }}</span>
          <span class="msg-time">{{ formatTime(msg.timestamp) }}</span>
        </div>
      </div>
      <div class="chat-input-area">
        <input
          v-model="chatInput"
          placeholder="输入消息..."
          class="chat-input"
          @keyup.enter="sendMessage"
        />
        <button class="btn btn-primary" @click="sendMessage">发送</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted, nextTick } from 'vue'
import { io, Socket } from 'socket.io-client'
import type {
  CallState,
  ChatMessage,
  OfferPayload,
  AnswerPayload,
  IceCandidatePayload,
  UserJoinedPayload,
  UserLeftPayload
} from '../types/webrtc'

// ==================== 响应式状态 ====================

const roomId = ref('room-001')           // 默认房间号
const localVideoRef = ref<HTMLVideoElement>()
const remoteVideoRef = ref<HTMLVideoElement>()
const chatMessagesRef = ref<HTMLDivElement>()
const chatInput = ref('')

const callState = ref<CallState>({
  isInRoom: false,
  isConnected: false,
  isCalling: false,
  remotePeerId: null
})

const messages = ref<ChatMessage[]>([])
const isAudioMuted = ref(false)
const isVideoMuted = ref(false)
const isScreenSharing = ref(false)

// 状态文本
const statusText = computed(() => {
  if (!callState.value.isInRoom) return '未连接'
  if (callState.value.isConnected) return '通话中'
  if (callState.value.isCalling) return '呼叫中...'
  return '等待对方加入'
})

// ==================== 核心对象（非响应式） ====================

let socket: Socket | null = null
let pc: RTCPeerConnection | null = null
let localStream: MediaStream | null = null
let dataChannel: RTCDataChannel | null = null

// ICE 服务器配置（使用公共 STUN 服务器）
const iceServers: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' }
]

// ==================== 房间管理 ====================

async function joinRoom(): Promise<void> {
  if (!roomId.value.trim()) {
    alert('请输入房间号')
    return
  }

  try {
    // 1. 获取本地媒体流（摄像头 + 麦克风）
    localStream = await navigator.mediaDevices.getUserMedia({
      video: { width: 1280, height: 720 },
      audio: true
    })

    // 2. 显示本地视频
    if (localVideoRef.value) {
      localVideoRef.value.srcObject = localStream
    }

    // 3. 连接信令服务器
    socket = io('http://localhost:3000', {
      transports: ['websocket', 'polling']
    })

    // 4. 设置 Socket.IO 事件监听
    setupSocketListeners()

    // 5. 等待连接成功后加入房间
    socket.on('connect', async () => {
      console.log('[Socket] 已连接到信令服务器')

      socket!.emit('join-room', { roomId: roomId.value }, (result) => {
        if (result.success) {
          callState.value.isInRoom = true
          console.log(`[房间] 加入成功，当前人数: ${result.peerCount}`)

          // 如果房间已有 1 人，则发起呼叫
          if (result.peerCount === 2) {
            // 等待 user-joined 事件来触发呼叫
          }
        } else {
          alert(`加入房间失败: ${result.error}`)
          cleanup()
        }
      })
    })
  } catch (err) {
    console.error('[错误] 加入房间失败:', err)
    alert('无法访问摄像头/麦克风，请检查权限设置')
    cleanup()
  }
}

function leaveRoom(): void {
  if (socket) {
    socket.emit('leave-room')
  }
  cleanup()
}

// ==================== Socket.IO 事件监听 ====================

function setupSocketListeners(): void {
  if (!socket) return

  // 有新用户加入房间
  socket.on('user-joined', async (data: UserJoinedPayload) => {
    console.log(`[信令] 新用户加入: ${data.socketId}`)
    callState.value.remotePeerId = data.socketId

    // 作为"先加入的一方"，创建并发送 Offer
    await createPeerConnection()
    await createAndSendOffer(data.socketId)
  })

  // 收到 Offer
  socket.on('offer', async (data: OfferPayload) => {
    console.log(`[信令] 收到来自 ${data.targetId} 的 offer`)
    callState.value.remotePeerId = data.targetId

    await createPeerConnection()
    await handleOffer(data)
  })

  // 收到 Answer
  socket.on('answer', async (data: AnswerPayload) => {
    console.log(`[信令] 收到来自 ${data.targetId} 的 answer`)
    await handleAnswer(data)
  })

  // 收到 ICE Candidate
  socket.on('ice-candidate', async (data: IceCandidatePayload) => {
    console.log(`[信令] 收到来自 ${data.targetId} 的 ICE candidate`)
    await handleIceCandidate(data)
  })

  // 用户离开
  socket.on('user-left', (data: UserLeftPayload) => {
    console.log(`[信令] 用户离开: ${data.socketId}`)
    handleRemoteDisconnect()
  })

  // 断开连接
  socket.on('disconnect', () => {
    console.log('[Socket] 与信令服务器断开连接')
  })
}

// ==================== RTCPeerConnection 管理 ====================

async function createPeerConnection(): Promise<void> {
  // 如果已存在，先关闭
  if (pc) {
    pc.close()
  }

  // 创建 RTCPeerConnection
  pc = new RTCPeerConnection({ iceServers })

  // ---- 添加本地媒体轨道到连接 ----
  if (localStream) {
    localStream.getTracks().forEach((track) => {
      pc!.addTrack(track, localStream!)
    })
  }

  // ---- 监听远端轨道 ----
  pc.ontrack = (event: RTCTrackEvent) => {
    console.log('[WebRTC] 收到远端轨道:', event.track.kind)
    if (remoteVideoRef.value && event.streams[0]) {
      remoteVideoRef.value.srcObject = event.streams[0]
    }
  }

  // ---- 监听 ICE 候选 ----
  pc.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
    if (event.candidate && socket && callState.value.remotePeerId) {
      console.log('[WebRTC] 收集到 ICE candidate')
      socket.emit('ice-candidate', {
        targetId: callState.value.remotePeerId,
        candidate: event.candidate.toJSON()
      })
    }
  }

  // ---- 监听连接状态变化 ----
  pc.onconnectionstatechange = () => {
    console.log('[WebRTC] 连接状态:', pc?.connectionState)
    if (pc?.connectionState === 'connected') {
      callState.value.isConnected = true
      callState.value.isCalling = false
    } else if (pc?.connectionState === 'disconnected' || pc?.connectionState === 'failed') {
      callState.value.isConnected = false
    }
  }

  // ---- 监听 ICE 连接状态 ----
  pc.oniceconnectionstatechange = () => {
    console.log('[WebRTC] ICE 连接状态:', pc?.iceConnectionState)
  }

  // ---- 创建数据通道（仅呼叫方创建）----
  // 注意：被呼叫方通过 ondatachannel 接收
}

// 创建并发送 Offer（呼叫方）
async function createAndSendOffer(targetId: string): Promise<void> {
  if (!pc) return

  callState.value.isCalling = true

  // 创建数据通道（用于文字聊天）
  dataChannel = pc.createDataChannel('chat', {
    ordered: true  // 保证消息顺序
  })
  setupDataChannel(dataChannel)

  // 创建 Offer
  const offer = await pc.createOffer()
  await pc.setLocalDescription(offer)

  console.log('[WebRTC] 发送 offer')
  socket?.emit('offer', { targetId, sdp: offer })
}

// 处理收到的 Offer（被呼叫方）
async function handleOffer(data: OfferPayload): Promise<void> {
  if (!pc) return

  // 设置远端描述
  await pc.setRemoteDescription(new RTCSessionDescription(data.sdp))

  // 监听数据通道（被呼叫方通过此方式获取）
  pc.ondatachannel = (event: RTCDataChannelEvent) => {
    console.log('[WebRTC] 收到数据通道')
    dataChannel = event.channel
    setupDataChannel(dataChannel)
  }

  // 创建 Answer
  const answer = await pc.createAnswer()
  await pc.setLocalDescription(answer)

  console.log('[WebRTC] 发送 answer')
  socket?.emit('answer', { targetId: data.targetId, sdp: answer })
}

// 处理收到的 Answer（呼叫方）
async function handleAnswer(data: AnswerPayload): Promise<void> {
  if (!pc) return

  await pc.setRemoteDescription(new RTCSessionDescription(data.sdp))
  console.log('[WebRTC] 已设置远端描述 (answer)')
}

// 处理 ICE Candidate
async function handleIceCandidate(data: IceCandidatePayload): Promise<void> {
  if (!pc) return

  try {
    await pc.addIceCandidate(new RTCIceCandidate(data.candidate))
    console.log('[WebRTC] 已添加 ICE candidate')
  } catch (err) {
    console.error('[WebRTC] 添加 ICE candidate 失败:', err)
  }
}

// 处理远端断开
function handleRemoteDisconnect(): void {
  callState.value.isConnected = false
  callState.value.remotePeerId = null

  // 清空远端视频
  if (remoteVideoRef.value) {
    remoteVideoRef.value.srcObject = null
  }

  // 关闭旧的 PeerConnection
  if (pc) {
    pc.close()
    pc = null
  }
}

// ==================== 数据通道（文字聊天） ====================

function setupDataChannel(channel: RTCDataChannel): void {
  channel.onopen = () => {
    console.log('[DataChannel] 通道已打开')
    addSystemMessage('数据通道已连接，可以开始聊天')
  }

  channel.onclose = () => {
    console.log('[DataChannel] 通道已关闭')
  }

  channel.onmessage = (event: MessageEvent) => {
    console.log('[DataChannel] 收到消息:', event.data)
    messages.value.push({
      id: Date.now().toString(),
      sender: 'remote',
      text: event.data,
      timestamp: Date.now()
    })
    scrollToBottom()
  }

  channel.onerror = (err) => {
    console.error('[DataChannel] 错误:', err)
  }
}

function sendMessage(): void {
  const text = chatInput.value.trim()
  if (!text || !dataChannel || dataChannel.readyState !== 'open') return

  // 通过数据通道发送
  dataChannel.send(text)

  // 添加到本地消息列表
  messages.value.push({
    id: Date.now().toString(),
    sender: 'local',
    text,
    timestamp: Date.now()
  })

  chatInput.value = ''
  scrollToBottom()
}

function addSystemMessage(text: string): void {
  messages.value.push({
    id: Date.now().toString(),
    sender: 'local',
    text: `[系统] ${text}`,
    timestamp: Date.now()
  })
  scrollToBottom()
}

function scrollToBottom(): void {
  nextTick(() => {
    if (chatMessagesRef.value) {
      chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight
    }
  })
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// ==================== 媒体控制 ====================

function toggleAudio(): void {
  if (!localStream) return

  const audioTrack = localStream.getAudioTracks()[0]
  if (audioTrack) {
    audioTrack.enabled = !audioTrack.enabled
    isAudioMuted.value = !audioTrack.enabled
  }
}

function toggleVideo(): void {
  if (!localStream) return

  const videoTrack = localStream.getVideoTracks()[0]
  if (videoTrack) {
    videoTrack.enabled = !videoTrack.enabled
    isVideoMuted.value = !videoTrack.enabled
  }
}

// ==================== 屏幕共享 ====================

async function toggleScreenShare(): Promise<void> {
  if (isScreenSharing.value) {
    // 停止屏幕共享，切回摄像头
    await stopScreenShare()
  } else {
    // 开始屏幕共享
    await startScreenShare()
  }
}

async function startScreenShare(): Promise<void> {
  try {
    // 获取屏幕共享流
    const screenStream = await navigator.mediaDevices.getDisplayMedia({
      video: { cursor: 'always' as const },
      audio: false
    })

    // 替换视频轨道
    const screenVideoTrack = screenStream.getVideoTracks()[0]
    const sender = pc?.getSenders().find(s =>
      s.track?.kind === 'video'
    )

    if (sender && screenVideoTrack) {
      await sender.replaceTrack(screenVideoTrack)
    }

    // 更新本地视频显示
    if (localVideoRef.value) {
      localVideoRef.value.srcObject = screenStream
    }

    // 监听用户点击"停止共享"按钮
    screenVideoTrack.onended = () => {
      stopScreenShare()
    }

    isScreenSharing.value = true
    console.log('[屏幕共享] 已开始')
  } catch (err) {
    console.error('[屏幕共享] 启动失败:', err)
    alert('无法启动屏幕共享')
  }
}

async function stopScreenShare(): Promise<void> {
  try {
    // 重新获取摄像头流
    const cameraStream = await navigator.mediaDevices.getUserMedia({
      video: { width: 1280, height: 720 },
      audio: true
    })

    const cameraVideoTrack = cameraStream.getVideoTracks()[0]
    const sender = pc?.getSenders().find(s =>
      s.track?.kind === 'video'
    )

    if (sender && cameraVideoTrack) {
      await sender.replaceTrack(cameraVideoTrack)
    }

    // 更新本地视频显示
    if (localVideoRef.value) {
      localVideoRef.value.srcObject = cameraStream
    }

    // 更新引用
    localStream = cameraStream
    isScreenSharing.value = false
    console.log('[屏幕共享] 已停止')
  } catch (err) {
    console.error('[屏幕共享] 停止失败:', err)
  }
}

// ==================== 清理 ====================

function cleanup(): void {
  // 关闭数据通道
  if (dataChannel) {
    dataChannel.close()
    dataChannel = null
  }

  // 关闭 PeerConnection
  if (pc) {
    pc.close()
    pc = null
  }

  // 停止所有媒体轨道
  if (localStream) {
    localStream.getTracks().forEach(track => track.stop())
    localStream = null
  }

  // 断开 Socket
  if (socket) {
    socket.disconnect()
    socket = null
  }

  // 清空视频元素
  if (localVideoRef.value) {
    localVideoRef.value.srcObject = null
  }
  if (remoteVideoRef.value) {
    remoteVideoRef.value.srcObject = null
  }

  // 重置状态
  callState.value = {
    isInRoom: false,
    isConnected: false,
    isCalling: false,
    remotePeerId: null
  }
  messages.value = []
  isAudioMuted.value = false
  isVideoMuted.value = false
  isScreenSharing.value = false
}

// 组件卸载时清理
onUnmounted(() => {
  cleanup()
})
</script>

<style scoped>
.video-call {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #1a1a2e;
  color: #fff;
  border-radius: 8px;
  margin-bottom: 16px;
}

.status {
  font-weight: 500;
}

.peer-id {
  font-size: 12px;
  color: #aaa;
}

.video-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.video-wrapper {
  position: relative;
  background: #000;
  border-radius: 12px;
  overflow: hidden;
  aspect-ratio: 16 / 9;
}

.video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-label {
  position: absolute;
  bottom: 8px;
  left: 8px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.video-label.waiting {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.7);
  font-size: 14px;
}

.controls {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.room-input {
  padding: 10px 14px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  min-width: 200px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  background: #e0e0e0;
  color: #333;
}

.btn:hover {
  opacity: 0.9;
}

.btn-primary {
  background: #4a90d9;
  color: #fff;
}

.btn-danger {
  background: #e74c3c;
  color: #fff;
}

.btn-screen {
  background: #27ae60;
  color: #fff;
}

.btn-muted {
  background: #e74c3c;
  color: #fff;
}

.chat-section {
  border: 1px solid #ddd;
  border-radius: 12px;
  overflow: hidden;
}

.chat-messages {
  height: 200px;
  overflow-y: auto;
  padding: 12px;
  background: #f8f9fa;
}

.message {
  display: flex;
  flex-direction: column;
  margin-bottom: 8px;
  max-width: 70%;
}

.message.local {
  align-items: flex-end;
  margin-left: auto;
}

.message.remote {
  align-items: flex-start;
}

.msg-text {
  padding: 8px 12px;
  border-radius: 12px;
  font-size: 14px;
  word-break: break-word;
}

.message.local .msg-text {
  background: #4a90d9;
  color: #fff;
  border-bottom-right-radius: 4px;
}

.message.remote .msg-text {
  background: #e0e0e0;
  color: #333;
  border-bottom-left-radius: 4px;
}

.msg-time {
  font-size: 11px;
  color: #999;
  margin-top: 2px;
}

.chat-input-area {
  display: flex;
  gap: 8px;
  padding: 12px;
  border-top: 1px solid #ddd;
  background: #fff;
}

.chat-input {
  flex: 1;
  padding: 10px 14px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
}

@media (max-width: 768px) {
  .video-container {
    grid-template-columns: 1fr;
  }

  .controls {
    justify-content: center;
  }
}
</style>
```

### 3.3 App.vue

`client/src/App.vue`

```vue
<template>
  <div class="app">
    <header>
      <h1>WebRTC 视频通话</h1>
      <p>基于 Vue3 + Socket.IO 的 1v1 视频通话 Demo</p>
    </header>
    <main>
      <VideoCall />
    </main>
  </div>
</template>

<script setup lang="ts">
import VideoCall from './components/VideoCall.vue'
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background: #f0f2f5;
}

.app {
  min-height: 100vh;
}

header {
  text-align: center;
  padding: 24px;
  background: #fff;
  border-bottom: 1px solid #e0e0e0;
}

header h1 {
  font-size: 24px;
  color: #1a1a2e;
  margin-bottom: 4px;
}

header p {
  font-size: 14px;
  color: #666;
}

main {
  padding: 20px;
}
</style>
```

---

## 4. 运行与测试

### 4.1 启动步骤

```bash
# 1. 启动后端信令服务器（终端 1）
cd server
npm install
npm run dev
# 输出: [启动] 信令服务器运行在 http://localhost:3000

# 2. 启动前端开发服务器（终端 2）
cd client
npm install
npm run dev
# 输出: VITE v6.x  ready in xxx ms
#       Local:   http://localhost:5173/
```

### 4.2 测试方式

**方式一：同一台电脑两个浏览器标签**

1. 打开浏览器访问 `http://localhost:5173`
2. 在第一个标签页输入房间号（如 `room-test`），点击"加入房间"
3. 在第二个标签页（可以是隐身模式窗口）访问同样地址，输入相同房间号，点击"加入房间"
4. 等待几秒后，两个页面应建立视频连接，互相看到对方的视频

**方式二：两台设备（同一局域网）**

1. 确保两台设备在同一 WiFi 下
2. 修改前端连接地址为电脑的内网 IP：
   ```typescript
   // VideoCall.vue 中修改 Socket.IO 连接地址
   socket = io('http://192.168.x.x:3000', { ... })
   ```
3. 启动前端时指定 host：
   ```bash
   npm run dev -- --host
   ```
4. 另一台设备访问 `http://你的电脑IP:5173`

### 4.3 浏览器权限说明

首次访问时，浏览器会弹出权限请求：

- **摄像头权限**：允许浏览器访问摄像头
- **麦克风权限**：允许浏览器访问麦克风
- **屏幕共享权限**：仅在点击"屏幕共享"时弹出

**注意**：
- Chrome/Edge 允许在 `http://localhost` 下使用摄像头
- 非 localhost 环境必须使用 **HTTPS** 才能访问媒体设备
- 生产环境请配置 HTTPS 证书

---

## 5. 进阶：屏幕共享

### 5.1 getDisplayMedia 使用

屏幕共享通过 `navigator.mediaDevices.getDisplayMedia()` 实现：

```typescript
// 获取屏幕共享流
const screenStream = await navigator.mediaDevices.getDisplayMedia({
  video: {
    cursor: 'always',        // 显示鼠标光标
    displaySurface: 'monitor' // 共享整个屏幕
  },
  audio: false               // 通常不共享系统音频（兼容性差）
})
```

### 5.2 轨道替换（Track Replacement）

屏幕共享的核心是**替换视频轨道**，而不是重新建立连接：

```typescript
// 获取当前发送视频轨道的 RTCRtpSender
const sender = pc.getSenders().find(s => s.track?.kind === 'video')

// 将摄像头轨道替换为屏幕共享轨道
await sender.replaceTrack(screenVideoTrack)
```

### 5.3 切换回摄像头

```typescript
// 重新获取摄像头流
const cameraStream = await navigator.mediaDevices.getUserMedia({
  video: true, audio: true
})

// 替换回摄像头轨道
const cameraVideoTrack = cameraStream.getVideoTracks()[0]
await sender.replaceTrack(cameraVideoTrack)
```

### 5.4 完整切换逻辑

已在 `VideoCall.vue` 的 `startScreenShare()` 和 `stopScreenShare()` 函数中实现。

**关键点**：
- 使用 `RTCRtpSender.replaceTrack()` 实现无缝切换
- 监听屏幕共享轨道的 `onended` 事件，用户点击"停止共享"时自动切回摄像头
- 本地视频显示也需要同步更新 `srcObject`

---

## 6. 进阶：数据通道

### 6.1 RTCDataChannel 实现文字聊天

数据通道（DataChannel）允许在 PeerConnection 建立后直接传输任意数据，无需经过服务器。

**呼叫方创建数据通道**：

```typescript
// 在 createOffer 之前创建
const dataChannel = pc.createDataChannel('chat', {
  ordered: true,        // 保证消息按顺序到达
  maxRetransmits: 3     // 最大重传次数
})
```

**被呼叫方通过事件接收**：

```typescript
pc.ondatachannel = (event) => {
  const receivedChannel = event.channel
  // 设置消息监听
  receivedChannel.onmessage = (e) => {
    console.log('收到消息:', e.data)
  }
}
```

### 6.2 数据通道事件

```typescript
dataChannel.onopen = () => {
  console.log('通道已打开，可以发送消息')
}

dataChannel.onclose = () => {
  console.log('通道已关闭')
}

dataChannel.onmessage = (event) => {
  console.log('收到消息:', event.data)
}

dataChannel.onerror = (err) => {
  console.error('通道错误:', err)
}

// 发送消息
dataChannel.send('Hello, WebRTC!')
```

### 6.3 与 Socket.IO 对比

| 特性 | RTCDataChannel | Socket.IO |
|------|---------------|-----------|
| 传输路径 | P2P 直连 | 经过服务器中转 |
| 延迟 | 极低 | 较高（取决于服务器） |
| 带宽 | 不限（P2P） | 占用服务器带宽 |
| 可靠性 | 可配置（有序/无序） | 可靠 |
| 适用场景 | 文件传输、实时游戏、聊天 | 信令、房间管理、离线消息 |

### 6.4 已实现的功能

在 `VideoCall.vue` 中已实现：
- 呼叫方在创建 Offer 时同时创建数据通道
- 被呼叫方通过 `ondatachannel` 接收通道
- 双方通过数据通道发送/接收文字消息
- 消息列表 UI 区分本地和远端消息

---

## 7. 常见问题与调试

### 7.1 使用 chrome://webrtc-internals 调试

Chrome 浏览器内置了 WebRTC 调试工具：

1. 在地址栏输入 `chrome://webrtc-internals`
2. 打开后可以看到所有活跃的 RTCPeerConnection
3. 关键查看项：
   - **RTCPeerConnection 状态**：`signalingState`、`connectionState`、`iceConnectionState`
   - **ICE 候选**：查看收集到的候选地址类型（host/srflx/relay）
   - **SDP 信息**：查看 Offer/Answer 的完整内容
   - **统计数据**：带宽、帧率、丢包率等

### 7.2 常见错误排查

#### 问题 1：ICE 连接失败（ICE failed）

**现象**：双方无法建立连接，视频不显示

**原因**：
- 双方处于不同网络，无法直接 P2P 穿透
- STUN 服务器不可用
- 防火墙阻止了 UDP 端口

**解决**：
```typescript
// 添加 TURN 服务器（需要自行部署或使用付费服务）
const iceServers: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  {
    urls: 'turn:your-turn-server.com:3478',
    username: 'user',
    credential: 'pass'
  }
]
```

#### 问题 2：权限拒绝（Permission denied）

**现象**：无法获取摄像头/麦克风

**解决**：
- 检查浏览器地址栏是否有摄像头图标，点击允许
- 确保使用 `https://` 或 `http://localhost`
- 检查系统隐私设置中是否允许浏览器访问摄像头

#### 问题 3：HTTPS 要求

**现象**：非 localhost 下 `getUserMedia` 报错

**解决**：
- 开发环境使用 `npm run dev -- --host` 并访问 `localhost`
- 生产环境必须配置 HTTPS 证书
- 使用自签名证书进行本地测试：
  ```bash
  # vite.config.ts
  export default defineConfig({
    server: {
      https: {
        key: fs.readFileSync('./key.pem'),
        cert: fs.readFileSync('./cert.pem')
      }
    }
  })
  ```

#### 问题 4：一方能看到对方，对方看不到自己

**原因**：
- 媒体流添加时机不对
- 或者 `ontrack` 事件未正确触发

**排查**：
```typescript
// 确认在 createOffer 前已添加轨道
localStream.getTracks().forEach(track => {
  pc.addTrack(track, localStream)
})

// 确认 ontrack 监听已设置
pc.ontrack = (event) => {
  console.log('收到轨道', event.track.kind)
  remoteVideo.srcObject = event.streams[0]
}
```

#### 问题 5：Socket.IO 连接失败

**排查步骤**：
1. 检查后端是否运行在 `http://localhost:3000`
2. 检查 CORS 配置是否包含前端地址
3. 检查防火墙是否阻止 3000 端口
4. 查看浏览器控制台网络请求

### 7.3 调试技巧

```typescript
// 打印所有状态变化
pc.onconnectionstatechange = () => {
  console.log('connectionState:', pc.connectionState)
}

pc.onsignalingstatechange = () => {
  console.log('signalingState:', pc.signalingState)
}

pc.oniceconnectionstatechange = () => {
  console.log('iceConnectionState:', pc.iceConnectionState)
}

pc.onicegatheringstatechange = () => {
  console.log('iceGatheringState:', pc.iceGatheringState)
}
```

### 7.4 生产环境注意事项

1. **TURN 服务器**：部署自己的 TURN 服务器（如 coturn），处理无法 P2P 穿透的情况
2. **HTTPS**：必须配置 SSL 证书
3. **信令服务器高可用**：使用 Redis Adapter 实现 Socket.IO 多实例
4. **错误处理**：添加完善的错误处理和用户提示
5. **移动端适配**：处理移动端前后台切换、来电中断等情况
