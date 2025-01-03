<template>
	<div class="flex gap-4 p-t-10">
		<div v-for="(item, index) in lessons" :key="index" class="item" @click="toPage(item)">
			{{ item.text }}
		</div>
	</div>
</template>

<script setup>
import { ref } from 'vue'
import {useRouter} from 'vitepress'

const router = useRouter()

const lessons = ref([
	{
		text: 'lodash',
		link: 'lodash/',
	},
	{
		text: 'vue2',
		link: 'vue2/',
	},
	{
		text: 'vue3',
		link: 'vue3/',
	},
	{
		text: 'mitt',
		link: 'mitt/',
	},
  {
		text: 'radash',
		link: 'radash/',
	},
	{
		text: '收藏夹',
		link: 'favorites/',
	},
])

const toPage = (item) => {
  router.go('/docs/source-code/'+item.link)
}
</script>

<style lang="scss" scoped>
.item {
	background-color: #615f5f;
	padding: 10px 12px;
	border-radius: 12px;
	text-align: center;
	cursor: pointer;
	color: rgb(5, 245, 253);
	box-shadow: 0 3px 4px 2px #dfdede;
	min-width: 80px;
}
</style>
