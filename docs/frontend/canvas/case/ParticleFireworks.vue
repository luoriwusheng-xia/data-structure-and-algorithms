<template>
  <div class="canvas-demo-box">
    <canvas ref="canvasRef" class="demo-canvas" width="800" height="400"></canvas>
    <p class="demo-tip">点击画布任意位置触发粒子烟花爆炸</p>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const canvasRef = ref(null)
let ctx = null
let dpr = 1
let animationId = null
let particles = []

/**
 * 粒子类：每个烟花爆炸产生大量粒子
 * 包含位置、速度、重力衰减、生命周期等属性
 */
class Particle {
  constructor(x, y, color) {
    // 初始位置
    this.x = x
    this.y = y
    // 随机角度与速度，形成爆炸散射效果
    const angle = Math.random() * Math.PI * 2
    const speed = Math.random() * 4 + 1
    this.vx = Math.cos(angle) * speed
    this.vy = Math.sin(angle) * speed
    // 重力与阻力，模拟真实运动
    this.gravity = 0.08
    this.friction = 0.96
    // 颜色与透明度
    this.color = color
    this.alpha = 1
    this.decay = Math.random() * 0.015 + 0.01
  }

  update() {
    this.vx *= this.friction
    this.vy *= this.friction
    this.vy += this.gravity
    this.x += this.vx
    this.y += this.vy
    this.alpha -= this.decay
  }

  draw(context) {
    context.save()
    context.globalAlpha = this.alpha
    context.fillStyle = this.color
    context.beginPath()
    // 根据速度动态调整粒子大小，速度越快粒子拖尾越明显
    context.arc(this.x, this.y, Math.max(1, 3 - this.alpha), 0, Math.PI * 2)
    context.fill()
    context.restore()
  }
}

/**
 * 创建一组烟花粒子
 */
function createFirework(x, y) {
  const colors = ['#ff4d4f', '#ffa940', '#73d13d', '#40a9ff', '#9254de', '#ff7875']
  const count = 60
  for (let i = 0; i < count; i++) {
    particles.push(new Particle(x, y, colors[Math.floor(Math.random() * colors.length)]))
  }
}

function animate() {
  const canvas = canvasRef.value
  if (!canvas || !ctx) return

  // 使用半透明矩形覆盖，形成拖尾残影效果
  ctx.fillStyle = 'rgba(15, 23, 42, 0.2)'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  particles = particles.filter((p) => {
    p.update()
    p.draw(ctx)
    return p.alpha > 0
  })

  animationId = requestAnimationFrame(animate)
}

function handleClick(e) {
  const canvas = canvasRef.value
  if (!canvas) return
  const rect = canvas.getBoundingClientRect()
  // 坐标需要乘以 DPR，保证点击位置与 canvas 逻辑坐标一致
  createFirework(
    (e.clientX - rect.left) * dpr,
    (e.clientY - rect.top) * dpr
  )
}

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return

  // 获取 2D 上下文
  ctx = canvas.getContext('2d')
  // 根据设备像素比缩放 canvas，解决高清屏模糊问题
  dpr = window.devicePixelRatio || 1
  const rect = canvas.getBoundingClientRect()
  canvas.width = rect.width * dpr
  canvas.height = rect.height * dpr
  ctx.scale(dpr, dpr)

  // 初始背景
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, rect.width, rect.height)

  // 自动演示一次烟花
  createFirework(rect.width / 2, rect.height / 2)

  canvas.addEventListener('click', handleClick)
  animate()
})

onUnmounted(() => {
  if (animationId) cancelAnimationFrame(animationId)
  canvasRef.value?.removeEventListener('click', handleClick)
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
  cursor: crosshair;
  background: #0f172a;
}
.demo-tip {
  margin-top: 8px;
  color: #888;
  font-size: 14px;
}
</style>
