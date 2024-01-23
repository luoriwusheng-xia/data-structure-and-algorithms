<template>
	<div>
		<div class="outer-box-canvas">
			<canvas class="canvas-box" width="300" height="300"></canvas>
		</div>
		<el-button @click="run6" class="m-y-2" type="danger">运行 </el-button>
	</div>
</template>

<script setup>
import { gsap } from 'gsap'
const run6 = () => {
	const canvas = document.querySelector('.canvas-box')
	const ctx = canvas.getContext('2d')

	ctx.fillStyle = '#28a92d'

	let position = {
		x: 0,
		y: 0,
	}

	function draw() {
		ctx.clearRect(0, 0, 300, 300)
		ctx.fillRect(position.x, position.y, 100, 100)
	}

	// 这里修改的只是一个对象，并没有直接去改 canvas
	gsap.to(position, {
		x: 200,
		y: 200,
		duration: 4,
		// 在更新函数中，重新绘制canvas

		// 这里不像 DOM一样， canvas需要重新绘制并且清除之前的画布
		onUpdate: draw,
	})
}
</script>

<style lang="scss" scoped>

.outer-box-canvas {
	.canvas-box {
		height: 300px;
		max-height: 300px;
		overflow: visible;
		border: solid 2px red;
	}
}
</style>
