<template>
  <div>
    <button @click="toggle" :class="['btn', connected ? 'on' : 'off']">
      {{ connected ? '断开联动' : '开启联动' }}
    </button>

    <span
      :style="{ color: connected ? '#52c41a' : '#f5222d', fontWeight: 'bold', marginLeft: '10px' }">
      当前：{{ connected ? '已联动（dataZoom + legend 同步）' : '未联动' }}
    </span>

    <p>
      👇 用鼠标<strong>框选缩放、拖动滑块、或点击图例</strong>，观察另外两张图：
    </p>

    <div class="chart" ref="aRef"></div>
    <div class="chart" ref="bRef"></div>
    <div class="chart" ref="cRef"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'

// DOM refs
const aRef = ref(null)
const bRef = ref(null)
const cRef = ref(null)

// 图表实例
let ca, cb, cc

const connected = ref(false)

// 数据
const data = Array.from({ length: 100 }, (_, i) => [
  `第${i + 1}天`,
  Math.sin(i / 5) * 100 + Math.random() * 30 + 200,
  Math.cos(i / 5) * 80 + Math.random() * 30 + 150,
])

const getOption = (title) => ({
  title: { text: title, left: 'center', top: 10 },
  legend: { data: ['销售额', '利润'], top: 50 },
  grid: { top: 90, bottom: 50,
  left: 30,     // 👈 收紧
  right: 20,    // 👈 收紧
  containLabel: true  // 👈 防止 y轴文字被裁剪（很重要）
   },
  dataZoom: [
    { type: 'inside', xAxisIndex: 0 },
    { type: 'slider', xAxisIndex: 0, bottom: 10, height: 30 }
  ],
  xAxis: { type: 'category', data: data.map(d => d[0]), boundaryGap: false },
  yAxis: { type: 'value', scale: true },
  series: [
    { name: '销售额', type: 'line', smooth: true, data: data.map(d => d[1]) },
    { name: '利润', type: 'line', smooth: true, data: data.map(d => d[2]) }
  ]
})

const initCharts = () => {
  ca = echarts.init(aRef.value)
  cb = echarts.init(bRef.value)
  cc = echarts.init(cRef.value)

  ca.setOption(getOption('图表 A'))
  cb.setOption(getOption('图表 B'))
  cc.setOption(getOption('图表 C'))
}

const toggle = () => {
  if (connected.value) {
    echarts.disconnect('g1')
  } else {
    ca.group = 'g1'
    cb.group = 'g1'
    cc.group = 'g1'
    echarts.connect('g1')
  }
  connected.value = !connected.value
}

const resize = () => {
  ca?.resize()
  cb?.resize()
  cc?.resize()
}

onMounted(() => {
  initCharts()
  window.addEventListener('resize', resize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resize)
  echarts.disconnect('g1')
  ca?.dispose()
  cb?.dispose()
  cc?.dispose()
})
</script>

<style scoped>
.chart {
  width: 100%;
  height: 300px;
  border: 1px solid #ddd;
  margin: 10px 0;
}

button {
  padding: 10px 24px;
  font-size: 16px;
}

button {
  padding: 10px 24px;
  font-size: 16px;
  background-color: #1677ff;
  /* 主色 */
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

/* hover 效果 */
button:hover {
  background-color: #4096ff;
}

/* 点击态 */
button:active {
  background-color: #0958d9;
}

/* 可选：禁用态（以后扩展用） */
button:disabled {
  background-color: #d9d9d9;
  cursor: not-allowed;
}

.btn {
  padding: 10px 24px;
  font-size: 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  color: #fff;
  transition: all 0.2s ease;
}

/* 未联动（红色） */
.btn.off {
  background-color: #f5222d;
}
.btn.off:hover {
  background-color: #ff4d4f;
}

/* 已联动（绿色） */
.btn.on {
  background-color: #52c41a;
}
.btn.on:hover {
  background-color: #73d13d;
}
</style>