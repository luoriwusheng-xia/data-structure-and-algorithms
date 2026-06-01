# WebRTC 面试题大全

> 目标读者：高级前端工程师 / 面试官
> 适用场景：社招/高级前端/音视频方向面试

---

## 一、基础概念题

---

### Q1：WebRTC 是什么？它解决了什么问题？

**难度：** ⭐⭐

**参考答案：**

WebRTC（Web Real-Time Communication）是一个支持浏览器和原生应用进行实时音视频通信的开源项目，由 Google 主导开发，现已成为 W3C 标准。

**解决的核心问题：**

1. **浏览器原生实时通信**：无需安装插件（如 Flash），浏览器直接支持音视频采集、编解码、网络传输
2. **P2P 直连**：在可能的情况下实现端对端直连，降低服务器带宽成本
3. **低延迟**：相比传统的 HTTP/RTMP 拉流，WebRTC 延迟可控制在 200ms 以内
4. **标准化**：统一的 API 接口，跨浏览器兼容

**典型应用场景：**
- 视频会议（Zoom、腾讯会议网页版）
- 在线直播连麦
- 远程协作/屏幕共享
- 在线教育小班课
- 远程医疗
- 云游戏

---

### Q2：WebRTC 的三大核心 API 是什么？各自的作用？

**难度：** ⭐⭐

**参考答案：**

| API | 作用 | 核心方法 |
|-----|------|---------|
| `getUserMedia` | 获取本地音视频媒体流 | `navigator.mediaDevices.getUserMedia(constraints)` |
| `RTCPeerConnection` | 建立 P2P 连接，管理编解码和网络传输 | `createOffer()`, `createAnswer()`, `setLocalDescription()`, `setRemoteDescription()`, `addIceCandidate()` |
| `RTCDataChannel` | 在 P2P 连接上传输任意数据（类似 WebSocket 但走 P2P） | `createDataChannel()`, `send()`, `onmessage` |

**补充说明：**
- `getUserMedia` 需要 HTTPS 环境（localhost 除外）
- `RTCPeerConnection` 是 WebRTC 最复杂的 API，封装了 ICE、DTLS、SRTP 等协议
- `RTCDataChannel` 支持可靠/不可靠传输模式，可用于游戏状态同步、文件传输等

---

### Q3：什么是 SDP？Offer/Answer 模型如何工作？

**难度：** ⭐⭐⭐

**参考答案：**

**SDP（Session Description Protocol）** 是一种文本格式的会话描述协议，用于描述媒体会话的能力，包括：
- 音视频编解码器（VP8/VP9/H.264、Opus/G.711）
- 传输协议（UDP/TCP）
- IP 地址和端口
- 带宽限制
- SSRC（同步源标识）

**Offer/Answer 模型：**

```
发起方（Caller）          接收方（Callee）
    |                           |
    |---- createOffer() -------->|
    |    生成 SDP Offer          |
    |                           |
    |---- SDP Offer ------------>|
    |    通过信令服务器发送       |
    |                           |
    |                           |-- createAnswer()
    |                           |   生成 SDP Answer
    |                           |
    |<--- SDP Answer -----------|
    |    通过信令服务器返回       |
    |                           |
    |---- ICE Candidate ------->|
    |<--- ICE Candidate --------|
    |    交换网络候选地址         |\n```

**关键要点：**
- Offer 和 Answer 都是 SDP，只是角色不同
- 双方交换 SDP 后才能知道对方支持的编解码器和网络地址
- SDP 交换必须通过信令服务器完成（WebRTC 不规定信令协议，常用 WebSocket/Socket.io）

---

### Q4：ICE、STUN、TURN 的区别是什么？

**难度：** ⭐⭐⭐

**参考答案：**

| 技术 | 全称 | 作用 | 工作层级 |
|------|------|------|---------|
| **ICE** | Interactive Connectivity Establishment | 框架，综合使用 STUN/TURN 寻找最佳连接路径 | 框架 |
| **STUN** | Session Traversal Utilities for NAT | 获取公网 IP 和端口，用于 NAT 穿透 | 辅助协议 |
| **TURN** | Traversal Using Relays around NAT | 中继转发，当 P2P 失败时通过服务器转发媒体 | 中继协议 |

**关系图：**

```
ICE（框架）
  ├── STUN：尝试获取公网地址，实现 P2P
  │      └── 成功 → 直连
  │      └── 失败 → 尝试 TURN
  └── TURN：通过中继服务器转发
         └── 成功 → 中继传输（有服务器带宽成本）
         └── 失败 → 连接失败
```

**STUN 工作原理：**
1. 客户端向 STUN 服务器发送请求
2. STUN 服务器返回客户端的公网 IP:Port
3. 客户端将公网地址作为候选地址告知对方
4. 双方尝试用公网地址直连

**TURN 工作原理：**
1. 客户端与 TURN 服务器建立连接
2. TURN 服务器分配一个中继地址
3. 所有媒体数据通过 TURN 服务器转发
4. 产生服务器带宽成本，延迟增加

---

### Q5：为什么 WebRTC 需要信令服务器？

**难度：** ⭐⭐⭐

**参考答案：**

WebRTC 设计为**无状态**的，本身不提供信令传输机制，原因如下：

1. **SDP 交换**：双方需要交换 SDP Offer/Answer 来协商媒体参数
2. **ICE Candidate 交换**：双方需要交换网络候选地址
3. **无集中式发现机制**：WebRTC 不知道"对方是谁"、"对方在哪里"

**信令服务器必须实现的功能：**
- 用户注册/在线状态管理
- 房间管理（谁在和谁通话）
- 转发 SDP Offer/Answer
- 转发 ICE Candidate

**信令协议选择：**
- **WebSocket**：最常用，全双工、低延迟
- **Socket.io**：自动降级、房间管理方便
- **HTTP Long Polling**：兼容性最好
- **SIP over WebSocket**：与传统电话系统互通

**代码示例（WebSocket 信令）：**

```javascript
// 信令服务器（Node.js + ws）
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

const rooms = new Map();

wss.on('connection', (ws) => {
  ws.on('message', (data) => {
    const msg = JSON.parse(data);
    
    switch (msg.type) {
      case 'join':
        // 加入房间
        if (!rooms.has(msg.roomId)) {
          rooms.set(msg.roomId, new Set());
        }
        rooms.get(msg.roomId).add(ws);
        break;
        
      case 'offer':
      case 'answer':
      case 'ice-candidate':
        // 转发给房间内其他用户
        const room = rooms.get(msg.roomId);
        room.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(msg));
          }
        });
        break;
    }
  });
});
```

---

### Q6：WebRTC 支持哪些音视频编解码器？如何选择？

**难度：** ⭐⭐⭐

**参考答案：**

**视频编解码器：**

| 编解码器 | 浏览器支持 | 特点 | 适用场景 |
|---------|-----------|------|---------|
| **VP8** | 所有主流浏览器 | 免专利费、成熟 | 通用视频会议 |
| **VP9** | Chrome/Firefox | 比 VP8 省 30-50% 带宽 | 高分辨率、带宽受限 |
| **H.264** | Safari 必选，其他可选 | 硬件加速好 | 移动端、与原生互通 |
| **AV1** | Chrome 最新版 | 最新、最高压缩率 | 未来趋势 |

**音频编解码器：**

| 编解码器 | 特点 |
|---------|------|
| **Opus** | 主流选择，支持 6kbps-510kbps，自适应 |
| **G.711** | 兼容性最好，固定 64kbps |

**SDP 中查看/设置编解码器优先级：**

```javascript
// 查看本地 SDP 中的编解码器
const offer = await pc.createOffer();
console.log(offer.sdp);

// 手动设置编解码器优先级（通过 SDP 修改）
// 将 VP9 放在最前面
const sdp = offer.sdp.replace(
  /(m=video.*\r\n)(.*)/,
  (match, mline, rest) => {
    // 重新排序 payload type
    return mline + rest;
  }
);
```

---

### Q7：WebRTC 中的 Track 和 Stream 有什么区别？

**难度：** ⭐⭐

**参考答案：**

| 概念 | 说明 | 关系 |
|------|------|------|
| **MediaStream** | 媒体流容器，包含多个 Track | 一个 Stream 可包含音频+视频 Track |
| **MediaStreamTrack** | 单个媒体轨道（音频或视频） | 是 Stream 的组成部分 |

```javascript
// 获取媒体流
const stream = await navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
});

// stream 包含两个 track
stream.getTracks().forEach(track => {
  console.log(track.kind); // 'video' 或 'audio'
});

// 将 track 添加到 RTCPeerConnection
stream.getTracks().forEach(track => {
  pc.addTrack(track, stream);
});

// 也可以单独添加 track
const videoTrack = stream.getVideoTracks()[0];
pc.addTrack(videoTrack, stream);
```

**关键区别：**
- `addTrack()` 添加的是 Track，但会关联一个 Stream
- 接收端通过 `ontrack` 事件获取的是 Track，可以知道它属于哪个 Stream
- 屏幕共享和摄像头可以同时推流，就是添加多个 Video Track

---

### Q8：WebRTC 的媒体协商过程是怎样的？

**难度：** ⭐⭐⭐

**参考答案：**

```
步骤 1: 获取本地媒体
  getUserMedia() → MediaStream

步骤 2: 将 Track 添加到 RTCPeerConnection
  pc.addTrack(track, stream)

步骤 3: 创建 Offer（发起方）
  pc.createOffer() → RTCSessionDescription (SDP Offer)
  pc.setLocalDescription(offer)

步骤 4: 通过信令发送 Offer
  signaling.send({ type: 'offer', sdp: offer.sdp })

步骤 5: 接收方设置远端描述
  pc.setRemoteDescription(offer)
  pc.createAnswer() → RTCSessionDescription (SDP Answer)
  pc.setLocalDescription(answer)

步骤 6: 通过信令发送 Answer
  signaling.send({ type: 'answer', sdp: answer.sdp })

步骤 7: 发起方设置远端描述
  pc.setRemoteDescription(answer)

步骤 8: ICE Candidate 交换（与 SDP 交换并行进行）
  pc.onicecandidate = (e) => {
    if (e.candidate) {
      signaling.send({ type: 'ice-candidate', candidate: e.candidate });
    }
  }

步骤 9: 连接建立
  pc.onconnectionstatechange = (e) => {
    if (pc.connectionState === 'connected') {
      // 可以开始通话了
    }
  }
```

---

## 二、原理深入题

---

### Q1：WebRTC 建立连接的完整流程是什么？从获取媒体到连通。

**难度：** ⭐⭐⭐⭐

**参考答案：**

