<template>
  <div class="canvas-demo-box">
    <div class="filter-bar">
      <el-button @click="applyFilter('grayscale')">灰度</el-button>
      <el-button @click="applyFilter('invert')">反色</el-button>
      <el-button @click="applyFilter('blur')">模糊</el-button>
      <el-button @click="resetImage">还原</el-button>
    </div>
    <div class="canvas-wrap">
      <canvas ref="canvasRef" class="demo-canvas" width="600" height="400"></canvas>
    </div>
    <p class="demo-tip">使用 getImageData / putImageData 操作像素，实现常见滤镜效果</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const canvasRef = ref(null)
let ctx = null
let dpr = 1
let originalData = null

/**
 * 生成一张 600x400 的测试图片：渐变 + 文字
 * 实际项目中可替换为 Image 对象加载真实图片
 */
function drawTestImage(width, height) {
  // 绘制彩虹渐变背景
  const gradient = ctx.createLinearGradient(0, 0, width, height)
  gradient.addColorStop(0, '#ff4d4f')
  gradient.addColorStop(0.25, '#ffa940')
  gradient.addColorStop(0.5, '#73d13d')
  gradient.addColorStop(0.75, '#40a9ff')
  gradient.addColorStop(1, '#9254de')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  // 绘制文字
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 48px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('Canvas Pixel', width / 2, height / 2 - 30)
  ctx.font = '24px sans-serif'
  ctx.fillText('Image Filter Demo', width / 2, height / 2 + 30)

  // 保存原始像素数据，用于还原
  originalData = ctx.getImageData(0, 0, width * dpr, height * dpr)
}

/**
 * 应用滤镜：直接遍历像素通道
 */
function applyFilter(type) {
  const canvas = canvasRef.value
  if (!canvas || !ctx || !originalData) return

  const width = canvas.width
  const height = canvas.height
  const imageData = ctx.createImageData(width, height)
  const src = originalData.data
  const dst = imageData.data

  for (let i = 0; i < src.length; i += 4) {
    const r = src[i]
    const g = src[i + 1]
    const b = src[i + 2]
    const a = src[i + 3]

    if (type === 'grayscale') {
      // 加权灰度，符合人眼感知
      const gray = r * 0.299 + g * 0.587 + b * 0.114
      dst[i] = dst[i + 1] = dst[i + 2] = gray
      dst[i + 3] = a
    } else if (type === 'invert') {
      dst[i] = 255 - r
      dst[i + 1] = 255 - g
      dst[i + 2] = 255 - b
      dst[i + 3] = a
    } else if (type === 'blur') {
      // 简化版均值模糊：每个像素取自身与右侧像素平均值
      if (i + 4 < src.length) {
        dst[i] = (r + src[i + 4]) / 2
        dst[i + 1] = (g + src[i + 5]) / 2
        dst[i + 2] = (b + src[i + 6]) / 2
        dst[i + 3] = a
      } else {
        dst[i] = r
        dst[i + 1] = g
        dst[i + 2] = b
        dst[i + 3] = a
      }
    }
  }

  ctx.putImageData(imageData, 0, 0)
}

function resetImage() {
  const canvas = canvasRef.value
  if (!canvas || !ctx || !originalData) return
  ctx.putImageData(originalData, 0, 0)
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

  drawTestImage(rect.width, rect.height)
})
</script>

<style scoped>
.canvas-demo-box {
  text-align: center;
}
.filter-bar {
  margin-bottom: 12px;
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}
.canvas-wrap {
  display: inline-block;
}
.demo-canvas {
  width: 100%;
  max-width: 600px;
  height: 400px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}
.demo-tip {
  margin-top: 8px;
  color: #888;
  font-size: 14px;
}
</style>
