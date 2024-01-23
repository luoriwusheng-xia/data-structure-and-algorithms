<template>
	<div>
		<div class="logo"></div>
		<el-button @click="run1()" class="m-y-2" type="danger"> 运行 </el-button>

		<div>同时调整 X 和 Y轴的方向</div>
	</div>
	<hr />
	<div>
		<div class="box">1</div>
		<div class="box">2</div>

		<el-button @click="run2" class="m-y-2" type="danger">运行</el-button>

		<div>使用 translate(300px, 20px) 平移了300px, Y轴平移了20px</div>
		<div>重复2次</div>
	</div>

	<hr />

	<div>
		<div class="green-box"></div>
		<el-button @click="run3" class="m-y-2" type="danger">运行</el-button>
	</div>

	<hr />
	<div>
		<svg id="test-svg" viewBox="0 0 80 80">
			<rect
				class="svg-box"
				fill="green"
				x="0"
				y="35"
				width="15"
				height="15"
				rx="2"
			></rect>
		</svg>

		<el-button @click="run4" class="m-y-2" type="danger">运行</el-button>
		<div>
			操作SVG: 这里修改了 svg元素的属性（颜色和半径），也对元素的位置进行了操作
		</div>
	</div>

</template>

<script setup>
import { gsap } from 'gsap'

const run1 = () => {
	gsap.to('.logo', {
		x: 300,
		y: 20,
	})
}

const run2 = () => {
	// 可以将目标对象传入多个元素，使用数组形式
	let box = document.querySelectorAll('.box')
	gsap.to(box, {
		x: 500,
		// duration: 300,
		// 重复2次， 2次是完整的，从起点到终点
		repeat: 2,
	})
}

const run3 = () => {
	// 多个动画组合
	gsap.to('.green-box', {
		// 2s走完动画
		duration: 2,
		// 移动到 200px
		x: 200,
		// 旋转并移动
		rotation: 360,
	})
}

const run4 = () => {
	gsap.to('.svg-box', {
		// 2s走完动画
		duration: 2,
		x: 40,
		// xPercent: -100,
		attr: {
			fill: '#776655',
			// rx是半径， 这里从2 变成50， 也可以写50%
			rx: '30%',
		},
	})
}




</script>

<style lang="scss" scoped>
.logo {
	width: 100px;
	height: 100px;
	background-color: pink;
}

.box {
	width: 50px;
	height: 50px;
	border-radius: 50%;
	display: flex;
	justify-content: center;
	align-items: center;
	margin-bottom: 20px;

	&:nth-child(1) {
		background-color: green;
	}

	&:nth-child(2) {
		background-color: yellow;
	}
}

.green-box {
	width: 80px;
	height: 80px;
	background-color: green;
}

// svg
#test-svg {
	height: 200px;
	border: solid 2px pink;
}

</style>
