<template>
  <div class="svgjs-dashboard">
    <div ref="containerRef" class="dashboard-canvas"></div>
    <div class="dashboard-controls">
      <button class="control-btn" @click="randomizeBarData">随机柱状图</button>
      <button class="control-btn" @click="toggleRingHighlight">切换高亮</button>
      <button class="control-btn" @click="addTopologyNode">添加节点</button>
      <button class="control-btn secondary" @click="resetDashboard">重置</button>
    </div>
    <p class="dashboard-tip">
      提示：鼠标悬停查看数值，点击节点可高亮，所有图形均由 @svgdotjs/svg.js v3 驱动。
    </p>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const containerRef = ref(null)
let SVG = null
let draw = null
let barGroup = null
let ringGroup = null
let topoGroup = null
let tooltip = null
let animationTimer = null
let ringSegments = []
let barRects = []
let nodes = []
let links = []
let highlightIndex = -1

async function loadSvgJs() {
  // 通过 jsdelivr ESM CDN 加载 svg.js v3.x，保持案例零依赖
  const mod = await import('https://cdn.jsdelivr.net/npm/@svgdotjs/svg.js@3.2.4/+esm')
  return mod.SVG
}

function createTooltip(draw) {
  const group = draw.group().addClass('svg-tooltip').hide()
  group.rect(120, 34).radius(4).fill('rgba(15, 23, 42, 0.9)').stroke({ width: 1, color: '#334155' })
  group.text('').move(10, 9).fill('#f8fafc').font({ size: 13, family: 'Roboto Mono, monospace' })
  return group
}

function showTooltip(text, x, y) {
  if (!tooltip) return
  tooltip.show()
  tooltip.findOne('text').text(text)
  // 限制 tooltip 不超出画布右边界
  const canvasBox = draw.node.viewBox.baseVal
  const tx = Math.min(x + 12, canvasBox.width - 130)
  const ty = Math.max(y - 40, 0)
  tooltip.move(tx, ty)
}

function hideTooltip() {
  tooltip?.hide()
}

function initDashboard() {
  if (!containerRef.value) return

  draw = SVG().addTo(containerRef.value).size('100%', 420).viewbox(0, 0, 800, 420)
  draw.rect(800, 420).fill('#0f172a').radius(8)

  // 标题
  draw.text('SVG.js 实时数据看板')
    .move(24, 18)
    .fill('#f8fafc')
    .font({ size: 18, weight: 'bold', family: 'Noto Sans SC, sans-serif' })

  tooltip = createTooltip(draw)

  initBarChart()
  initRingChart()
  initTopology()
  startPulseAnimation()
}

function initBarChart() {
  barGroup = draw.group().move(24, 60)
  barGroup.text('本周销售额（万元）')
    .move(0, -24)
    .fill('#94a3b8')
    .font({ size: 13, family: 'Noto Sans SC, sans-serif' })

  const labels = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  const colors = ['#3b82f6', '#3b82f6', '#3b82f6', '#3b82f6', '#3b82f6', '#8b5cf6', '#8b5cf6']
  const data = labels.map(() => Math.floor(Math.random() * 60 + 20))

  const chartWidth = 320
  const chartHeight = 180
  const barWidth = 32
  const gap = (chartWidth - barWidth * labels.length) / (labels.length - 1)

  // 坐标轴
  barGroup.line(0, chartHeight, chartWidth, chartHeight).stroke({ width: 1, color: '#334155' })
  barGroup.line(0, 0, 0, chartHeight).stroke({ width: 1, color: '#334155' })

  barRects = data.map((value, i) => {
    const x = i * (barWidth + gap)
    const height = (value / 100) * chartHeight
    const y = chartHeight - height

    const bar = barGroup.rect(barWidth, 0)
      .move(x, chartHeight)
      .fill(colors[i])
      .radius(4)
      .data('value', value)
      .data('label', labels[i])

    // 初始动画
    bar.animate(800, i * 80).size(barWidth, height).move(x, y)

    // 交互
    bar.on('mouseenter', () => {
      bar.stroke({ width: 2, color: '#ffffff' }).scale(1.05, 1.05)
      const box = bar.bbox()
      showTooltip(`${labels[i]}: ${value}万`, x + box.x + 24, y + box.y + 60)
    })
    bar.on('mouseleave', () => {
      bar.stroke({ width: 0 }).scale(1, 1)
      hideTooltip()
    })

    // 底部标签
    barGroup.text(labels[i])
      .move(x + barWidth / 2, chartHeight + 8)
      .fill('#64748b')
      .font({ size: 11, anchor: 'middle' })

    return { el: bar, x, y, height, value, label: labels[i] }
  })
}