```
┌─────────────────────────────────────────────────────────────────┐
│                        完整连接流程                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. 媒体采集                                                      │
│     getUserMedia({video:true, audio:true})                       │
│     → 请求用户授权 → 获取 MediaStream                             │
│                                                                 │
│  2. Track 添加到 PeerConnection                                   │
│     pc.addTrack(videoTrack, stream)                              │
│     pc.addTrack(audioTrack, stream)                              │
│     → 触发 negotiationneeded 事件                                 │
│                                                                 │
│  3. 创建 SDP Offer                                                │
│     pc.createOffer()                                             │
│     → 生成本地 SDP（包含媒体能力、编解码器列表）                     │
│     pc.setLocalDescription(offer)                                │
│     → 开始收集 ICE Candidate                                     │
│                                                                 │
│  4. ICE 收集（与步骤 3 并行）                                     │
│     - 收集 host candidate（本地 IP）                              │
│     - 向 STUN 服务器查询 srflx candidate（公网 IP）                │
│     - 向 TURN 服务器申请 relay candidate（中继地址）               │
│     → 每收集到一个 candidate，触发 onicecandidate                  │
│                                                                 │
│  5. 信令交换 SDP Offer                                            │
│     → 通过信令服务器发送给对端                                     │
│                                                                 │
│  6. 对端处理 Offer                                                │
│     pc.setRemoteDescription(offer)                               │
│     pc.createAnswer()                                            │
│     pc.setLocalDescription(answer)                               │
│     → 同样开始收集 ICE Candidate                                 │
│                                                                 │
│  7. 信令交换 SDP Answer                                           │
│     → 通过信令服务器返回给发起方                                   │
│                                                                 │
│  8. 发起方设置 Answer                                             │
│     pc.setRemoteDescription(answer)                              │
│                                                                 │
│  9. ICE Candidate 交换（Trickle ICE）                             │
│     双方通过信令交换 candidate                                    │
│     pc.addIceCandidate(candidate)                                │
│                                                                 │
│  10. ICE 连通性检测（ICE Connectivity Check）                      │
│     双方用收集到的 candidate 进行配对（candidate pair）            │
│     发送 STUN Binding Request 测试连通性                          │
│     → 找到最佳路径（优先级：host > srflx > relay）                 │
│                                                                 │
│  11. DTLS 握手                                                    │
│     基于 UDP 的 TLS 握手，协商加密密钥                              │
│     → 用于后续 SRTP 密钥导出                                       │
│                                                                 │
│  12. SRTP 密钥导出 + 媒体传输                                      │
│     从 DTLS 导出 SRTP 密钥                                        │
│     → 开始加密传输音视频数据                                       │
│                                                                 │
│  13. 连接状态变更                                                  │
│     iceConnectionState: checking → connected → completed         │
│     connectionState: connecting → connected                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**关键时间点：**
- 从 `setLocalDescription` 到 `connected` 通常需要 1-3 秒
- STUN 穿透成功：~500ms
- TURN 中继：~1-2 秒
- 如果所有路径都失败，会超时（约 10-30 秒）

---

### Q2：NAT 穿透原理是什么？什么情况下需要 TURN？

**难度：** ⭐⭐⭐⭐

**参考答案：**

**NAT 类型（从穿透难度排序）：**

| NAT 类型 | 特点 | P2P 可行性 |
|---------|------|-----------|
| **公网 IP** | 无 NAT | 直接连接 |
| **全锥型（Full Cone）** | 内网 A 映射到公网 A' 后，任何外部主机都能访问 A' | 容易穿透 |
| **地址限制锥型（Address-Restricted）** | 只有特定外部 IP 能访问 | 可以穿透 |
| **端口限制锥型（Port-Restricted）** | 只有特定外部 IP:Port 能访问 | 可以穿透 |
| **对称型（Symmetric）** | 每个目的地址分配不同的映射 | **难以穿透，通常需要 TURN** |

**STUN 穿透原理（以全锥型为例）：**

```
Client A (内网 192.168.1.2:5000)          STUN Server (公网 1.2.3.4:3478)
       |                                               |
       |---- 1. 请求我的公网地址是什么？---------------->|
       |                                               |
       |<--- 2. 你的公网地址是 5.6.7.8:10000 ----------|
       |    (NAT 建立了映射: 192.168.1.2:5000 ↔ 5.6.7.8:10000)
       |                                               |
       |                                               |
Client B (内网 10.0.0.2:6000)
       |
       |---- 同样获取到公网地址 9.10.11.12:20000 ------|
       |
       |（通过信令服务器交换公网地址）
       |
       |---- 3. A 直接发送数据到 9.10.11.12:20000 ----> Client B
       |<--- 4. B 直接发送数据到 5.6.7.8:10000 --------
```

**对称型 NAT 为什么难以穿透？**

```
Client A 访问 STUN Server (1.2.3.4:3478)
  → NAT 分配映射: 192.168.1.2:5000 ↔ 5.6.7.8:10000

Client A 访问 Client B 的公网地址 (9.10.11.12:20000)
  → NAT 分配**新的**映射: 192.168.1.2:5000 ↔ 5.6.7.8:10001

问题：
- STUN 告诉 B 的地址是 5.6.7.8:10000
- 但 A 发给 B 时用的是 5.6.7.8:10001
- B 回包到 5.6.7.8:10000，NAT 不认识，丢弃！
```

**需要 TURN 的典型场景：**
1. 双方都是对称型 NAT
2. 企业防火墙阻止 UDP（只允许 80/443 端口）
3. 严格的防火墙规则（如只允许出站连接）
4. 某些移动网络运营商的 NAT

---

### Q3：DTLS 和 SRTP 的作用是什么？

**难度：** ⭐⭐⭐⭐

**参考答案：**

**DTLS（Datagram TLS）：**
- 基于 UDP 的 TLS 协议
- 作用：为 WebRTC 提供**密钥协商**和**身份验证**
- 在 ICE 连通后、媒体传输前进行握手
- 握手成功后，从 DTLS 导出 SRTP 的加密密钥

**SRTP（Secure RTP）：**
- 对 RTP（实时传输协议）的加密扩展
- 作用：**加密音视频媒体数据**
- 使用从 DTLS 导出的密钥进行 AES 加密
- 保证媒体数据的机密性和完整性

**关系图：**

```
┌─────────────────────────────────────────────┐
│           WebRTC 安全传输栈                   │
├─────────────────────────────────────────────┤
│  应用层: 音视频帧 (VP8/Opus 编码后)           │
├─────────────────────────────────────────────┤
│  SRTP: 加密/解密媒体数据                      │
│        (密钥来自 DTLS)                        │
├─────────────────────────────────────────────┤
│  RTP/RTCP: 实时传输 + 质量控制                │
├─────────────────────────────────────────────┤
│  UDP: 底层传输                                │
├─────────────────────────────────────────────┤
│  DTLS: 在 UDP 上完成 TLS 握手                 │
│        (交换证书、协商密钥)                    │
└─────────────────────────────────────────────┘
```

**为什么不用 TLS 直接加密媒体？**
- TLS 基于 TCP，重传机制会引入不可接受的延迟
- 音视频数据可以容忍少量丢包，但不能容忍延迟
- UDP + SRTP 是专为实时媒体设计的方案

---

### Q4：ICE Candidate 有哪些类型？优先级如何？

**难度：** ⭐⭐⭐

**参考答案：**

| 类型 | 全称 | 来源 | 优先级 | 说明 |
|------|------|------|--------|------|
| **host** | Host Candidate | 本地网络接口 | 最高 | 同一局域网内可直接使用 |
| **srflx** | Server Reflexive | STUN 服务器返回 | 中 | 公网地址，经过 NAT |
| **prflx** | Peer Reflexive | 对端发现 | 中 | 对端通过连通性检测发现的新地址 |
| **relay** | Relay | TURN 服务器分配 | 最低 | 中继地址，经服务器转发 |

**优先级计算（RFC 5245）：**

```
priority = (2^24) * type_preference + (2^8) * local_preference + (2^0) * component_id

type_preference:
  host:     126
  prflx:    110
  srflx:    100
  relay:    0
```

**代码中获取 candidate 类型：**

```javascript
pc.onicecandidate = (event) => {
  if (event.candidate) {
    const candidate = event.candidate;
    console.log('candidate type:', candidate.type); // host | srflx | relay | prflx
    console.log('protocol:', candidate.protocol);   // udp | tcp
    console.log('address:', candidate.address);
    console.log('port:', candidate.port);
    
    // 发送到对端
    signaling.send({
      type: 'ice-candidate',
      candidate: candidate
    });
  }
};
```

---

### Q5：RTCPeerConnection 的状态机有哪些？各状态含义？

**难度：** ⭐⭐⭐⭐

**参考答案：**

**1. signalingState（信令状态）- 描述 SDP 协商状态：**

```
stable ──createOffer()──> have-local-offer ──setRemoteDescription(answer)──> stable
    ^                                                                              |
    |                                                                              |
    └────────setRemoteDescription(answer)──────────────────────────────────────────┘

stable ──setRemoteDescription(offer)──> have-remote-offer ──createAnswer()──> stable
```

| 状态 | 含义 |
|------|------|
| `stable` | 初始状态，或协商完成后的状态 |
| `have-local-offer` | 已创建并设置本地 Offer |
| `have-remote-offer` | 已收到并设置远端 Offer |
| `have-local-pranswer` | 已创建并设置本地临时 Answer（极少用） |
| `have-remote-pranswer` | 已收到并设置远端临时 Answer（极少用） |
| `closed` | 连接已关闭 |

**2. iceConnectionState（ICE 连接状态）：**

```
new ──开始收集 candidate──> checking ──找到可用路径──> connected ──所有路径测试完成──> completed
                                     |
                                     └─无可用路径──> failed
                                     |
                                     └─断开──> disconnected ──超时──> failed
```

| 状态 | 含义 |
|------|------|
| `new` | 初始状态，尚未开始 ICE 处理 |
| `checking` | 正在检查 candidate pair 的连通性 |
| `connected` | 找到至少一个可用路径，可以传输数据 |
| `completed` | 所有 candidate pair 检查完成，找到最佳路径 |
| `failed` | 所有 candidate pair 都失败 |
| `disconnected` | 连接断开，可能在尝试重连 |
| `closed` | ICE 代理已关闭 |

**3. connectionState（整体连接状态）：**

| 状态 | 含义 |
|------|------|
| `new` | 初始状态 |
| `connecting` | 正在建立连接（ICE + DTLS） |
| `connected` | 连接建立成功，可以通信 |
| `disconnected` | 连接断开，可能自动恢复 |
| `failed` | 连接失败 |
| `closed` | 连接已关闭 |

**状态监听代码：**

```javascript
const pc = new RTCPeerConnection(config);

pc.onsignalingstatechange = () => {
  console.log('signalingState:', pc.signalingState);
};

pc.oniceconnectionstatechange = () => {
  console.log('iceConnectionState:', pc.iceConnectionState);
  
  if (pc.iceConnectionState === 'failed') {
    // 尝试 ICE Restart
    pc.restartIce();
  }
};

pc.onconnectionstatechange = () => {
  console.log('connectionState:', pc.connectionState);
  
  switch (pc.connectionState) {
    case 'connected':
      // 连接成功
      break;
    case 'disconnected':
      // 连接断开，等待或提示用户
      break;
    case 'failed':
      // 连接失败，可能需要重新建立
      break;
  }
};
```

---

### Q6：什么是 Trickle ICE？有什么优势？

**难度：** ⭐⭐⭐

**参考答案：**

**Trickle ICE** 是一种增量式 ICE Candidate 交换机制，candidate 收集到一个就发送一个，而不是等全部收集完再一次性发送。

**传统方式 vs Trickle ICE：**

```
传统方式（Vanilla ICE）:
  创建 Offer → 等待所有 candidate 收集完成（可能 3-5 秒）
  → 发送包含所有 candidate 的 Offer
  → 对端收到后开始处理
  总延迟: 5-8 秒

Trickle ICE:
  创建 Offer → 立即发送（不含 candidate）
  → 边收集边发送 candidate
  → 对端收到 Offer 后立即开始处理
  → 收到第一个 candidate 就开始连通性检测
  总延迟: 1-3 秒
```

**优势：**
1. **显著降低连接建立时间**（减少 50% 以上）
2. **用户体验更好**，视频出现更快
3. **对端可以尽早开始处理**

**实现方式：**

```javascript
// 创建 Offer 时，不包含 candidate（null candidate 表示收集完成）
const offer = await pc.createOffer();
await pc.setLocalDescription(offer);

// 立即发送 Offer（不含 candidate）
signaling.send({ type: 'offer', sdp: offer.sdp });

// 收集到 candidate 立即发送
pc.onicecandidate = (event) => {
  signaling.send({
    type: 'ice-candidate',
    candidate: event.candidate  // null 表示收集完成
  });
};
```

---

### Q7：RTCP 的作用是什么？常见的 RTCP 包类型？

**难度：** ⭐⭐⭐⭐

**参考答案：**

**RTCP（RTP Control Protocol）** 是 RTP 的配套控制协议，用于传输质量控制信息。

**主要作用：**
1. **质量反馈**：接收端向发送端报告接收质量
2. **同步**：不同流的时钟同步
3. **参与者信息**：会话中的参与者标识

**常见 RTCP 包类型：**

| 类型 | 名称 | 作用 |
|------|------|------|
| **SR** | Sender Report | 发送端报告，包含发送包数、字节数、时间戳 |
| **RR** | Receiver Report | 接收端报告，包含丢包率、抖动、延迟 |
| **SDES** | Source Description | 源描述，包含 CNAME 等标识 |
| **BYE** | Goodbye | 参与者离开通知 |
| **APP** | Application-defined | 应用自定义数据 |

**RR 中的关键指标（用于自适应码率）：**

```
Receiver Report:
  - fraction lost: 丢包率 (0-255，换算为百分比)
  - cumulative lost: 累计丢包数
  - jitter: 抖动（包到达时间的变化）
  - delay since last SR (DLSR): 上次收到 SR 后的延迟
