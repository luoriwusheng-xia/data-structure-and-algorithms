<template>
  <div class="canvas-demo-box">
    <canvas ref="canvasRef" class="demo-canvas" width="800" height="300"></canvas>
    <div class="demo-info">
      <span>实时数据点：{{ dataPoints.length }}</span>
      <span>FPS：{{ fps }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const canvasRef = ref(null)
const dataPoints = ref([])
const fps = ref(0)

let ctx = null
let dpr = 1
let animationId = null
let pushTimer = null
let lastTime = performance.now()
let frameCount = 0

const MAX_POINTS = 300       // 最多保留的数据点数
const PADDING = 40           // 图表边距
const POINT_INTERVAL = 50    // 新增数据点间隔（ms）

/**
 * 生成模拟实时数据：正弦波叠加随机噪声
 */
function fetchData() {
  const now = Date.now() / 1000
  const base = Math.sin(now) * 50
  const noise = (Math.random() - 0.5) * 30
  return 120 + base + noise
}

/**
 * 绘制坐标轴与网格
 */
function drawGrid(width, height) {
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
  ctx.lineWidth = 1
  ctx.beginPath()

  // 横线网格
  for (let i = 1; i < 5; i++) {
    const y = PADDING + ((height - 2 * PADDING) * i) / 5
    ctx.moveTo(PADDING, y)
    ctx.lineTo(width - PADDING, y)
  }

  // 竖线网格
  for (let i = 1; i < 6; i++) {
    const x = PADDING + ((width - 2 * PADDING) * i) / 6
    ctx.moveTo(x, PADDING)
    ctx.lineTo(x, height - PADDING)
  }
  ctx.stroke()

  // 坐标轴
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
  ctx.beginPath()
  ctx.moveTo(PADDING, PADDING)
  ctx.lineTo(PADDING, height - PADDING)
  ctx.lineTo(width - PADDING, height - PADDING)
  ctx.stroke()
}

/**
 * 将数据值映射到 canvas 坐标
 */
function mapValue(value, min, max, drawHeight) {
  return PADDING + drawHeight - ((value - min) / (max - min)) * drawHeight
}

/**
 * 绘制折线：大数据量下避免频繁 DOM 操作，直接走 canvas 绘制
 */
function drawLine(width, height) {
  if (dataPoints.value.length < 2) return

  const drawWidth = width - 2 * PADDING
  const drawHeight = height - 2 * PADDING
  const min = 50
  const max = 200

  ctx.strokeStyle = '#40a9ff'
  ctx.lineWidth = 2
  ctx.lineJoin = 'round'
  ctx.beginPath()

  dataPoints.value.forEach((value, index) => {
    // 等间距分布，旧数据从左侧移出
    const x = PADDING + (index / (MAX_POINTS - 1)) * drawWidth
    const y = mapValue(value, min, max, drawHeight)
    if (index === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  })
  ctx.stroke()

  // 绘制最后一个点的光晕，提示实时性
  const lastValue = dataPoints.value[dataPoints.value.length - 1]
  const lastX = PADDING + drawWidth
  const lastY = mapValue(lastValue, min, max, drawHeight)
  ctx.fillStyle = '#40a9ff'
  ctx.beginPath()
  ctx.arc(lastX, lastY, 4, 0, Math.PI * 2)
  ctx.fill()
}

function render() {
  const canvas = canvasRef.value
  if (!canvas || !ctx) return

  const rect = canvas.getBoundingClientRect()
  const width = rect.width
  const height = rect.height

  // 清空画布
  ctx.clearRect(0, 0, width, height)

  drawGrid(width, height)
  drawLine(width, height)

  // 计算 FPS
  frameCount++
  const now = performance.now()
  if (now - lastTime >= 1000) {
    fps.value = frameCount
    frameCount = 0
    lastTime = now
  }

  animationId = requestAnimationFrame(render)
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

  // 模拟实时数据推送
  pushTimer = setInterval(() => {
    dataPoints.value.push(fetchData())
    if (dataPoints.value.length > MAX_POINTS) {
      dataPoints.value.shift()
    }
  }, POINT_INTERVAL)

  render()
})

onUnmounted(() => {
  if (animationId) cancelAnimationFrame(animationId)
  if (pushTimer) clearInterval(pushTimer)
})
</script>

<style scoped>
.canvas-demo-box {
  text-align: center;
}
.demo-canvas {
  width: 100%;
  max-width: 800px;
  height: 300px;
  border-radius: 8px;
  background: #141414;
}
.demo-info {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-top: 8px;
  color: #888;
  font-size: 14px;
}
</style>
