<template>
	<div class="test-page">
		<div class="list-container">
			<div
				v-for="(item, index) in list"
				:key="index"
				class="item"
				:style="{
					backgroundColor: item.color,
					width: item.width,
					height: item.height,
				}"
			></div>

			<div class="pointer"></div>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

function getRandomColor() {
	var letters = '0123456789ABCDEF'
	var color = '#'
	for (var i = 0; i < 6; i++) {
		color += letters[Math.floor(Math.random() * 16)]
	}
	return color
}

/**
 * 随机生成px
 * @param {Number} max
 *
 * 增加一个默认的最小值，避免生成的 div太小了
 */
const getRandomPx = (max, min=100) => {
	return Math.floor(Math.random() * (max - min + 1)) + min + 'px'
}

const list = ref([])

/**
 * 随机产生元素属性
 */
const genList = () => {
	let list = new Array(9).fill('').map(() => {
		return {
			color: getRandomColor(),
			width: getRandomPx(200),
			height: getRandomPx(300),
		}
	})

	return list
}

list.value = genList()

const init = () => {
	const itemList = document.querySelectorAll('.list-container .item')

	const pointer = document.querySelector('.list-container .pointer')

	const listContainer = document.querySelector('.list-container')

	let left = 0
	let top = 0

	// 使用事件代理

	const moveHandler = (e) => {
		if (e.target.classList.contains('item')) {
			// 拿到当前元素
			let currentLeft = e.target.offsetLeft
			let currentTop = e.target.offsetTop

			let currentElWidth = e.target.offsetWidth
			let curretnElHeight = e.target.offsetHeight

			console.log(currentElWidth, curretnElHeight)
			listContainer.style.setProperty('--item-width', `${currentElWidth}px`)
			listContainer.style.setProperty('--item-height', `${curretnElHeight}px`)

			// 给css变量赋值 - css变量在哪个元素的作用域内，就给哪个元素赋值
			if (currentLeft !== left) {
				listContainer.style.setProperty('--x', `${currentLeft}px`)
				left = currentLeft
			}

			if (currentTop !== top) {
				listContainer.style.setProperty('--y', `${currentTop}px`)
				top = currentTop
			}
		}
	}

	listContainer.addEventListener('mousemove', moveHandler)
}

onMounted(() => {
	init()
})
</script>

<style lang="scss" scoped>
.test-page {
	padding: 24px;
}
.list-container {
	// 白线的长度
	--l: 30px;
	// 白框距离元素的间隙
	--g: 10px;
	// 线条的粗细
	--t: 3px;

	// 鼠标移动到某一个元素，相对于外层容器的坐标， list-container 就是它的外层容器
	// 需要注意： 这里虽然是0， 但是不能省略 px, 省略以后，下面的calc计算就会导致结果始终为0
	--x: 0px;
	--y: 0px;

	// 元素的宽度和高度
	--item-width: 200px;
	--item-height: 300px;

	border-radius: 8px;

	// 关键
	position: relative;

	background-color: rgba(129, 127, 127, 0.6);

	display: flex;
	flex-wrap: wrap;
	gap: 20px;

	.item {
		width: var(--item-width);
		height: var(--item-height);
	}

	// 边框

	.pointer {
		// 第一个版本假设，元素的宽度和高度都是固定的，这个就比较简单
		// 第二个版本，假设元素的宽度和高度都是随机宽高， 那么框子的宽度，高度都要随之变化
		// 白色框子的大小
		// --ponter-width: 200px;
		// --ponter-height: 200px;

		position: absolute;

		// 白色边框的宽度，就是 元素的宽度 + 左右两侧的间隙宽度
		width: calc(var(--item-width) + 2 * var(--g));
		height: calc(var(--item-height) + 2 * var(--g));

		// left左边，就是图片相对于容器 .list-container 的坐标 减去一个 间隙
		left: calc(var(--x) - var(--g));
		// top: 就是我们具体某个元素相对于 父容器的top值 减去 一个间隙
		top: calc(var(--y) - var(--g));

		border: var(--t) #f90 solid;

		// 增加过渡
		transition: 0.3s ease-in-out;

    // 4个角的实现代码，上述代码均与这块无关

    background: conic-gradient(
      #fff 0deg,
      #f90 270deg
    );

	}
}
</style>