```

**WebRTC 中的使用：**
- 发送端根据 RR 中的丢包率调整编码码率
- 高丢包率 → 降低码率
- 低丢包率 + 带宽充足 → 提高码率

---

### Q8：WebRTC 的拥塞控制机制是什么？

**难度：** ⭐⭐⭐⭐⭐

**参考答案：**

WebRTC 使用 **GCC（Google Congestion Control）** 算法进行拥塞控制，结合发送端和接收端的信息调整码率。

**GCC 算法组成：**

```
┌─────────────────────────────────────────────────────────────┐
│                    GCC 拥塞控制                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  接收端（基于延迟）                                           │
│  ├── 计算包组间延迟变化（inter-arrival time - inter-departure）│
│  ├── 通过 Kalman 滤波器估计网络状态                            │
│  └── 生成 REMB（Receiver Estimated Maximum Bitrate）          │
│      → 通过 RTCP 反馈给发送端                                  │
│                                                             │
│  发送端（基于丢包）                                           │
│  ├── 解析 RTCP RR 中的丢包率                                   │
│  ├── 丢包率 < 2%: 增加码率                                     │
│  ├── 丢包率 2%-10%: 保持码率                                   │
│  └── 丢包率 > 10%: 降低码率                                    │
│                                                             │
│  最终码率 = min(基于延迟的码率, 基于丢包的码率)                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**WebRTC 中的配置：**

```javascript
const pc = new RTCPeerConnection({
  // 通过编码参数设置初始码率
});

// 发送端通过 RTCRtpSender 设置编码参数
const sender = pc.getSenders()[0];
const params = sender.getParameters();

// 设置最大码率
params.encodings[0].maxBitrate = 1500000; // 1.5 Mbps
params.encodings[0].minBitrate = 300000;  // 300 Kbps

await sender.setParameters(params);
```

---

## 三、场景题 + 解决方案

---

### 场景 1：多人视频会议架构选型

**难度：** ⭐⭐⭐⭐

#### 场景描述

公司要开发一个支持 50 人同时在线的视频会议系统，技术团队对架构选型有分歧。

#### 问题分析

WebRTC 原生是 P2P 的，多人会议需要选择合适的服务端架构。

#### 三种架构对比

| 维度 | Mesh（网状） | SFU（选择性转发） | MCU（多点控制单元） |
|------|-------------|------------------|-------------------|
| **原理** | 每个端与其他所有端直接连接 | 服务端转发选择的流 | 服务端混音混屏后分发 |
| **上行带宽** | (N-1) * 码率 | 1 * 码率 | 1 * 码率 |
| **下行带宽** | (N-1) * 码率 | (N-1) * 码率 | 1 * 码率 |
| **服务端压力** | 低（只传信令） | 中（只转发，不解码） | 高（编解码、混音混屏） |
| **延迟** | 低（P2P） | 低（转发不解码） | 中（编解码耗时） |
| **客户端性能** | 高（N-1 个连接） | 低（1 个连接） | 低（1 个连接） |
| **布局灵活性** | 各端独立控制 | 各端独立控制 | 服务端固定布局 |
| **适用人数** | < 5 人 | 5-1000 人 | 大规模直播 |

**架构图：**

```
Mesh（3人会议）:                    SFU（3人会议）:
  A ←────→ B                         A ──→ SFU ──→ B, C
  ↑ ↘   ↗ ↑                          B ──→ SFU ──→ A, C
  └──→ C ←─┘                         C ──→ SFU ──→ A, B
  
  每人 2 个连接                      每人 1 个连接
  共 6 个连接                        SFU 负责转发

MCU（3人会议）:
  A ──→ MCU（混音混屏）──→ 所有客户端
  B ──→ MCU                          所有人看到同一个画面
  C ──→ MCU
```

#### 解决方案

**50 人视频会议推荐 SFU 架构：**

1. **Simulcast（多轨道发送）**：客户端同时发送多档画质（高清/标清/流畅），SFU 根据接收端带宽选择转发哪一档
2. **SVC（可伸缩视频编码）**：VP9/AV1 支持，一个流包含多层，可动态丢弃增强层
3. **按需订阅**：接收端只订阅当前可见的视频（分页显示）

**关键配置代码：**

```javascript
// Simulcast 配置
const pc = new RTCPeerConnection();

const stream = await navigator.mediaDevices.getUserMedia({
  video: { width: 1280, height: 720 }
});

// 发送端启用 Simulcast
const transceiver = pc.addTransceiver(stream.getVideoTracks()[0], {
  direction: 'sendonly',
  streams: [stream]
});

// 设置三层编码参数
const params = transceiver.sender.getParameters();
params.encodings = [
  { rid: 'high', maxBitrate: 2500000, scaleResolutionDownBy: 1 },   // 720p
  { rid: 'mid', maxBitrate: 600000, scaleResolutionDownBy: 2 },     // 360p
  { rid: 'low', maxBitrate: 150000, scaleResolutionDownBy: 4 }      // 180p
];
await transceiver.sender.setParameters(params);

// 接收端选择订阅哪一层
// 通过信令通知 SFU："我只看 userA 的 mid 层"
```

**选型建议：**

| 场景 | 推荐架构 |
|------|---------|
| 1v1 通话 | Mesh（无需服务器转发媒体） |
| 小班课（< 8 人） | Mesh 或 SFU |
| 中班课（8-50 人） | **SFU** |
| 大班课/直播（> 50 人） | SFU + MCU（主讲用 MCU 合成，观众看合成流） |
| 大规模直播（> 1000 人） | MCU 或 CDN 转推 |

---

### 场景 2：跨网络连接失败（企业防火墙/对称型 NAT）

**难度：** ⭐⭐⭐⭐

#### 场景描述

用户反馈在公司内网无法建立视频通话，但在家里可以。抓包发现 ICE 连接状态变为 `failed`。

#### 问题分析

1. 企业防火墙可能阻止 UDP 出站
2. 企业 NAT 可能为对称型
3. 可能只允许 80/443 端口的 TCP 出站

#### 排查步骤

```
步骤 1: 检查 candidate 类型
  → 如果只有 host candidate，说明 STUN/TURN 无法访问
  → 如果只有 relay candidate，说明 STUN 失败但 TURN 可用
  → 如果没有 candidate，说明网络完全不通

步骤 2: 检查 iceConnectionState
  → new → checking → failed：连通性检测全部失败
  → new → checking → disconnected：初始成功但后续断开

步骤 3: 使用在线工具检测 NAT 类型
  → https://webrtc.github.io/samples/src/content/peerconnection/trickle-ice/
  → 查看收集到的 candidate 类型

步骤 4: 测试 TURN 服务器连通性
  → telnet turn.server.com 3478
  → 检查是否能建立 UDP/TCP 连接
```

#### 解决方案

**1. 配置 TURN 服务器（coturn）：**

```bash
# /etc/turnserver.conf
# TURN 服务器配置

listening-port=3478
listening-ip=YOUR_SERVER_IP
relay-ip=YOUR_SERVER_IP
external-ip=YOUR_PUBLIC_IP

# 认证方式
lt-cred-mech
user=username:password
realm=your-domain.com

# 支持 TCP（用于防火墙只开放 TCP 的场景）
no-udp
# 或同时支持
tls-listening-port=5349
cert=/path/to/cert.pem
pkey=/path/to/key.pem

# 日志
log-file=/var/log/turnserver.log
verbose
```

**2. 客户端配置多个 ICE 服务器：**

```javascript
const pc = new RTCPeerConnection({
  iceServers: [
    // STUN 服务器（免费公共）
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    
    // TURN 服务器（必须自建或使用云服务）
    {
      urls: 'turn:your-turn-server.com:3478',
      username: 'username',
      credential: 'password'
    },
    {
      urls: 'turns:your-turn-server.com:5349',  // TURN over TLS
      username: 'username',
      credential: 'password'
    },
    {
      urls: 'turn:your-turn-server.com:3478?transport=tcp',  // TCP 回退
      username: 'username',
      credential: 'password'
    }
  ],
  iceTransportPolicy: 'all',  // 'all' 或 'relay'（强制走中继）
  iceCandidatePoolSize: 10
});
```

**3. 监控和统计：**

```javascript
// 获取连接统计信息
setInterval(async () => {
  const stats = await pc.getStats();
  
  stats.forEach((report) => {
    if (report.type === 'candidate-pair' && report.state === 'succeeded') {
      console.log('使用的 candidate pair:', {
        local: report.localCandidateId,
        remote: report.remoteCandidateId,
        rtt: report.currentRoundTripTime,
        bytesSent: report.bytesSent,
        bytesReceived: report.bytesReceived
      });
    }
    
    if (report.type === 'local-candidate') {
      console.log('本地 candidate:', {
        type: report.candidateType,  // host / srflx / relay
        protocol: report.protocol,
        address: report.address,
        port: report.port
      });
    }
  });
}, 5000);
```

---

### 场景 3：音视频质量问题（卡顿、回声、噪声）

**难度：** ⭐⭐⭐⭐

#### 场景描述

视频会议中用户反馈：
1. 画面卡顿、声音断断续续
2. 能听到自己的回声
3. 背景噪声大

#### 问题分析

| 现象 | 可能原因 | 解决方向 |
|------|---------|---------|
| 卡顿 | 带宽不足、CPU 过载、丢包率高 | 自适应码率、降分辨率 |
| 回声 | 扬声器声音被麦克风采集 | 回声消除（AEC） |
| 噪声 | 环境噪声、电流声 | 噪声抑制（NS） |

#### 解决方案

**1. 卡顿问题 - 自适应码率：**

```javascript
// 获取带宽估计和连接质量
async function checkConnectionQuality(pc) {
  const stats = await pc.getStats();
  let packetsLost = 0;
  let packetsReceived = 0;
  let jitter = 0;
  
  stats.forEach((report) => {
    if (report.type === 'inbound-rtp') {
      packetsLost = report.packetsLost;
      packetsReceived = report.packetsReceived;
      jitter = report.jitter;
    }
  });
  
  const lossRate = packetsLost / (packetsLost + packetsReceived);
  
  return {
    lossRate,
    jitter,
    quality: lossRate < 0.02 ? 'good' : lossRate < 0.05 ? 'fair' : 'poor'
  };
}

// 动态调整发送参数
async function adjustQuality(sender, quality) {
  const params = sender.getParameters();
  
  switch (quality) {
    case 'poor':
      params.encodings[0].maxBitrate = 150000;  // 降到 150kbps
      params.encodings[0].scaleResolutionDownBy = 4;  // 1/4 分辨率
      break;
    case 'fair':
      params.encodings[0].maxBitrate = 500000;  // 500kbps
      params.encodings[0].scaleResolutionDownBy = 2;
      break;
    case 'good':
      params.encodings[0].maxBitrate = 2500000; // 2.5Mbps
      params.encodings[0].scaleResolutionDownBy = 1;
      break;
  }
  
  await sender.setParameters(params);
}
```

**2. 回声消除 - 浏览器原生支持：**

```javascript
// 获取媒体时启用回声消除
const stream = await navigator.mediaDevices.getUserMedia({
  audio: {
    echoCancellation: true,      // 回声消除（必须）
    noiseSuppression: true,      // 噪声抑制
    autoGainControl: true,       // 自动增益控制
    sampleRate: 48000,           // 采样率
    channelCount: 1              // 单声道（减少带宽）
  },
  video: true
});
```

**3. 音频处理高级配置：**

```javascript
// 使用 Web Audio API 进行更精细的音频处理
const audioContext = new AudioContext();
const source = audioContext.createMediaStreamSource(stream);

// 噪声门（Noise Gate）
const noiseGate = audioContext.createDynamicsCompressor();
noiseGate.threshold.value = -50;  // 低于 -50dB 的静音
noiseGate.knee.value = 40;
noiseGate.ratio.value = 12;
noiseGate.attack.value = 0;
noiseGate.release.value = 0.25;

source.connect(noiseGate);
noiseGate.connect(audioContext.destination);
```

**4. 视频卡顿 - 帧率/分辨率自适应：**

