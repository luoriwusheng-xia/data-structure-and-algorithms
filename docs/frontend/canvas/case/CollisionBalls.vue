<template>
  <div class="canvas-demo-box">
    <canvas ref="canvasRef" class="demo-canvas" width="800" height="400"></canvas>
    <div class="demo-actions">
      <el-button @click="addBall">增加小球</el-button>
      <el-button @click="resetBalls">重置</el-button>
    </div>
    <p class="demo-tip">小球之间的弹性碰撞检测与动量守恒模拟</p>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const canvasRef = ref(null)
let ctx = null
let dpr = 1
let animationId = null
let balls = []

class Ball {
  constructor(x, y, r, vx, vy, color) {
    this.x = x
    this.y = y
    this.r = r
    this.vx = vx
    this.vy = vy
    this.color = color
    this.mass = r // 质量简化为半径
  }

  draw(context) {
    context.beginPath()
    context.arc(this.x, this.y, this.r, 0, Math.PI * 2)
    context.fillStyle = this.color
    context.fill()
    // 绘制高光，增加立体感
    context.beginPath()
    context.arc(this.x - this.r * 0.3, this.y - this.r * 0.3, this.r * 0.25, 0, Math.PI * 2)
    context.fillStyle = 'rgba(255, 255, 255, 0.3)'
    context.fill()
  }

  update(width, height) {
    this.x += this.vx
    this.y += this.vy

    // 边界碰撞反弹
    if (this.x - this.r < 0) {
      this.x = this.r
      this.vx = -this.vx
    } else if (this.x + this.r > width) {
      this.x = width - this.r
      this.vx = -this.vx
    }

    if (this.y - this.r < 0) {
      this.y = this.r
      this.vy = -this.vy
    } else if (this.y + this.r > height) {
      this.y = height - this.r
      this.vy = -this.vy
    }
  }
}

/**
 * 处理两球弹性碰撞：基于动量守恒与能量守恒
 */
function resolveCollision(b1, b2) {
  const dx = b2.x - b1.x
  const dy = b2.y - b1.y
  const distance = Math.sqrt(dx * dx + dy * dy)

  // 如果两球重叠，先分离，避免粘连
  if (distance < b1.r + b2.r) {
    const overlap = b1.r + b2.r - distance
    const nx = dx / distance
    const ny = dy / distance
    b1.x -= nx * overlap * 0.5
    b1.y -= ny * overlap * 0.5
    b2.x += nx * overlap * 0.5
    b2.y += ny * overlap * 0.5
  }

  // 速度沿碰撞法线方向分解
  const nx = dx / distance
  const ny = dy / distance

  // 相对速度在法线方向的分量
  const dvx = b1.vx - b2.vx
  const dvy = b1.vy - b2.vy
  const velocityAlongNormal = dvx * nx + dvy * ny

  // 如果正在分离，无需处理
  if (velocityAlongNormal > 0) return

  // 一维弹性碰撞速度交换公式
  const impulse = (2 * velocityAlongNormal) / (b1.mass + b2.mass)
  b1.vx -= impulse * b2.mass * nx
  b1.vy -= impulse * b2.mass * ny
  b2.vx += impulse * b1.mass * nx
  b2.vy += impulse * b1.mass * ny
}

function checkCollisions() {
  for (let i = 0; i < balls.length; i++) {
    for (let j = i + 1; j < balls.length; j++) {
      const b1 = balls[i]
      const b2 = balls[j]
      const dx = b2.x - b1.x
      const dy = b2.y - b1.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      if (distance < b1.r + b2.r) {
        resolveCollision(b1, b2)
      }
    }
  }
}

function createRandomBall(width, height) {
  const colors = ['#ff4d4f', '#ffa940', '#73d13d', '#40a9ff', '#9254de']
  const r = Math.random() * 15 + 10
  return new Ball(
    Math.random() * (width - 2 * r) + r,
    Math.random() * (height - 2 * r) + r,
    r,
    (Math.random() - 0.5) * 6,
    (Math.random() - 0.5) * 6,
    colors[Math.floor(Math.random() * colors.length)]
  )
}

function animate() {
  const canvas = canvasRef.value
  if (!canvas || !ctx) return

  const rect = canvas.getBoundingClientRect()
  const width = rect.width
  const height = rect.height

  // 拖尾效果
  ctx.fillStyle = 'rgba(20, 20, 20, 0.3)'
  ctx.fillRect(0, 0, width, height)

  balls.forEach((ball) => ball.update(width, height))
  checkCollisions()
  balls.forEach((ball) => ball.draw(ctx))

  animationId = requestAnimationFrame(animate)
}

function addBall() {
  const canvas = canvasRef.value
  if (!canvas) return
  const rect = canvas.getBoundingClientRect()
  balls.push(createRandomBall(rect.width, rect.height))
}

function resetBalls() {
  const canvas = canvasRef.value
  if (!canvas) return
  const rect = canvas.getBoundingClientRect()
  balls = []
  for (let i = 0; i < 6; i++) {
    balls.push(createRandomBall(rect.width, rect.height))
  }
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

  resetBalls()
  animate()
})

onUnmounted(() => {
  if (animationId) cancelAnimationFrame(animationId)
})
</script>

<style scoped>
.canvas-demo-box {
  text-align: center;
}
.demo-canvas {
  width: 100%;
  max-width: 800px;
  height: 400px;
  border-radius: 8px;
  background: #141414;
}
.demo-actions {
  margin-top: 12px;
  display: flex;
  justify-content: center;
  gap: 12px;
}
.demo-tip {
  margin-top: 8px;
  color: #888;
  font-size: 14px;
}
</style>
