<template>
  <div class="canvas-demo-box">
    <canvas ref="canvasRef" class="demo-canvas" width="800" height="360"></canvas>
    <div class="demo-actions">
      <el-button type="primary" @click="undo" :disabled="!canUndo">撤销</el-button>
      <el-button type="primary" @click="redo" :disabled="!canRedo">回退</el-button>
      <el-button @click="clearBoard">清空画板</el-button>
      <el-button type="danger" @click="downloadSignature">下载签名</el-button>
    </div>
    <p class="demo-tip">支持鼠标与触摸事件，体验压感笔触；每画完一笔即可撤销 / 回退</p>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'

const canvasRef = ref(null)
let ctx = null
let dpr = 1
let isDrawing = false
let lastPoint = null

const undoStack = ref([])
const redoStack = ref([])

const canUndo = computed(() => undoStack.value.length > 1)
const canRedo = computed(() => redoStack.value.length > 0)

/**
 * 获取事件在 canvas 内的坐标（已考虑 DPR）
 */
function getPoint(e) {
  const canvas = canvasRef.value
  const rect = canvas.getBoundingClientRect()
  const clientX = e.touches ? e.touches[0].clientX : e.clientX
  const clientY = e.touches ? e.touches[0].clientY : e.clientY
  return {
    x: (clientX - rect.left) * dpr,
    y: (clientY - rect.top) * dpr,
    // PointerEvent 提供 pressure，默认 0.5
    pressure: e.pressure !== undefined ? e.pressure : 0.5
  }
}

function startDraw(e) {
  isDrawing = true
  lastPoint = getPoint(e)
}

function draw(e) {
  if (!isDrawing || !ctx || !lastPoint) return
  e.preventDefault()

  const point = getPoint(e)

  ctx.beginPath()
  ctx.moveTo(lastPoint.x, lastPoint.y)
  ctx.lineTo(point.x, point.y)

  // 根据压感动态调整线宽，范围 1~6
  ctx.lineWidth = Math.max(1, point.pressure * 6)
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.strokeStyle = '#40a9ff'
  ctx.stroke()

  lastPoint = point
}

/**
 * 保存当前画布快照到撤销栈，并清空重做栈
 */
function saveSnapshot() {
  const canvas = canvasRef.value
  if (!canvas || !ctx) return
  undoStack.value.push(ctx.getImageData(0, 0, canvas.width, canvas.height))
  redoStack.value = []
}

/**
 * 用快照恢复画布
 */
function restoreSnapshot(imageData) {
  if (!ctx || !imageData) return
  ctx.putImageData(imageData, 0, 0)
}

function endDraw() {
  if (!isDrawing) return
  isDrawing = false
  lastPoint = null
  // 一笔结束后再保存快照，避免连续移动时频繁入栈
  saveSnapshot()
}

function undo() {
  if (!canUndo.value) return
  // 当前状态放入 redo 栈
  redoStack.value.push(undoStack.value.pop())
  // 恢复栈顶状态
  restoreSnapshot(undoStack.value[undoStack.value.length - 1])
}

function redo() {
  if (!canRedo.value) return
  const snapshot = redoStack.value.pop()
  // 当前状态先放入 undo 栈
  undoStack.value.push(snapshot)
  restoreSnapshot(snapshot)
}

function clearBoard() {
  const canvas = canvasRef.value
  if (!canvas || !ctx) return
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  saveSnapshot()
}

function downloadSignature() {
  const canvas = canvasRef.value
  if (!canvas) return
  const link = document.createElement('a')
  link.download = 'signature.png'
  link.href = canvas.toDataURL('image/png')
  link.click()
}

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return

  ctx = canvas.getContext('2d')
  dpr = window.devicePixelRatio || 1
  const rect = canvas.getBoundingClientRect()
  canvas.width = rect.width * dpr
  canvas.height = rect.height * dpr
  ctx.scale(dpr, dpr)

  // 白色背景，签名通常需要白底
  clearBoard()

  // 同时绑定鼠标与触摸事件
  canvas.addEventListener('mousedown', startDraw)
  canvas.addEventListener('mousemove', draw)
  window.addEventListener('mouseup', endDraw)

  canvas.addEventListener('touchstart', startDraw, { passive: false })
  canvas.addEventListener('touchmove', draw, { passive: false })
  window.addEventListener('touchend', endDraw)
})

onUnmounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return
  canvas.removeEventListener('mousedown', startDraw)
  canvas.removeEventListener('mousemove', draw)
  window.removeEventListener('mouseup', endDraw)
  canvas.removeEventListener('touchstart', startDraw)
  canvas.removeEventListener('touchmove', draw)
  window.removeEventListener('touchend', endDraw)
})
</script>

<style scoped>
.canvas-demo-box {
  text-align: center;
}
.demo-canvas {
  width: 100%;
  max-width: 800px;
  height: 360px;
  border-radius: 8px;
  cursor: crosshair;
  background: #ffffff;
  touch-action: none;
}
.demo-actions {
  margin-top: 12px;
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}
.demo-tip {
  margin-top: 8px;
  color: #888;
  font-size: 14px;
}
</style>
