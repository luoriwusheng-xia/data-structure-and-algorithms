<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const canvasRef = ref(null)
let rafId = null

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  let width, height
  let shapes = []

  const colors = [
    'rgba(249, 115, 22, 0.08)',
    'rgba(37, 99, 235, 0.08)',
    'rgba(245, 158, 11, 0.08)',
    'rgba(236, 72, 153, 0.06)',
    'rgba(16, 185, 129, 0.06)',
  ]

  const resize = () => {
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.parentElement.getBoundingClientRect()
    width = rect.width
    height = rect.height
    canvas.width = width * dpr
    canvas.height = height * dpr
    canvas.style.width = width + 'px'
    canvas.style.height = height + 'px'
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    initShapes()
  }

  const initShapes = () => {
    shapes = []
    const count = Math.floor((width * height) / 25000)
    for (let i = 0; i < count; i++) {
      shapes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: 20 + Math.random() * 80,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        color: colors[Math.floor(Math.random() * colors.length)],
        type: Math.random() > 0.5 ? 'circle' : 'rect',
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.01,
      })
    }
  }

  const animate = () => {
    ctx.clearRect(0, 0, width, height)

    for (const s of shapes) {
      s.x += s.vx
      s.y += s.vy
      s.rotation += s.rotationSpeed

      if (s.x < -s.size) s.x = width + s.size
      if (s.x > width + s.size) s.x = -s.size
      if (s.y < -s.size) s.y = height + s.size
      if (s.y > height + s.size) s.y = -s.size

      ctx.save()
      ctx.translate(s.x, s.y)
      ctx.rotate(s.rotation)
      ctx.fillStyle = s.color

      if (s.type === 'circle') {
        ctx.beginPath()
        ctx.arc(0, 0, s.size / 2, 0, Math.PI * 2)
        ctx.fill()
      } else {
        const half = s.size / 2
        ctx.beginPath()
        ctx.roundRect(-half, -half, s.size, s.size, s.size * 0.2)
        ctx.fill()
      }

      ctx.restore()
    }

    rafId = requestAnimationFrame(animate)
  }

  window.addEventListener('resize', resize)
  resize()
  animate()

  onUnmounted(() => {
    window.removeEventListener('resize', resize)
    if (rafId) cancelAnimationFrame(rafId)
  })
})
</script>

<template>
  <canvas ref="canvasRef" class="vibrant-bg-canvas"></canvas>
</template>

<style scoped>
.vibrant-bg-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}
</style>
