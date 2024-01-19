<template>
	<div>
		<div class="box green">先动</div>
		<div class="box purple">延迟1s再动</div>

		<el-button @click="run" type="primary">运行</el-button>
	</div>
</template>

<script setup>
import { gsap } from 'gsap'
const run = () => {
	gsap.to('.green', {
		x: 100,
		duration: 1,
	})

	gsap.to('.purple', {
		x: 100,
		duration: 1,
		delay: 1,
	})
}
</script>

<style lang="scss" scoped>
.box {
	width: 100px;
	height: 100px;
	margin: 10px 0;
	color: #fff;
}

.green {
	background-color: green;
}

.purple {
	background-color: purple;
}
</style>
