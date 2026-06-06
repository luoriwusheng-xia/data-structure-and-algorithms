<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const canvasRef = ref(null)
let rafId = null

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  let width, height
  let particles = []
  let mouseX = 0, mouseY = 0
  let isMouseActive = false

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
    initParticles()
  }

  const initParticles = () => {
    particles = []
    const spacing = 40
    for (let x = 0; x < width; x += spacing) {
      for (let y = 0; y < height; y += spacing) {
        particles.push({
          x,
          y,
          baseX: x,
          baseY: y,
          vx: 0,
          vy: 0,
        })
      }
    }
  }

  const animate = () => {
    ctx.clearRect(0, 0, width, height)

    // Draw grid lines
    ctx.strokeStyle = 'rgba(0, 212, 170, 0.06)'
    ctx.lineWidth = 0.5
    const spacing = 40

    for (let x = 0; x <= width; x += spacing) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }
    for (let y = 0; y <= height; y += spacing) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }

    // Update and draw particles
    const time = Date.now() * 0.001
    for (const p of particles) {
      // Gentle wave motion
      p.x = p.baseX + Math.sin(time + p.baseY * 0.01) * 2
      p.y = p.baseY + Math.cos(time + p.baseX * 0.01) * 2

      // Mouse interaction
      if (isMouseActive) {
        const dx = mouseX - p.x
        const dy = mouseY - p.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 120) {
          const force = (120 - dist) / 120
          p.x -= dx * force * 0.03
          p.y -= dy * force * 0.03
        }
      }

      // Draw dot
      const alpha = 0.15 + Math.sin(time * 2 + p.baseX * 0.05) * 0.1
      ctx.fillStyle = `rgba(0, 212, 170, ${alpha})`
      ctx.beginPath()
      ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2)
      ctx.fill()
    }

    // Draw connecting lines near mouse
    if (isMouseActive) {
      ctx.strokeStyle = 'rgba(0, 212, 170, 0.08)'
      ctx.lineWidth = 0.5
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i]
        const dx1 = p1.x - mouseX
        const dy1 = p1.y - mouseY
        const d1 = Math.sqrt(dx1 * dx1 + dy1 * dy1)
        if (d1 > 150) continue

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j]
          const dx2 = p2.x - mouseX
          const dy2 = p2.y - mouseY
          const d2 = Math.sqrt(dx2 * dx2 + dy2 * dy2)
          if (d2 > 150) continue

          const dist = Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2)
          if (dist < 60) {
            const alpha = (1 - dist / 60) * 0.15
            ctx.strokeStyle = `rgba(0, 212, 170, ${alpha})`
            ctx.beginPath()
            ctx.moveTo(p1.x, p1.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.stroke()
          }
        }
      }
    }

    rafId = requestAnimationFrame(animate)
  }

  const onMouseMove = (e) => {
    const rect = canvas.getBoundingClientRect()
    mouseX = e.clientX - rect.left
    mouseY = e.clientY - rect.top
    isMouseActive = true
  }

  const onMouseLeave = () => {
    isMouseActive = false
  }

  window.addEventListener('resize', resize)
  canvas.addEventListener('mousemove', onMouseMove)
  canvas.addEventListener('mouseleave', onMouseLeave)

  resize()
  animate()

  onUnmounted(() => {
    window.removeEventListener('resize', resize)
    canvas.removeEventListener('mousemove', onMouseMove)
    canvas.removeEventListener('mouseleave', onMouseLeave)
    if (rafId) cancelAnimationFrame(rafId)
  })
})
</script>

<template>
  <canvas ref="canvasRef" class="tech-bg-canvas"></canvas>
</template>

<style scoped>
.tech-bg-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: auto;
  z-index: 0;
}
</style>