```javascript
// 根据 CPU 使用率调整
let consecutiveDroppedFrames = 0;

setInterval(async () => {
  const stats = await pc.getStats();
  
  stats.forEach((report) => {
    if (report.type === 'outbound-rtp' && report.kind === 'video') {
      const framesSent = report.framesSent;
      const hugeFramesSent = report.hugeFramesSent || 0;
      
      // 如果连续丢帧过多，降低质量
      if (report.qualityLimitationReason === 'cpu') {
        console.log('CPU 受限，降低分辨率');
        reduceVideoQuality();
      }
    }
  });
}, 3000);
```

**5. Jitter Buffer 配置：**

```javascript
// Jitter Buffer 在接收端自动管理，但可以通过 RTCRtpReceiver 参数微调
// 注意：WebRTC 的 jitter buffer 大多是自动的，应用层干预有限

// 可以通过 SDP 设置 jitter buffer 大小（部分浏览器支持）
const offer = await pc.createOffer();

// 在 SDP 中添加 b=AS 限制带宽
const modifiedSdp = offer.sdp.replace(
  /(m=video.*\r\n)/,
  '$1b=AS:2000\r\n'  // 限制视频带宽 2Mbps
);

await pc.setLocalDescription({ type: 'offer', sdp: modifiedSdp });
```

---

### 场景 4：移动端适配

**难度：** ⭐⭐⭐⭐

#### 场景描述

开发移动端 WebRTC 应用，需要处理：
1. 前后摄像头切换
2. 弱网/低带宽自适应
3. 应用切后台/锁屏处理

#### 解决方案

**1. 前后摄像头切换：**

```javascript
// 枚举设备
const devices = await navigator.mediaDevices.enumerateDevices();
const videoDevices = devices.filter(d => d.kind === 'videoinput');

let currentDeviceIndex = 0;

async function switchCamera() {
  currentDeviceIndex = (currentDeviceIndex + 1) % videoDevices.length;
  const newDeviceId = videoDevices[currentDeviceIndex].deviceId;
  
  // 获取新摄像头的流
  const newStream = await navigator.mediaDevices.getUserMedia({
    video: { deviceId: { exact: newDeviceId } },
    audio: true
  });
  
  const newVideoTrack = newStream.getVideoTracks()[0];
  
  // 替换发送端的 track
  const sender = pc.getSenders().find(s => 
    s.track && s.track.kind === 'video'
  );
  
  if (sender) {
    await sender.replaceTrack(newVideoTrack);
  }
  
  // 停止旧 track，释放资源
  const oldTrack = localVideo.srcObject.getVideoTracks()[0];
  oldTrack.stop();
  
  // 更新本地预览
  localVideo.srcObject = newStream;
}
```

**2. 低带宽自适应：**

```javascript
// 监听网络变化（Network Information API）
const connection = navigator.connection || 
                   navigator.mozConnection || 
                   navigator.webkitConnection;

if (connection) {
  connection.addEventListener('change', () => {
    console.log('网络类型:', connection.effectiveType); // 4g / 3g / 2g
    console.log('下行速度:', connection.downlink, 'Mbps');
    console.log('RTT:', connection.rtt, 'ms');
    
    adjustForNetwork(connection.effectiveType);
  });
}

async function adjustForNetwork(networkType) {
  const sender = pc.getSenders().find(s => 
    s.track && s.track.kind === 'video'
  );
  
  const params = sender.getParameters();
  
  switch (networkType) {
    case '4g':
      params.encodings[0].maxBitrate = 1500000;
      params.encodings[0].maxFramerate = 30;
      break;
    case '3g':
      params.encodings[0].maxBitrate = 400000;
      params.encodings[0].maxFramerate = 15;
      break;
    case '2g':
      // 2G 下关闭视频，只发音频
      params.encodings[0].active = false;
      break;
  }
  
  await sender.setParameters(params);
}
```

**3. 后台运行/锁屏处理：**

```javascript
// 监听页面可见性变化
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // 页面进入后台
    handleBackgroundMode();
  } else {
    // 页面回到前台
    handleForegroundMode();
  }
});

async function handleBackgroundMode() {
  // 方案 1: 关闭视频发送，保留音频
  const videoSender = pc.getSenders().find(s => 
    s.track && s.track.kind === 'video'
  );
  
  if (videoSender) {
    // 暂停视频发送
    const params = videoSender.getParameters();
    params.encodings[0].active = false;
    await videoSender.setParameters(params);
  }
  
  // 方案 2: 降低视频到最低质量
  // params.encodings[0].maxBitrate = 50000;
  // params.encodings[0].maxFramerate = 5;
  
  // 方案 3: 用黑色帧替代（某些场景需要保持连接）
  // const canvas = document.createElement('canvas');
  // canvas.width = 320;
  // canvas.height = 240;
  // const ctx = canvas.getContext('2d');
  // ctx.fillStyle = 'black';
  // ctx.fillRect(0, 0, 320, 240);
  // const blackStream = canvas.captureStream();
  // await videoSender.replaceTrack(blackStream.getVideoTracks()[0]);
}

async function handleForegroundMode() {
  // 恢复视频发送
  const videoSender = pc.getSenders().find(s => 
    s.track && s.track.kind === 'video'
  );
  
  if (videoSender) {
    const params = videoSender.getParameters();
    params.encodings[0].active = true;
    await videoSender.setParameters(params);
  }
  
  // 重新获取摄像头（如果之前停止了）
  // const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  // await videoSender.replaceTrack(stream.getVideoTracks()[0]);
}
```

**4. 移动端性能优化：**

```javascript
// 移动端使用 H.264 硬件编码（节省电量）
const pc = new RTCPeerConnection({
  // 优先使用 H.264（iOS Safari 支持硬件加速）
});

// 创建 Offer 时设置编解码器优先级
const offer = await pc.createOffer();

// 将 H.264 放在 VP8 前面（iOS 兼容性更好）
// 注意：这需要 SDP 操作，实际项目中建议使用 SDP 转换库如 sdp-transform

// 限制分辨率和帧率（降低 CPU 占用）
const stream = await navigator.mediaDevices.getUserMedia({
  video: {
    width: { ideal: 640, max: 1280 },   // 移动端不需要太高分辨率
    height: { ideal: 480, max: 720 },
    frameRate: { ideal: 24, max: 30 },
    facingMode: 'user'  // 前置摄像头
  },
  audio: {
    sampleRate: 44100,
    channelCount: 1,     // 单声道减少处理量
    echoCancellation: true,
    noiseSuppression: true
  }
});
```

---

### 场景 5：屏幕共享 + 摄像头同时推流

**难度：** ⭐⭐⭐⭐

#### 场景描述

在线教育场景中，老师需要同时推送：
1. 屏幕共享（PPT/代码演示）
2. 摄像头画面（老师头像）

#### 问题分析

需要在一个 RTCPeerConnection 中发送多个视频轨道。

#### 解决方案

**方案 1：添加多个 Track（推荐）**

```javascript
const pc = new RTCPeerConnection();

// 1. 获取屏幕共享流
const screenStream = await navigator.mediaDevices.getDisplayMedia({
  video: {
    cursor: 'always',
    displaySurface: 'monitor'  // monitor / window / browser
  },
  audio: true  // 共享系统音频（Chrome 支持）
});

// 2. 获取摄像头流
const cameraStream = await navigator.mediaDevices.getUserMedia({
  video: { width: 320, height: 240 },  // 小窗口
  audio: true
});

// 3. 添加屏幕共享 track
screenStream.getTracks().forEach(track => {
  if (track.kind === 'video') {
    // 可以设置 track 的 id 或 label 来区分
    pc.addTrack(track, screenStream);
  }
});

// 4. 添加摄像头 track
cameraStream.getVideoTracks().forEach(track => {
  pc.addTrack(track, cameraStream);
});

// 5. 只发送一个音频（避免回声）
const audioTrack = cameraStream.getAudioTracks()[0];
pc.addTrack(audioTrack, cameraStream);

// 6. 监听屏幕共享停止
screenStream.getVideoTracks()[0].onended = () => {
  console.log('屏幕共享已停止');
  // 通知对端
  signaling.send({ type: 'screen-share-stopped' });
};
```

**接收端处理多轨道：**

```javascript
pc.ontrack = (event) => {
  const track = event.track;
  const stream = event.streams[0];
  
  // 根据 track label 或 kind 区分
  if (track.label.includes('screen') || track.label.includes('display')) {
    // 屏幕共享轨道
    screenVideoElement.srcObject = stream;
  } else {
    // 摄像头轨道
    cameraVideoElement.srcObject = stream;
  }
};
```

**方案 2：替换 Track（单视频轨道切换）**

```javascript
// 如果只需要显示一个画面（大画面切换）
const sender = pc.getSenders().find(s => 
  s.track && s.track.kind === 'video'
);

// 切换到屏幕共享
const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
const screenTrack = screenStream.getVideoTracks()[0];
await sender.replaceTrack(screenTrack);

// 切回摄像头
const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
const cameraTrack = cameraStream.getVideoTracks()[0];
await sender.replaceTrack(cameraTrack);
```

**方案对比：**

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 多 Track | 同时显示两个画面 | 带宽占用高 | 在线教育、会议 |
| 替换 Track | 带宽占用低 | 只能显示一个 | 简单屏幕共享 |

---

### 场景 6：断线重连（网络切换 WiFi ↔ 4G）

**难度：** ⭐⭐⭐⭐⭐

#### 场景描述

用户在视频通话中从 WiFi 切换到 4G，或从 4G 切换到另一个 WiFi，连接断开需要自动恢复。

#### 问题分析

网络切换导致：
1. IP 地址变化，原有 ICE candidate 失效
2. 需要重新进行 ICE 协商
3. 用户体验：短暂黑屏后自动恢复

#### 解决方案

**方案 1：ICE Restart（推荐）**

```javascript
// 监听连接状态
pc.oniceconnectionstatechange = () => {
  console.log('ICE state:', pc.iceConnectionState);
  
  if (pc.iceConnectionState === 'failed') {
    // ICE 失败，执行 restart
    restartIce();
  }
  
  if (pc.iceConnectionState === 'disconnected') {
    // 断开，等待自动恢复或手动 restart
    setTimeout(() => {
      if (pc.iceConnectionState === 'disconnected') {
        restartIce();
      }
    }, 5000);  // 等待 5 秒后仍未恢复则 restart
  }
};

async function restartIce() {
  try {
    console.log('执行 ICE Restart...');
    
    // 方法 1: 使用 restartIce() API（较新浏览器）
    if (pc.restartIce) {
      pc.restartIce();
      const offer = await pc.createOffer({ iceRestart: true });
      await pc.setLocalDescription(offer);
      signaling.send({ type: 'offer', sdp: offer.sdp });
    } else {
      // 方法 2: 兼容旧浏览器
      const offer = await pc.createOffer({ iceRestart: true });
      await pc.setLocalDescription(offer);
      signaling.send({ type: 'offer', sdp: offer.sdp });
    }
  } catch (err) {
    console.error('ICE Restart 失败:', err);
    // 如果 restart 失败，可能需要完全重建连接
    rebuildConnection();
  }
}

// 接收端处理 ICE Restart Offer
async function handleOffer(offer) {
  await pc.setRemoteDescription(offer);
  
  // 如果是 iceRestart，需要重新创建 answer
  if (offer.iceRestart) {
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    signaling.send({ type: 'answer', sdp: answer.sdp });
  }
}
```

**方案 2：完全重建 RTCPeerConnection**

