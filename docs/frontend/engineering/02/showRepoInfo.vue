<template>
	<div class="p-l-4 p-t-4">
		<div class="flex gap-x-4">
			<div>forks 数量： <span class="color-red font-700">{{ formatCount(formModel.forks_count) }}</span></div>
			<div>订阅数量： <span class="color-red font-700">{{ formatCount(formModel.subscribers_count) }}</span></div>
			<div>start 数量： <span class="color-red font-700">{{ formatCount(formModel.stargazers_count) }}</span></div>
		</div>
		<div class="m-y-2">最近更新时间： {{ formModel.updated_at }}</div>
    <hr>
	</div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import dayjs from 'dayjs'

import { getStartCount } from './task.js'

const formModel = ref({
	forks_count: '',
	subscribers_count: '',
	updated_at: '',
	stargazers_count: '',
})

const formatCount = (value) => {
  if (!value) return ''

  return (value / 1000).toFixed(2) + 'k'
}

const init = async () => {
	try {
		let res = await getStartCount('gulpjs', 'gulp')

    if(res.updated_at) {
      res.updated_at = dayjs(res.updated_at).format('YYYY-MM-DD HH:mm:ss')
    }

		Object.keys(formModel.value).forEach((key) => {
			formModel.value[key] = res[key]
		})


	} catch (error) {
    console.log('请求失败');
    console.log(error);
  }
}

onMounted(() => {
  init()
})
</script>