function randomizeBarData() {
  if (!barRects.length) return
  const chartHeight = 180
  barRects.forEach((item) => {
    const value = Math.floor(Math.random() * 70 + 15)
    const height = (value / 100) * chartHeight
    const y = chartHeight - height
    item.value = value
    item.el.data('value', value)
    item.el.animate(600).size(32, height).move(item.x, y)
  })
}

function initRingChart() {
  ringGroup = draw.group().move(420, 70)
  ringGroup.text('渠道占比')
    .move(0, -30)
    .fill('#94a3b8')
    .font({ size: 13, family: 'Noto Sans SC, sans-serif' })

  const data = [
    { name: '直营', value: 35, color: '#3b82f6' },
    { name: '分销', value: 25, color: '#10b981' },
    { name: '电商', value: 20, color: '#f59e0b' },
    { name: '其他', value: 20, color: '#64748b' },
  ]

  const cx = 90
  const cy = 90
  const radius = 75
  const innerRadius = 48
  let currentAngle = -Math.PI / 2
  const total = data.reduce((sum, d) => sum + d.value, 0)

  ringSegments = data.map((item, i) => {
    const angle = (item.value / total) * Math.PI * 2
    const start = currentAngle
    const end = currentAngle + angle
    currentAngle = end

    const path = describeArc(cx, cy, radius, innerRadius, start, end)
    const segment = ringGroup.path(path)
      .fill(item.color)
      .stroke({ width: 1, color: '#0f172a' })
      .data('name', item.name)
      .data('value', item.value)
      .style('cursor', 'pointer')

    segment.on('mouseenter', () => {
      segment.scale(1.08, 1.08, cx, cy)
      showTooltip(`${item.name}: ${item.value}%`, 420 + cx, 70 + cy - 30)
    })
    segment.on('mouseleave', () => {
      segment.scale(1, 1, cx, cy)
      hideTooltip()
    })

    return { el: segment, start, end, item }
  })

  // 中心文字
  ringGroup.text('100%')
    .move(cx, cy)
    .fill('#f8fafc')
    .font({ size: 18, weight: 'bold', anchor: 'middle', leading: '0.4em' })
}

function describeArc(cx, cy, outerR, innerR, start, end) {
  const startOuter = polar(cx, cy, outerR, end)
  const endOuter = polar(cx, cy, outerR, start)
  const startInner = polar(cx, cy, innerR, end)
  const endInner = polar(cx, cy, innerR, start)
  const largeArc = end - start > Math.PI ? 1 : 0

  return [
    'M', startOuter.x, startOuter.y,
    'A', outerR, outerR, 0, largeArc, 0, endOuter.x, endOuter.y,
    'L', endInner.x, endInner.y,
    'A', innerR, innerR, 0, largeArc, 1, startInner.x, startInner.y,
    'Z',
  ].join(' ')
}

function polar(cx, cy, r, angle) {
  return {
    x: cx + r * Math.cos(angle),
    y: cy + r * Math.sin(angle),
  }
}

function toggleRingHighlight() {
  if (!ringSegments.length) return
  highlightIndex = (highlightIndex + 1) % ringSegments.length
  ringSegments.forEach((seg, i) => {
    if (i === highlightIndex) {
      seg.el.animate(300).scale(1.1, 1.1, 90, 90)
      seg.el.stroke({ width: 2, color: '#ffffff' })
    } else {
      seg.el.animate(300).scale(1, 1, 90, 90)
      seg.el.stroke({ width: 1, color: '#0f172a' })
    }
  })
}

