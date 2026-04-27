<template>
  <div class="demo-box">
    <h2>折线 + 柱状 + 饼图 的 connect 行为</h2>

    <button @click="toggle" :class="['btn', connected ? 'on' : 'off']">
      {{ connected ? '断开联动' : '开启联动' }}
    </button>

    <span class="status" :style="{ color: connected ? '#52c41a' : '#f5222d' }">
      当前：{{ connected ? '已联动（看 dataZoom 和 legend 差异）' : '未联动' }}
    </span>

    <p>💡 提示：开启后试着缩放折线图、点击任意图例</p>

    <div class="box">
      <div class="chart" ref="lineRef"></div>
      <div class="chart" ref="barRef"></div>
      <div class="chart" ref="pieRef"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'

// refs
const lineRef = ref(null)
const barRef = ref(null)
const pieRef = ref(null)

let lineChart, barChart, pieChart
const connected = ref(false)

// 数据
const categories = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
const dataA = [120, 200, 150, 80, 70, 110, 130]
const dataB = [60, 140, 100, 40, 50, 90, 80]

// 初始化
const initCharts = () => {
  lineChart = echarts.init(lineRef.value)
  barChart = echarts.init(barRef.value)
  pieChart = echarts.init(pieRef.value)

  // 折线
  lineChart.setOption({
    title: { text: '折线图（有 dataZoom）', left: 'center', top: 10 },
    legend: { data: ['直接访问', '邮件营销'], bottom: 0 },
    grid: { top: 40, bottom: 60, left: 30, right: 20, containLabel: true },
    dataZoom: [
      { type: 'inside', xAxisIndex: 0 },
      { type: 'slider', xAxisIndex: 0, bottom: 28, height: 16 }
    ],
    xAxis: { type: 'category', data: categories, boundaryGap: false },
    yAxis: { type: 'value' },
    series: [
      { name: '直接访问', type: 'line', data: dataA },
      { name: '邮件营销', type: 'line', data: dataB }
    ]
  })

  // 柱状
  barChart.setOption({
    title: { text: '柱状图（有 dataZoom）', left: 'center', top: 10 },
    legend: { data: ['直接访问', '邮件营销'], bottom: 0 },
    grid: { top: 40, bottom: 60, left: 30, right: 20, containLabel: true },
    dataZoom: [
      { type: 'inside', xAxisIndex: 0 },
      { type: 'slider', xAxisIndex: 0, bottom: 28, height: 16 }
    ],
    xAxis: { type: 'category', data: categories },
    yAxis: { type: 'value' },
    series: [
      { name: '直接访问', type: 'bar', data: dataA },
      { name: '邮件营销', type: 'bar', data: dataB }
    ]
  })

  // 饼图
  pieChart.setOption({
    title: { text: '饼图（无 dataZoom）', left: 'center', top: 10 },
    legend: { data: ['直接访问', '邮件营销'], bottom: 0 },
    series: [{
      type: 'pie',
      radius: '60%',
      data: [
        { name: '直接访问', value: dataA.reduce((a, b) => a + b, 0) },
        { name: '邮件营销', value: dataB.reduce((a, b) => a + b, 0) }
      ]
    }]
  })
}

// 联动开关
const toggle = () => {
  if (connected.value) {
    echarts.disconnect('mix')
  } else {
    lineChart.group = 'mix'
    barChart.group = 'mix'
    pieChart.group = 'mix'
    echarts.connect('mix')
  }
  connected.value = !connected.value
}

// resize
const resize = () => {
  lineChart?.resize()
  barChart?.resize()
  pieChart?.resize()
}

onMounted(() => {
  initCharts()
  window.addEventListener('resize', resize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resize)
  echarts.disconnect('mix')
  lineChart?.dispose()
  barChart?.dispose()
  pieChart?.dispose()
})
</script>

<style scoped>
.demo-box {
  border: 1px solid #e5e6eb;
  border-radius: 12px;
  padding: 20px;
  margin: 20px 0;
  background: #fff;
}

.box {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.chart {
  width: 32%;
  height: 300px;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
}

.btn {
  padding: 8px 20px;
  border: none;
  border-radius: 6px;
  color: #fff;
  cursor: pointer;
  transition: 0.2s;
}

/* 未联动 */
.btn.off {
  background: #f5222d;
}
.btn.off:hover {
  background: #ff4d4f;
}

/* 已联动 */
.btn.on {
  background: #52c41a;
}
.btn.on:hover {
  background: #73d13d;
}

.status {
  margin-left: 10px;
  font-weight: bold;
}
</style>