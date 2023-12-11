<template>
	<div>
		<el-icon><StarFilled /></el-icon>{{startCount}}
	</div>
</template>

<script setup>
import { ref } from 'vue'
import StarFilled from 'element-plus'

import { getStartCount } from './task.js'

const startCount = ref()

const init = async () => {
	try {
		let res = getStartCount('gulpjs', 'gulp')
		console.log(res)

    startCount.value = 20
	} catch (error) {}
}

init()
</script>