function initTopology() {
  topoGroup = draw.group().move(600, 70)
  topoGroup.text('服务拓扑')
    .move(0, -30)
    .fill('#94a3b8')
    .font({ size: 13, family: 'Noto Sans SC, sans-serif' })

  const positions = [
    { x: 80, y: 30, label: 'Gateway' },
    { x: 40, y: 90, label: 'Service A' },
    { x: 120, y: 90, label: 'Service B' },
    { x: 80, y: 150, label: 'Database' },
  ]

  // 连线
  const connections = [[0, 1], [0, 2], [1, 3], [2, 3]]
  links = connections.map(([a, b]) => {
    const p1 = positions[a]
    const p2 = positions[b]
    return topoGroup.line(p1.x, p1.y, p2.x, p2.y)
      .stroke({ width: 2, color: '#334155' })
  })

  // 节点
  nodes = positions.map((pos, i) => {
    const nodeGroup = topoGroup.group().style('cursor', 'pointer')
    const circle = nodeGroup.circle(36)
      .center(pos.x, pos.y)
      .fill(i === 0 ? '#8b5cf6' : '#3b82f6')
      .stroke({ width: 2, color: '#ffffff' })

    nodeGroup.text(pos.label)
      .move(pos.x, pos.y + 26)
      .fill('#cbd5e1')
      .font({ size: 11, anchor: 'middle' })

    nodeGroup.on('mouseenter', () => {
      circle.animate(200).radius(22).fill('#f59e0b')
      links.forEach((link, li) => {
        const [a, b] = connections[li]
        if (a === i || b === i) {
          link.stroke({ width: 3, color: '#f59e0b' })
        }
      })
    })
    nodeGroup.on('mouseleave', () => {
      circle.animate(200).radius(18).fill(i === 0 ? '#8b5cf6' : '#3b82f6')
      links.forEach((link) => link.stroke({ width: 2, color: '#334155' }))
    })

    return { el: nodeGroup, x: pos.x, y: pos.y }
  })
}

function addTopologyNode() {
  if (!topoGroup || nodes.length >= 8) return
  const last = nodes[nodes.length - 1]
  const x = Math.max(20, Math.min(140, last.x + (Math.random() - 0.5) * 80))
  const y = Math.max(20, Math.min(180, last.y + (Math.random() - 0.5) * 60))

  const nodeGroup = topoGroup.group().style('cursor', 'pointer')
  const circle = nodeGroup.circle(36)
    .center(x, y)
    .fill('#10b981')
    .stroke({ width: 2, color: '#ffffff' })
    .opacity(0)
    .animate(400)
    .opacity(1)

  nodeGroup.text(`Node ${nodes.length}`)
    .move(x, y + 26)
    .fill('#cbd5e1')
    .font({ size: 11, anchor: 'middle' })

  const link = topoGroup.line(last.x, last.y, x, y)
    .stroke({ width: 2, color: '#334155' })
  links.push(link)

  nodeGroup.on('mouseenter', () => circle.animate(200).radius(22).fill('#f59e0b'))
  nodeGroup.on('mouseleave', () => circle.animate(200).radius(18).fill('#10b981'))

  nodes.push({ el: nodeGroup, x, y })
}

function startPulseAnimation() {
  animationTimer = setInterval(() => {
    ringSegments.forEach((seg, i) => {
      if (i === highlightIndex) return
      const baseScale = 1
      seg.el.animate(600 + i * 100).scale(baseScale + 0.02, baseScale + 0.02, 90, 90)
        .after(() => {
          seg.el.animate(600 + i * 100).scale(baseScale, baseScale, 90, 90)
        })
    })
  }, 2400)
}

function resetDashboard() {
  if (draw) {
    draw.remove()
    draw = null
    ringSegments = []
    barRects = []
    nodes = []
    links = []
    highlightIndex = -1
    clearInterval(animationTimer)
    initDashboard()
  }
}

onMounted(async () => {
  SVG = await loadSvgJs()
  initDashboard()
})

onUnmounted(() => {
  clearInterval(animationTimer)
  draw?.remove()
  draw = null
})
</script>

<style scoped>
.svgjs-dashboard {
  border: 1px solid #1e293b;
  border-radius: 8px;
  padding: 16px;
  background: #020617;
}
.dashboard-canvas {
  width: 100%;
  overflow-x: auto;
}
.dashboard-canvas :deep(svg) {
  display: block;
  max-width: 100%;
  min-width: 640px;
  margin: 0 auto;
}
.dashboard-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
  margin-top: 16px;
}
.control-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  background: #3b82f6;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}
.control-btn:hover {
  background: #2563eb;
}
.control-btn.secondary {
  background: #475569;
}
.control-btn.secondary:hover {
  background: #334155;
}
.dashboard-tip {
  margin-top: 12px;
  text-align: center;
  color: #64748b;
  font-size: 13px;
}
</style>