```javascript
class WebRTCConnection {
  constructor(signaling) {
    this.signaling = signaling;
    this.pc = null;
    this.localStream = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }
  
  async init(localStream) {
    this.localStream = localStream;
    this.pc = this.createPeerConnection();
    this.addTracks(localStream);
    this.setupEventHandlers();
  }
  
  createPeerConnection() {
    return new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'turn:your-turn.com:3478', username: 'user', credential: 'pass' }
      ],
      iceCandidatePoolSize: 10
    });
  }
  
  setupEventHandlers() {
    this.pc.onconnectionstatechange = () => {
      if (this.pc.connectionState === 'failed') {
        this.handleDisconnect();
      }
    };
    
    this.pc.oniceconnectionstatechange = () => {
      if (this.pc.iceConnectionState === 'failed') {
        this.handleDisconnect();
      }
    };
  }
  
  async handleDisconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('重连次数超限');
      this.emit('reconnect-failed');
      return;
    }
    
    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    
    console.log(`${delay}ms 后尝试第 ${this.reconnectAttempts} 次重连...`);
    
    setTimeout(() => {
      this.reconnect();
    }, delay);
  }
  
  async reconnect() {
    // 关闭旧连接
    if (this.pc) {
      this.pc.close();
    }
    
    // 创建新连接
    this.pc = this.createPeerConnection();
    this.addTracks(this.localStream);
    this.setupEventHandlers();
    
    // 重新协商
    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);
    this.signaling.send({ type: 'reconnect-offer', sdp: offer.sdp });
  }
  
  addTracks(stream) {
    stream.getTracks().forEach(track => {
      this.pc.addTrack(track, stream);
    });
  }
}
```

**方案 3：监听网络变化（提前感知）**

```javascript
// 使用 Network Information API
const connection = navigator.connection;

let lastNetworkType = connection?.effectiveType;

connection?.addEventListener('change', () => {
  const newNetworkType = connection.effectiveType;
  
  if (lastNetworkType !== newNetworkType) {
    console.log(`网络切换: ${lastNetworkType} -> ${newNetworkType}`);
    
    // 网络类型变化，主动执行 ICE Restart
    restartIce();
  }
  
  lastNetworkType = newNetworkType;
});

// 监听在线/离线状态
window.addEventListener('online', () => {
  console.log('网络恢复在线');
  restartIce();
});

window.addEventListener('offline', () => {
  console.log('网络离线');
  // 显示提示
});
```

---

### 场景 7：安全合规（端到端加密 + 录制合规）

**难度：** ⭐⭐⭐⭐⭐

#### 场景描述

1. 金融/医疗行业要求通话内容端到端加密
2. 客服场景需要录制通话，但要符合合规要求

#### 解决方案

**1. 端到端加密（E2EE）**

WebRTC 原生已经使用 DTLS-SRTP 加密传输，但密钥由浏览器自动管理。要实现真正的端到端加密（服务端也无法解密）：

```javascript
// 方案：在应用层添加额外加密（Insertable Streams API）
// 注意：此 API 需要特定权限和较新浏览器

async function setupE2EE(pc, key) {
  const sender = pc.getSenders()[0];
  
  // 检查是否支持 Insertable Streams
  if (!sender.createEncodedStreams) {
    console.warn('浏览器不支持 Insertable Streams');
    return;
  }
  
  const { readable, writable } = sender.createEncodedStreams();
  
  const transformStream = new TransformStream({
    transform: (encodedFrame, controller) => {
      // 加密数据
      const data = new Uint8Array(encodedFrame.data);
      const encrypted = encrypt(data, key);  // 使用 AES-GCM 等
      
      encodedFrame.data = encrypted.buffer;
      controller.enqueue(encodedFrame);
    }
  });
  
  readable
    .pipeThrough(transformStream)
    .pipeTo(writable);
}

// 接收端解密
async function setupE2EEDecryption(pc, key) {
  const receiver = pc.getReceivers()[0];
  const { readable, writable } = receiver.createEncodedStreams();
  
  const transformStream = new TransformStream({
    transform: (encodedFrame, controller) => {
      const data = new Uint8Array(encodedFrame.data);
      const decrypted = decrypt(data, key);
      
      encodedFrame.data = decrypted.buffer;
      controller.enqueue(encodedFrame);
    }
  });
  
  readable
    .pipeThrough(transformStream)
    .pipeTo(writable);
}
```

**2. 录制合规方案**

```javascript
// 方案 1: 客户端录制（用户知情同意）
class CallRecorder {
  constructor(stream) {
    this.recordedChunks = [];
    this.mediaRecorder = null;
    this.stream = stream;
  }
  
  start() {
    // 混合所有轨道
    const mixedStream = new MediaStream();
    
    // 获取所有音频轨道并混合
    const audioContext = new AudioContext();
    const destination = audioContext.createMediaStreamDestination();
    
    this.stream.getAudioTracks().forEach(track => {
      const source = audioContext.createMediaStreamSource(new MediaStream([track]));
      source.connect(destination);
    });
    
    destination.stream.getAudioTracks().forEach(track => {
      mixedStream.addTrack(track);
    });
    
    // 添加视频轨道（取第一个）
    const videoTrack = this.stream.getVideoTracks()[0];
    if (videoTrack) {
      mixedStream.addTrack(videoTrack);
    }
    
    // 开始录制
    this.mediaRecorder = new MediaRecorder(mixedStream, {
      mimeType: 'video/webm;codecs=vp9,opus'
    });
    
    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.recordedChunks.push(event.data);
      }
    };
    
    this.mediaRecorder.start(1000); // 每秒一个 chunk
    
    // 显示录制提示
    this.showRecordingIndicator();
  }
  
  stop() {
    return new Promise((resolve) => {
      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
        resolve(blob);
      };
      this.mediaRecorder.stop();
      this.hideRecordingIndicator();
    });
  }
  
  showRecordingIndicator() {
    // UI 提示：正在录制
    const indicator = document.createElement('div');
    indicator.id = 'recording-indicator';
    indicator.textContent = '● 录制中';
    indicator.style.cssText = 'position:fixed;top:10px;right:10px;color:red;font-weight:bold;';
    document.body.appendChild(indicator);
  }
}

// 方案 2: 服务端录制（SFU 架构）
// 在 SFU 服务器上使用 MediaSoup / Janus 等录制功能
// 优点：客户端无感知，录制质量稳定
// 缺点：服务端存储压力大

// 方案 3: 合规要点
const compliance = {
  // 1. 录制前必须获取用户明确同意
  requireConsent: true,
  
  // 2. 录制过程中必须有明显提示
  showRecordingIndicator: true,
  
  // 3. 告知用户录制目的和保存期限
  informPurpose: true,
  
  // 4. 提供停止录制/删除录制的权利
  allowOptOut: true,
  
  // 5. 数据加密存储
  encryptStorage: true,
  
  // 6. 访问日志审计
  auditLog: true
};
```

---

## 四、系统设计题

---

### 题目 1：设计一个 1v1 视频通话系统

**难度：** ⭐⭐⭐

#### 要求

- 支持 1 对 1 音视频通话
- 支持呼叫/接听/拒绝/挂断
- 支持网络切换自动重连
- 支持通话质量统计

#### 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                      1v1 视频通话系统                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   客户端 A                      信令服务器                    客户端 B   │
│   ┌─────────────┐              ┌─────────────┐              ┌─────────────┐ │
│   │  UI 层       │              │  WebSocket   │              │  UI 层       │ │
│   │  - 呼叫界面   │◄────────────►│  - 房间管理   │◄────────────►│  - 呼叫界面   │ │
│   │  - 视频渲染   │   信令交换    │  - 消息转发   │   信令交换    │  - 视频渲染   │ │
│   │  - 状态显示   │              │  - 在线状态   │              │  - 状态显示   │ │
│   ├─────────────┤              ├─────────────┤              ├─────────────┤ │
│   │  业务逻辑层   │              │  REST API    │              │  业务逻辑层   │ │
│   │  - 呼叫状态机 │              │  - 用户认证   │              │  - 呼叫状态机 │ │
│   │  - 信令处理   │              │  - 通话记录   │              │  - 信令处理   │ │
│   │  - 重连逻辑   │              │  - 推送服务   │              │  - 重连逻辑   │ │
│   ├─────────────┤              └─────────────┘              ├─────────────┤ │
│   │  WebRTC 层   │                                            │  WebRTC 层   │ │
│   │  - getUserMedia                                          │  - getUserMedia│ │
│   │  - RTCPeerConnection    ◄────── P2P 直连 ───────────────►│  - RTCPeerConnection│
│   │  - 数据统计                                               │  - 数据统计   │ │
│   └─────────────┘                                            └─────────────┘ │
│                                                             │
│   辅助服务:                                                    │
│   - STUN 服务器 (stun.l.google.com:19302)                      │
│   - TURN 服务器 (自建，用于 NAT 穿透失败)                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 核心代码

```javascript
// ==================== 信令协议设计 ====================

// 呼叫信令消息格式
const SignalMessage = {
  // 发起呼叫
  INVITE: {
    type: 'invite',
    from: 'userA',
    to: 'userB',
    callId: 'uuid',
    media: { audio: true, video: true }
  },
  
  // 接受呼叫
  ACCEPT: {
    type: 'accept',
    callId: 'uuid',
    from: 'userB'
  },
  
  // 拒绝呼叫
  REJECT: {
    type: 'reject',
    callId: 'uuid',
    reason: 'busy' // busy | decline | timeout
  },
  
  // 挂断
  BYE: {
    type: 'bye',
    callId: 'uuid'
  },
  
  // WebRTC 信令
  OFFER: { type: 'offer', callId: 'uuid', sdp: '...' },
  ANSWER: { type: 'answer', callId: 'uuid', sdp: '...' },
  ICE_CANDIDATE: { type: 'ice-candidate', callId: 'uuid', candidate: {} }
};

// ==================== 客户端核心类 ====================

class VideoCallClient {
  constructor(userId, signaling) {
    this.userId = userId;
    this.signaling = signaling;
    this.pc = null;
    this.localStream = null;
    this.remoteStream = null;
    this.callState = 'idle'; // idle | calling | ringing | connected | ended
    this.callId = null;
    
    this.setupSignaling();
  }
  
  setupSignaling() {
    this.signaling.on('invite', (msg) => this.handleInvite(msg));
    this.signaling.on('accept', (msg) => this.handleAccept(msg));
    this.signaling.on('reject', (msg) => this.handleReject(msg));
    this.signaling.on('bye', (msg) => this.handleBye(msg));
    this.signaling.on('offer', (msg) => this.handleOffer(msg));
    this.signaling.on('answer', (msg) => this.handleAnswer(msg));
    this.signaling.on('ice-candidate', (msg) => this.handleIceCandidate(msg));
  }
  
  // 发起呼叫
  async call(targetUserId, options = { video: true, audio: true }) {
    this.callState = 'calling';
    this.callId = generateUUID();
    
    // 获取本地媒体
    this.localStream = await navigator.mediaDevices.getUserMedia(options);
    this.emit('local-stream', this.localStream);
    
    // 发送邀请
    this.signaling.send({
      type: 'invite',
      from: this.userId,
      to: targetUserId,
      callId: this.callId,
      media: options
    });
    
    // 设置超时
    this.callTimeout = setTimeout(() => {
      if (this.callState === 'calling') {
        this.endCall('timeout');
      }
    }, 30000);
  }
  
  // 接受呼叫
  async accept(inviteMsg) {
    this.callState = 'connected';
    this.callId = inviteMsg.callId;
    
    clearTimeout(this.callTimeout);
    
    // 获取本地媒体
    this.localStream = await navigator.mediaDevices.getUserMedia(inviteMsg.media);
    this.emit('local-stream', this.localStream);
    
    // 创建 PeerConnection
    this.pc = this.createPeerConnection();
    this.addTracks(this.localStream);
    
    // 发送接受
    this.signaling.send({
      type: 'accept',
      callId: this.callId,
      from: this.userId
    });
  }
  
  // 创建 RTCPeerConnection
  createPeerConnection() {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'turn:turn.yourserver.com:3478', username: 'user', credential: 'pass' }
      ],
      iceCandidatePoolSize: 10
    });
    
    pc.onicecandidate = (e) => {
      if (e.candidate) {
        this.signaling.send({
          type: 'ice-candidate',
          callId: this.callId,
          candidate: e.candidate
        });
      }
    };
    
    pc.ontrack = (e) => {
      this.remoteStream = e.streams[0];
      this.emit('remote-stream', this.remoteStream);
    };
    
    pc.onconnectionstatechange = () => {
      this.emit('connection-state', pc.connectionState);
      
      if (pc.connectionState === 'failed') {
        this.handleConnectionFailed();
      }
    };
    
    return pc;
  }
  
  // 处理接受
  async handleAccept(msg) {
    clearTimeout(this.callTimeout);
    this.callState = 'connected';
    
    // 创建并发送 Offer
    this.pc = this.createPeerConnection();
    this.addTracks(this.localStream);
    
    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);
    
    this.signaling.send({
      type: 'offer',
      callId: this.callId,
      sdp: offer.sdp
    });
  }
  
  // 处理 Offer
  async handleOffer(msg) {
    await this.pc.setRemoteDescription(new RTCSessionDescription({
      type: 'offer',
      sdp: msg.sdp
    }));
    
    const answer = await this.pc.createAnswer();
    await this.pc.setLocalDescription(answer);
    
    this.signaling.send({
      type: 'answer',
      callId: this.callId,
      sdp: answer.sdp
    });
  }
  
  // 处理 Answer
  async handleAnswer(msg) {
    await this.pc.setRemoteDescription(new RTCSessionDescription({
      type: 'answer',
      sdp: msg.sdp
    }));
  }
  
  // 处理 ICE Candidate
  async handleIceCandidate(msg) {
    await this.pc.addIceCandidate(new RTCIceCandidate(msg.candidate));
  }
  
  // 挂断
  endCall(reason = 'user') {
    this.signaling.send({
      type: 'bye',
      callId: this.callId,
      reason
    });
    
    this.cleanup();
  }
  
  // 清理资源
  cleanup() {
    if (this.pc) {
      this.pc.close();
      this.pc = null;
    }
    
    if (this.localStream) {
      this.localStream.getTracks().forEach(t => t.stop());
      this.localStream = null;
    }
    
    this.remoteStream = null;
    this.callState = 'idle';
    this.callId = null;
  }
  
  addTracks(stream) {
    stream.getTracks().forEach(track => {
      this.pc.addTrack(track, stream);
    });
  }
  
  // 通话质量统计
  async getStats() {
    if (!this.pc) return null;
    
    const stats = await this.pc.getStats();
    const report = {
      video: {},
      audio: {},
      connection: {}
    };
    
    stats.forEach((s) => {
      if (s.type === 'inbound-rtp') {
        if (s.kind === 'video') {
          report.video = {
            bitrate: s.bytesReceived,
            packetsLost: s.packetsLost,
            frameRate: s.framesPerSecond,
            resolution: `${s.frameWidth}x${s.frameHeight}`,
            jitter: s.jitter
          };
        }
      }
      if (s.type === 'candidate-pair' && s.state === 'succeeded') {
        report.connection.rtt = s.currentRoundTripTime * 1000;
      }
    });
    
    return report;
  }
}
```

