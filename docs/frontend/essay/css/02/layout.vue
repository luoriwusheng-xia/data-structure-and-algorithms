<template>
  <div class="article-container">
    <div v-for="(item, index) in article" :key="index" @click="toPage(item)" class="item" :style="getStyle(index)">
      {{ item.text }}
    </div>
  </div>

</template>

<script setup lang="ts">
import { ref } from 'vue'
import {useRouter} from 'vitepress'

const router = useRouter()

const basePath = '/docs/frontend/essay/css/02/example'

const article = ref([
	{
		text: '评分',
		link: '01/',
	},
  {
		text: 'css切换',
		link: '02/',
	},
  // {
	// 	text: '评分',
	// 	link: '01',
	// },
])


const generateRandomColor = () => {
  return `#` + Math.floor(Math.random() * 16777215).toString(16)
}

const generateUniqueColors = () => {
  const colors = new Set()

  while(colors.size < article.value.length) {
    colors.add(generateRandomColor())
  }

  return Array.from(colors)
}

let colors = generateUniqueColors()

const getStyle = (index) => {
  return {
    backgroundColor: colors[index]
  }
}

const toPage = (item) => {
  router.go(`${basePath}/${item.link}`)
}
</script>

<style lang='less' scoped>
.article-container {
  display: grid;

  grid-template-columns: repeat(8, 1fr);
  grid-template-rows: repeat(6, 1fr);
  gap: 10px;

  margin-top: 40px;

  .item {
    height: 48px;
    line-height: 48px;
    border-radius: 12px;
    text-align: center;
    color: #fff;
    font-weight: 600;
    cursor: pointer;
  }
}
</style>
