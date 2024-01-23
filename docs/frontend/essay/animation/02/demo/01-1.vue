<template>
	<div>
		<div>操作任意内容，比如我们将一个对象做一个动画更新</div>

		<el-button @click="run5" class="m-y-2" type="danger">运行 </el-button>
	</div>
</template>

<script setup>
import { gsap } from 'gsap'

const run5 = () => {
	const obj = {
		age: 1,
		color: 'red',
	}

	gsap.to(obj, {
		duration: 3,
		age: 100,
		color: 'blue',

		onUpdate: () => {
			console.log(obj)
		},
	})
}
</script>

<style></style>