---

### 题目 2：设计一个在线教育小班课系统（1 老师 + 8 学生）

**难度：** ⭐⭐⭐⭐

#### 要求

- 1 位老师，最多 8 位学生
- 老师可以看到所有学生，学生看到老师和自己
- 支持屏幕共享（老师）
- 支持举手、文字聊天
- 支持录制

#### 系统架构

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         在线教育小班课系统                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   老师端                          SFU 服务器                                  学生端 x8   │
│   ┌───────────────┐              ┌───────────────┐              ┌───────────────┐ │
│   │  推流:          │              │  房间管理       │              │  推流: 音频+视频  │ │
│   │  - 摄像头 720p   │─────────────►│  - 1 个房间     │◄─────────────│  - 摄像头 360p   │ │
│   │  - 音频          │   1 路上行    │  - 9 个参与者   │   8 路上行    │  - 音频          │ │
│   │  - 屏幕共享 1080p│              │               │              │               │ │
│   ├───────────────┤              ├───────────────┤              ├───────────────┤ │
│   │  拉流:          │              │  选择性转发     │              │  拉流:          │ │
│   │  - 所有学生视频  │◄─────────────│  - 老师流 → 所有 │─────────────►│  - 老师视频 720p  │ │
│   │  - 所有学生音频  │   8 路下行    │  - 学生流 → 老师 │   1 路下行    │  - 老师音频      │ │
│   │                │   + 8 路下行   │  - 屏幕共享 → 所有│   + 可选下行   │  - 自己的视频    │ │
│   │                │              │               │              │               │ │
│   └───────────────┘              └───────────────┘              └───────────────┘ │
│                                                                             │
│   辅助服务:                                                                  │
│   - 信令服务器 (WebSocket): 房间管理、媒体协商、举手、聊天                         │
│   - 录制服务器: 混音混屏录制 或 单流录制                                          │
│   - 白板服务: 实时同步白板内容                                                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### 媒体流设计

```javascript
// ==================== 老师端 ====================

class TeacherClient {
  constructor(roomId, sfuClient) {
    this.roomId = roomId;
    this.sfu = sfuClient;
    this.publishers = new Map(); // trackId -> RTCRtpSender
    this.studentSubscribers = new Map(); // studentId -> { video, audio }
  }
  
  async init() {
    // 1. 获取摄像头 + 音频
    this.cameraStream = await navigator.mediaDevices.getUserMedia({
      video: { width: 1280, height: 720, frameRate: 24 },
      audio: { echoCancellation: true, noiseSuppression: true }
    });
    
    // 2. 发布摄像头
    await this.sfu.publish(this.roomId, 'camera', this.cameraStream);
    
    // 3. 订阅所有学生
    this.sfu.on('new-producer', ({ studentId, kind, producerId }) => {
      this.subscribeStudent(studentId, kind, producerId);
    });
  }
  
  async startScreenShare() {
    this.screenStream = await navigator.mediaDevices.getDisplayMedia({
      video: { width: 1920, height: 1080, frameRate: 15 },
      audio: true
    });
    
    await this.sfu.publish(this.roomId, 'screen', this.screenStream);
    
    // 监听停止
    this.screenStream.getVideoTracks()[0].onended = () => {
      this.stopScreenShare();
    };
  }
  
  async subscribeStudent(studentId, kind, producerId) {
    const stream = await this.sfu.subscribe(producerId);
    // 渲染到对应的学生视频窗口
    this.renderStudentVideo(studentId, stream);
  }
}

// ==================== 学生端 ====================

class StudentClient {
  constructor(roomId, studentId, sfuClient) {
    this.roomId = roomId;
    this.studentId = studentId;
    this.sfu = sfuClient;
  }
  
  async init() {
    // 学生只发送 360p，节省上行带宽
    this.localStream = await navigator.mediaDevices.getUserMedia({
      video: { width: 640, height: 360, frameRate: 15 },
      audio: { echoCancellation: true }
    });
    
    // 发布自己的流
    await this.sfu.publish(this.roomId, 'camera', this.localStream);
    
    // 订阅老师的摄像头
    const teacherCamera = await this.sfu.subscribe('teacher-camera');
    this.renderVideo('teacher-video', teacherCamera);
    
    // 订阅老师的屏幕共享（如果有）
    this.sfu.on('screen-share-started', () => {
      this.subscribeScreenShare();
    });
  }
  
  async subscribeScreenShare() {
    const screenStream = await this.sfu.subscribe('teacher-screen');
    this.renderVideo('screen-share', screenStream);
    // 切换布局：大屏幕共享，小窗老师摄像头
  }
}

// ==================== SFU 信令交互 ====================

// 使用 mediasoup 或自研 SFU

// 房间管理
const roomSchema = {
  roomId: 'string',
  teacher: { userId: 'string', producers: [] },
  students: [
    { userId: 'string', producers: [], handRaised: false }
  ],
  screenShare: { active: false, producerId: null },
  chatMessages: []
};

// 举手功能
async function raiseHand(roomId, studentId) {
  await signaling.send({
    type: 'raise-hand',
    roomId,
    studentId,
    timestamp: Date.now()
  });
}

// 老师端显示举手列表
function showRaisedHands(students) {
  const raised = students.filter(s => s.handRaised);
  raised.forEach(s => {
    showNotification(`${s.name} 举手了`);
  });
}
```

#### 布局设计

```
老师端布局（9 宫格）:
┌─────────┬─────────┬─────────┐
│ 学生 1  │ 学生 2  │ 学生 3  │
├─────────┼─────────┼─────────┤
│ 学生 4  │ 学生 5  │ 学生 6  │
├─────────┼─────────┼─────────┤
│ 学生 7  │ 学生 8  │  自己   │
└─────────┴─────────┴─────────┘
底部: 老师自己的视频（大屏幕）

学生端布局:
┌─────────────────────────────┐
│                             │
│        老师视频              │
│        (大屏幕)              │
│                             │
├─────────────────────────────┤
│  自己的视频 (小窗口，可拖动)  │
└─────────────────────────────┘

屏幕共享时:
┌─────────────────────────────┐
│                             │
│        屏幕共享              │
│        (全屏)                │
│                             │
├─────────────────────────────┤
│ 老师视频 │ 自己的视频        │
└─────────────────────────────┘
```

---

### 题目 3：设计一个直播连麦系统

**难度：** ⭐⭐⭐⭐⭐

#### 要求

- 主播推流给大量观众（1:N）
- 观众可以申请连麦（变成 1:1 或 1:少量）
- 连麦观众的声音和视频混入主播流
- 普通观众看到主播 + 连麦观众的合成画面
- 支持 CDN 分发（降低服务端带宽）

#### 系统架构

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              直播连麦系统                                              │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│   主播端                           服务端                                             观众端 xN    │
│   ┌─────────────┐                ┌─────────────┐                                    │
│   │ 推流: 1080p  │───────────────►│   MCU/SFU    │                                    │
│   │ 音频 + 视频  │   WebRTC       │   服务器     │                                    │
│   └─────────────┘                └──────┬──────┘                                    │
│                                         │                                           │
│   ┌─────────────┐                ┌──────┴──────┐              ┌─────────────┐       │
│   │ 连麦观众 A   │◄──────────────►│  连麦房间    │◄────────────►│ 连麦观众 B   │       │
│   │ 720p 音视频  │   WebRTC P2P   │  (最多 4 人) │   WebRTC P2P  │ 720p 音视频  │       │
│   └─────────────┘                └──────┬──────┘              └─────────────┘       │
│                                         │                                            │
│                                         ▼                                            │
│                              ┌─────────────────────┐                                 │
│                              │    媒体处理服务       │                                 │
│                              │  - 混音（主播+连麦）  │                                 │
│                              │  - 混屏（合成布局）    │                                 │
│                              │  - 转码（多清晰度）    │                                 │
│                              └──────────┬──────────┘                                 │
│                                         │                                            │
│                              ┌──────────┴──────────┐                                 │
│                              │      CDN 分发        │                                │
│                              │  - HLS/DASH/FLV     │                                │
│                              │  - 多码率自适应      │                                │
│                              └──────────┬──────────┘                                │
│                                         │                                            │
│                              ┌──────────┴──────────┐                                │
│                              ▼                     ▼                                │
│                        ┌─────────┐           ┌─────────┐                            │
│                        │ 普通观众 │           │ 普通观众 │                            │
│                        │ HLS 播放 │           │ HLS 播放 │                            │
│                        └─────────┘           └─────────┘                            │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

#### 连麦流程

```
1. 主播开播
   主播 → SFU: 推送音视频流
   SFU → CDN: 转发（无连麦时直接转推）

2. 观众申请连麦
   观众 → 信令服务器: apply-mic
   信令服务器 → 主播: mic-request { userId, name }
   
3. 主播同意
   主播 → 信令服务器: accept-mic { userId }
   信令服务器 → 观众: mic-accepted
   
4. 建立 WebRTC 连接
   观众 ↔ SFU: 建立 WebRTC 连接
   观众 → SFU: 推送音视频
   
5. 混流
   SFU/MCU: 将主播流 + 连麦流混音混屏
   → 生成合成流
   
6. CDN 分发
   合成流 → CDN
   普通观众看到: [主播画面 | 连麦观众画面]
   
7. 结束连麦
   主播/观众 → 信令服务器: end-mic
   SFU: 停止混该观众的流
   恢复单主播画面
```

#### 核心代码

```javascript
// ==================== 主播端 ====================

class LiveHost {
  constructor(roomId, signaling, sfu) {
    this.roomId = roomId;
    this.signaling = signaling;
    this.sfu = sfu;
    this.micUsers = new Map(); // 连麦用户
    this.isLive = false;
  }
  
  async startLive() {
    // 获取媒体
    this.localStream = await navigator.mediaDevices.getUserMedia({
      video: { width: 1920, height: 1080, frameRate: 30 },
      audio: { echoCancellation: true, noiseSuppression: true }
    });
    
    // 推流到 SFU
    await this.sfu.publish('host-main', this.localStream);
    
    this.isLive = true;
    
    // 监听连麦申请
    this.signaling.on('mic-request', (data) => {
      this.showMicRequest(data.userId, data.name);
    });
    
    // 监听连麦用户加入
    this.signaling.on('mic-user-joined', (data) => {
      this.subscribeMicUser(data.userId, data.producerId);
    });
  }
  
  async acceptMic(userId) {
    this.signaling.send({
      type: 'accept-mic',
      roomId: this.roomId,
      userId
    });
  }
  
  async subscribeMicUser(userId, producerId) {
    const stream = await this.sfu.subscribe(producerId);
    this.micUsers.set(userId, stream);
    
    // 通知服务端混流（主播端看到连麦观众）
    this.updateMixLayout();
  }
  
  updateMixLayout() {
    // 根据连麦人数调整布局
    const micCount = this.micUsers.size;
    
    // 通知 MCU 混流布局
    this.signaling.send({
      type: 'update-mix-layout',
      roomId: this.roomId,
      layout: this.getLayoutConfig(micCount)
    });
  }
  
  getLayoutConfig(micCount) {
    // 返回混屏布局配置
    const layouts = {
      0: [{ id: 'host', x: 0, y: 0, w: 1920, h: 1080 }],
      1: [
        { id: 'host', x: 0, y: 0, w: 1280, h: 1080 },
        { id: 'mic-1', x: 1280, y: 270, w: 640, h: 540 }
      ],
      2: [
        { id: 'host', x: 0, y: 0, w: 1280, h: 1080 },
        { id: 'mic-1', x: 1280, y: 0, w: 640, h: 540 },
        { id: 'mic-2', x: 1280, y: 540, w: 640, h: 540 }
      ]
      // ...
    };
    
    return layouts[micCount] || layouts[0];
  }
}

// ==================== 观众端（申请连麦）====================

class LiveViewer {
  constructor(roomId, userId, signaling) {
    this.roomId = roomId;
    this.userId = userId;
    this.signaling = signaling;
    this.isMicMode = false;
  }
  
  // 观看直播（HLS/FLV）
  watchLive(videoElement) {
    // 使用 hls.js 或 flv.js 播放 CDN 流
    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(`https://cdn.example.com/${this.roomId}.m3u8`);
      hls.attachMedia(videoElement);
    }
  }
  
  // 申请连麦
  async applyMic() {
    this.signaling.send({
      type: 'apply-mic',
      roomId: this.roomId,
      userId: this.userId
    });
    
    // 等待主播同意
    this.signaling.once('mic-accepted', async () => {
      await this.startMic();
    });
  }
  
  async startMic() {
    this.isMicMode = true;
    
    // 获取媒体（连麦用较低分辨率）
    this.localStream = await navigator.mediaDevices.getUserMedia({
      video: { width: 640, height: 480, frameRate: 20 },
      audio: true
    });
    
    // 建立与 SFU 的 WebRTC 连接
    this.pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });
    
    this.localStream.getTracks().forEach(track => {
      this.pc.addTrack(track, this.localStream);
    });
    
    // 与 SFU 进行 SDP 交换
    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);
    
    this.signaling.send({
      type: 'mic-offer',
      roomId: this.roomId,
      sdp: offer.sdp
    });
    
    this.signaling.on('mic-answer', async (data) => {
      await this.pc.setRemoteDescription(new RTCSessionDescription({
        type: 'answer',
        sdp: data.sdp
      }));
    });
  }
  
  // 结束连麦
  endMic() {
    this.signaling.send({
      type: 'end-mic',
      roomId: this.roomId,
      userId: this.userId
    });
    
    if (this.pc) {
      this.pc.close();
      this.pc = null;
    }
    
    this.isMicMode = false;
  }
}
```

---

## 五、代码题

---

### 题目 1：手写 RTCPeerConnection 封装

**难度：** ⭐⭐⭐⭐

**要求：** 封装一个 `Peer` 类，封装 RTCPeerConnection 的常用操作，支持：
- 创建/关闭连接
- 添加/移除媒体轨道
- 发起/接收呼叫
- ICE Candidate 自动交换
- 连接状态监听

**参考答案：**

```javascript
class Peer {
  constructor(options = {}) {
    this.config = {
      iceServers: options.iceServers || [
        { urls: 'stun:stun.l.google.com:19302' }
      ],
      ...options.pcConfig
    };
    
    this.signaling = options.signaling; // 信令发送函数
    this.pc = null;
    this.localStream = null;
    this.remoteStream = null;
    
    // 事件回调
    this.onRemoteStream = options.onRemoteStream || (() => {});
    this.onConnectionStateChange = options.onConnectionStateChange || (() => {});
    this.onError = options.onError || console.error;
  }
  
  // 创建 RTCPeerConnection
  createPeerConnection() {
    this.pc = new RTCPeerConnection(this.config);
    
    // ICE Candidate 处理
    this.pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendSignal({
          type: 'ice-candidate',
          candidate: event.candidate
        });
      }
    };
    
    // 接收远端流
    this.pc.ontrack = (event) => {
      this.remoteStream = event.streams[0];
      this.onRemoteStream(this.remoteStream);
    };
    
    // 连接状态变化
    this.pc.onconnectionstatechange = () => {
      this.onConnectionStateChange(this.pc.connectionState);
    };
    
    // ICE 状态变化
    this.pc.oniceconnectionstatechange = () => {
      if (this.pc.iceConnectionState === 'failed') {
        this.restartIce();
      }
    };
    
    // 需要协商（如添加/移除轨道）
    this.pc.onnegotiationneeded = async () => {
      try {
        await this.makeOffer();
      } catch (err) {
        this.onError('negotiationneeded error:', err);
      }
    };
    
    return this.pc;
  }
  
  // 添加本地流
  async addStream(stream) {
    this.localStream = stream;
    
    if (!this.pc) {
      this.createPeerConnection();
    }
    
    stream.getTracks().forEach(track => {
      this.pc.addTrack(track, stream);
    });
  }
  
  // 移除所有轨道
  removeStream() {
    if (this.pc) {
      this.pc.getSenders().forEach(sender => {
        this.pc.removeTrack(sender);
      });
    }
    
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
  }
  
  // 替换轨道（如切换摄像头）
  async replaceTrack(oldTrack, newTrack) {
    const sender = this.pc.getSenders().find(s => s.track === oldTrack);
    if (sender) {
      await sender.replaceTrack(newTrack);
    }
  }
  
  // 创建并发送 Offer
  async makeOffer() {
    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);
    
    this.sendSignal({
      type: 'offer',
      sdp: offer.sdp
    });
  }
  
  // 创建并发送 Answer
  async makeAnswer() {
    const answer = await this.pc.createAnswer();
    await this.pc.setLocalDescription(answer);
    
    this.sendSignal({
      type: 'answer',
      sdp: answer.sdp
    });
  }
  
  // 处理收到的信令消息
  async handleSignal(message) {
    try {
      switch (message.type) {
        case 'offer':
          if (!this.pc) this.createPeerConnection();
          await this.pc.setRemoteDescription(new RTCSessionDescription({
            type: 'offer',
            sdp: message.sdp
          }));
          await this.makeAnswer();
          break;
          
        case 'answer':
          await this.pc.setRemoteDescription(new RTCSessionDescription({
            type: 'answer',
            sdp: message.sdp
          }));
          break;
          
        case 'ice-candidate':
          await this.pc.addIceCandidate(new RTCIceCandidate(message.candidate));
          break;
          
        default:
          console.warn('Unknown signal type:', message.type);
      }
    } catch (err) {
      this.onError('handleSignal error:', err);
    }
  }
  
  // ICE Restart
  async restartIce() {
    if (!this.pc) return;
    
    try {
      if (this.pc.restartIce) {
        this.pc.restartIce();
      }
      
      const offer = await this.pc.createOffer({ iceRestart: true });
      await this.pc.setLocalDescription(offer);
      
      this.sendSignal({
        type: 'offer',
        sdp: offer.sdp,
        iceRestart: true
      });
    } catch (err) {
      this.onError('restartIce error:', err);
    }
  }
  
  // 获取连接统计
  async getStats() {
    if (!this.pc) return null;
    return await this.pc.getStats();
  }
  
  // 关闭连接
  close() {
    if (this.pc) {
      this.pc.close();
      this.pc = null;
    }
    
    this.removeStream();
    this.remoteStream = null;
  }
  
  // 发送信令
  sendSignal(data) {
    if (this.signaling) {
      this.signaling(data);
    }
  }
}

// ==================== 使用示例 ====================

// const peer = new Peer({
//   signaling: (data) => ws.send(JSON.stringify(data)),
//   onRemoteStream: (stream) => {
//     remoteVideo.srcObject = stream;
//   },
//   onConnectionStateChange: (state) => {
//     console.log('Connection state:', state);
//   }
// });

// // 发起呼叫
// const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
// localVideo.srcObject = stream;
// await peer.addStream(stream);
// await peer.makeOffer();

// // 接收信令
// ws.onmessage = (event) => {
//   const msg = JSON.parse(event.data);
//   peer.handleSignal(msg);
// };
```

---

### 题目 2：实现一个简单的信令交换

**难度：** ⭐⭐⭐

**要求：** 使用 WebSocket 实现一个信令服务器和客户端，支持：
- 房间管理（加入/离开）
- SDP Offer/Answer 转发
- ICE Candidate 转发
- 简单的 1v1 呼叫流程

**参考答案：**

```javascript
// ==================== 服务端 (Node.js) ====================

const WebSocket = require('ws');
const http = require('http');

const server = http.createServer();
const wss = new WebSocket.Server({ server });

// 房间管理
const rooms = new Map();

function getOrCreateRoom(roomId) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      id: roomId,
      clients: new Map(), // userId -> ws
      messages: []
    });
  }
  return rooms.get(roomId);
}

function broadcast(room, message, excludeUserId = null) {
  const data = JSON.stringify(message);
  room.clients.forEach((ws, userId) => {
    if (userId !== excludeUserId && ws.readyState === WebSocket.OPEN) {
      ws.send(data);
    }
  });
}

wss.on('connection', (ws) => {
  let currentUserId = null;
  let currentRoomId = null;
  
  ws.on('message', (rawData) => {
    try {
      const message = JSON.parse(rawData);
      
      switch (message.type) {
        case 'join': {
          // 加入房间
          const { roomId, userId } = message;
          currentUserId = userId;
          currentRoomId = roomId;
          
          const room = getOrCreateRoom(roomId);
          room.clients.set(userId, ws);
          
          // 通知房间内其他人
          broadcast(room, {
            type: 'user-joined',
            userId,
            userCount: room.clients.size
          }, userId);
          
          // 告诉当前用户房间内已有的人
          const otherUsers = Array.from(room.clients.keys()).filter(id => id !== userId);
          ws.send(JSON.stringify({
            type: 'room-info',
            roomId,
            users: otherUsers
          }));
          
          console.log(`User ${userId} joined room ${roomId}`);
          break;
        }
        
        case 'offer':
        case 'answer':
        case 'ice-candidate': {
          // 转发 WebRTC 信令
          const { targetUserId } = message;
          const room = rooms.get(currentRoomId);
          
          if (room && room.clients.has(targetUserId)) {
            const targetWs = room.clients.get(targetUserId);
            if (targetWs.readyState === WebSocket.OPEN) {
              targetWs.send(JSON.stringify({
                ...message,
                fromUserId: currentUserId
              }));
            }
          }
          break;
        }
        
        case 'call-request': {
          // 呼叫请求
          const { targetUserId } = message;
          const room = rooms.get(currentRoomId);
          
          if (room && room.clients.has(targetUserId)) {
            room.clients.get(targetUserId).send(JSON.stringify({
              type: 'call-request',
              fromUserId: currentUserId
            }));
          }
          break;
        }
        
        case 'call-response': {
          // 呼叫响应（接受/拒绝）
          const { targetUserId, accepted } = message;
          const room = rooms.get(currentRoomId);
          
          if (room && room.clients.has(targetUserId)) {
            room.clients.get(targetUserId).send(JSON.stringify({
              type: 'call-response',
              fromUserId: currentUserId,
              accepted
            }));
          }
          break;
        }
        
        case 'chat': {
          // 文字消息
          const room = rooms.get(currentRoomId);
          if (room) {
            const chatMsg = {
              type: 'chat',
              fromUserId: currentUserId,
              text: message.text,
              timestamp: Date.now()
            };
            room.messages.push(chatMsg);
            broadcast(room, chatMsg);
          }
          break;
        }
        
        default:
          console.warn('Unknown message type:', message.type);
      }
    } catch (err) {
      console.error('Message handling error:', err);
    }
  });
  
  ws.on('close', () => {
    if (currentRoomId && currentUserId) {
      const room = rooms.get(currentRoomId);
      if (room) {
        room.clients.delete(currentUserId);
        
        // 通知其他人
        broadcast(room, {
          type: 'user-left',
          userId: currentUserId,
          userCount: room.clients.size
        });
        
        // 清理空房间
        if (room.clients.size === 0) {
          rooms.delete(currentRoomId);
        }
      }
    }
    
    console.log(`User ${currentUserId} disconnected`);
  });
});

server.listen(8080, () => {
  console.log('Signaling server running on port 8080');
});

// ==================== 客户端 ====================

class SignalingClient {
  constructor(serverUrl) {
    this.ws = new WebSocket(serverUrl);
    this.listeners = new Map();
    this.messageQueue = [];
    
    this.ws.onopen = () => {
      console.log('Connected to signaling server');
      // 发送队列中的消息
      this.messageQueue.forEach(msg => this.ws.send(JSON.stringify(msg)));
      this.messageQueue = [];
    };
    
    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.emit(message.type, message);
    };
    
    this.ws.onclose = () => {
      console.log('Disconnected from signaling server');
      this.emit('disconnected');
    };
  }
  
  join(roomId, userId) {
    this.send({ type: 'join', roomId, userId });
  }
  
  sendOffer(targetUserId, sdp) {
    this.send({ type: 'offer', targetUserId, sdp });
  }
  
  sendAnswer(targetUserId, sdp) {
    this.send({ type: 'answer', targetUserId, sdp });
  }
  
  sendIceCandidate(targetUserId, candidate) {
    this.send({ type: 'ice-candidate', targetUserId, candidate });
  }
  
  sendCallRequest(targetUserId) {
    this.send({ type: 'call-request', targetUserId });
  }
  
  sendCallResponse(targetUserId, accepted) {
    this.send({ type: 'call-response', targetUserId, accepted });
  }
  
  sendChat(text) {
    this.send({ type: 'chat', text });
  }
  
  send(message) {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      this.messageQueue.push(message);
    }
  }
  
  on(event, handler) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(handler);
  }
  
  emit(event, data) {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.forEach(h => h(data));
    }
  }
}

// ==================== 使用示例 ====================

// const signaling = new SignalingClient('ws://localhost:8080');

// // 加入房间
// signaling.join('room-123', 'user-A');

// // 监听事件
// signaling.on('user-joined', (data) => {
//   console.log('User joined:', data.userId);
// });

// signaling.on('offer', (data) => {
//   // 收到 Offer，设置远端描述并创建 Answer
//   pc.setRemoteDescription(new RTCSessionDescription({ type: 'offer', sdp: data.sdp }));
//   // ... 创建 answer 并通过 signaling.sendAnswer 发送
// });

// signaling.on('call-request', (data) => {
//   // 显示接听/拒绝 UI
//   showIncomingCall(data.fromUserId);
// });
```

---

### 题目 3：实现屏幕共享切换

**难度：** ⭐⭐⭐⭐

**要求：** 实现一个函数，在视频通话中切换屏幕共享和摄像头：
- 开始屏幕共享时，替换视频轨道
- 停止屏幕共享时，自动切回摄像头
- 处理用户取消屏幕共享的情况
- 保持音频不受影响

**参考答案：**

```javascript
class ScreenShareManager {
  constructor(peerConnection, localVideoElement) {
    this.pc = peerConnection;
    this.localVideo = localVideoElement;
    
    this.cameraStream = null;      // 摄像头流
    this.screenStream = null;      // 屏幕共享流
    this.isSharingScreen = false;
    this.originalCameraTrack = null;
  }
  
  // 初始化摄像头
  async initCamera(constraints = { video: true, audio: true }) {
    this.cameraStream = await navigator.mediaDevices.getUserMedia(constraints);
    this.originalCameraTrack = this.cameraStream.getVideoTracks()[0];
    
    // 设置本地预览
    this.localVideo.srcObject = this.cameraStream;
    
    // 添加到 PeerConnection
    this.cameraStream.getTracks().forEach(track => {
      this.pc.addTrack(track, this.cameraStream);
    });
    
    return this.cameraStream;
  }
  
  // 开始屏幕共享
  async startScreenShare(options = {}) {
    try {
      // 获取屏幕共享流
      this.screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: options.cursor || 'always',
          displaySurface: options.displaySurface || 'monitor',
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 15 }
        },
        audio: options.audio !== false  // 默认共享系统音频
      });
      
      const screenVideoTrack = this.screenStream.getVideoTracks()[0];
      
      // 找到视频 sender
      const videoSender = this.pc.getSenders().find(sender => 
        sender.track && sender.track.kind === 'video'
      );
      
      if (!videoSender) {
        throw new Error('No video sender found');
      }
      
      // 替换为屏幕共享轨道
      await videoSender.replaceTrack(screenVideoTrack);
      
      // 如果有系统音频，也添加
      const screenAudioTrack = this.screenStream.getAudioTracks()[0];
      if (screenAudioTrack) {
        // 检查是否已有音频 sender
        const audioSender = this.pc.getSenders().find(sender => 
          sender.track && sender.track.kind === 'audio'
        );
        
        if (audioSender) {
          // 可以选择混合或替换
          // 这里简单处理：保持原有麦克风音频
        }
      }
      
      // 更新本地预览（可选：显示屏幕共享预览）
      this.localVideo.srcObject = this.screenStream;
      
      this.isSharingScreen = true;
      
      // 监听用户停止共享（点击浏览器"停止共享"按钮）
      screenVideoTrack.onended = () => {
        console.log('Screen share stopped by user');
        this.stopScreenShare();
      };
      
      return {
        success: true,
        track: screenVideoTrack
      };
      
    } catch (err) {
      console.error('Failed to start screen share:', err);
      return {
        success: false,
        error: err.name,
        message: err.message
      };
    }
  }
  
  // 停止屏幕共享，切回摄像头
  async stopScreenShare() {
    if (!this.isSharingScreen) return;
    
    try {
      // 停止屏幕共享轨道
      if (this.screenStream) {
        this.screenStream.getTracks().forEach(track => track.stop());
        this.screenStream = null;
      }
      
      // 重新获取摄像头（如果之前的已经停止）
      if (!this.cameraStream || this.cameraStream.getVideoTracks().length === 0) {
        this.cameraStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
      }
      
      const cameraVideoTrack = this.cameraStream.getVideoTracks()[0];
      
      // 替换回摄像头轨道
      const videoSender = this.pc.getSenders().find(sender => 
        sender.track && sender.track.kind === 'video'
      );
      
      if (videoSender && cameraVideoTrack) {
        await videoSender.replaceTrack(cameraVideoTrack);
      }
      
      // 恢复本地预览
      this.localVideo.srcObject = this.cameraStream;
      
      this.isSharingScreen = false;
      
      return { success: true };
      
    } catch (err) {
      console.error('Failed to stop screen share:', err);
      return {
        success: false,
        error: err.message
      };
    }
  }
  
  // 切换屏幕共享状态
  async toggleScreenShare(options = {}) {
    if (this.isSharingScreen) {
      return await this.stopScreenShare();
    } else {
      return await this.startScreenShare(options);
    }
  }
  
  // 同时推送屏幕共享 + 摄像头（多轨道）
  async startScreenShareWithCamera() {
    // 保留摄像头轨道，添加新的屏幕共享轨道
    const screenStream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: false
    });
    
    const screenTrack = screenStream.getVideoTracks()[0];
    
    // 添加为新轨道（不是替换）
    this.pc.addTrack(screenTrack, screenStream);
    
    // 监听停止
    screenTrack.onended = () => {
      this.pc.removeTrack(
        this.pc.getSenders().find(s => s.track === screenTrack)
      );
    };
    
    return screenTrack;
  }
  
  // 获取当前状态
  getState() {
    return {
      isSharingScreen: this.isSharingScreen,
      hasCamera: this.cameraStream !== null,
      hasScreen: this.screenStream !== null,
      cameraTrackLabel: this.cameraStream?.getVideoTracks()[0]?.label,
      screenTrackLabel: this.screenStream?.getVideoTracks()[0]?.label
    };
  }
  
  // 清理资源
  dispose() {
    if (this.cameraStream) {
      this.cameraStream.getTracks().forEach(t => t.stop());
    }
    if (this.screenStream) {
      this.screenStream.getTracks().forEach(t => t.stop());
    }
    this.isSharingScreen = false;
  }
}

// ==================== 使用示例 ====================

// const pc = new RTCPeerConnection({ iceServers: [...] });
// const localVideo = document.getElementById('local-video');
// 
// const screenShare = new ScreenShareManager(pc, localVideo);
// 
// // 初始化摄像头
// await screenShare.initCamera();
// 
// // 点击"共享屏幕"按钮
// document.getElementById('share-screen').onclick = async () => {
//   const result = await screenShare.toggleScreenShare({
//     cursor: 'always',
//     audio: true  // 同时共享系统音频
//   });
//   
//   if (result.success) {
//     console.log('Screen sharing started');
//   } else {
//     alert('无法开始屏幕共享: ' + result.message);
//   }
// };
```

---

## 附录：常见面试追问

### 追问 1：WebRTC 和 WebSocket 有什么区别？能互相替代吗？

**答：** 不能替代，是互补关系。

| 维度 | WebRTC | WebSocket |
|------|--------|-----------|
| 传输内容 | 音视频媒体流、二进制数据 | 文本/二进制消息 |
| 传输方式 | P2P（可能经 TURN 中继） | 客户端-服务器 |
| 延迟 | 极低（P2P 直连） | 取决于服务器 |
| 带宽成本 | 低（P2P） | 高（经服务器） |
| 主要用途 | 音视频通话 | 信令、聊天、游戏状态 |

WebRTC 需要 WebSocket 做信令，WebSocket 不能做实时音视频传输。

### 追问 2：WebRTC 能支持多少人同时视频？

**答：** 取决于架构。

- **Mesh**：浏览器端 3-5 人（受限于上行带宽和 CPU）
- **SFU**：服务端决定，通常 50-1000 人
- **MCU**：理论上无上限，但服务端压力大

浏览器端的限制主要是：
- 每个连接独立的编解码开销
- 上行带宽 = (N-1) * 码率
- 下行带宽 = (N-1) * 码率

### 追问 3：WebRTC 的延迟能做到多低？

**答：**

| 场景 | 延迟 |
|------|------|
| 局域网 P2P | 10-30ms |
| 公网 P2P | 50-150ms |
| 经 TURN 中继 | 100-300ms |
| SFU 转发 | 50-200ms |
| MCU 混流 | 200-500ms |

相比 RTMP/HLS（3-10秒延迟），WebRTC 是真正意义上的实时通信。

### 追问 4：Safari 和 Chrome 的 WebRTC 兼容性如何？

**答：**

| 功能 | Chrome | Safari | Firefox |
|------|--------|--------|---------|
| getUserMedia | 支持 | 支持 | 支持 |
| RTCPeerConnection | 支持 | 支持 | 支持 |
| VP8 | 支持 | 不支持（H.264） | 支持 |
| H.264 | 支持 | 支持（硬件加速） | 支持 |
| VP9 | 支持 | 不支持 | 支持 |
| Simulcast | 支持 | 部分支持 | 支持 |
| Insertable Streams | 支持 | 不支持 | 不支持 |
| getDisplayMedia | 支持 | 支持 | 支持 |

**兼容建议：**
- 视频编解码器同时声明 VP8 和 H.264
- 使用 adapter.js 抹平差异
- Safari 注意 autoplay 策略

---

*文档版本: 1.0*
*最后更新: 2026-05-27*
