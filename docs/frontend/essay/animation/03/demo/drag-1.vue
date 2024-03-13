<template>
	<div class="outer" ref="outerRef">
		<div class="mini-box" ref="boxRef"></div>

		<div class="info-panel">
			<div class="title">信息面板</div>

			<div>
				<div class="item-title">父盒子信息：</div>
				<div>{{ parentBox }}</div>

				<div class="item-title">拖动的盒子的信息</div>
				<div>
					{{ boxInfo }}
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'

// 拖动的目标元素
const boxRef = ref()
// 外层盒子元素，范围
const outerRef = ref()

let isDraging = false
// 鼠标点击下的位置
let offset = reactive({
	x: 0,
	y: 0,
})

let parentBox = ref({
	x: 0,
	y: 0,
	width: 0,
	height: 0,
	top: 0,
	right: 0,
	bottom: 0,
	left: 0,
})

let boxInfo = ref({
	x: 0,
	y: 0,
	width: 0,
	height: 0,
	top: 0,
	right: 0,
	bottom: 0,
	left: 0,
})

const init = () => {
	const range = outerRef.value.getBoundingClientRect()

	parentBox.value = range

	let el = boxRef.value

	let elRange = el.getBoundingClientRect()
	boxInfo.value = elRange

	const onMove = (event) => {
		if (isDraging) {
			event.preventDefault()

			// 计算出物体的左顶点位置
			let left = event.clientX - offset.x
			let top = event.clientY - offset.y

			// 不让物体超出左侧
			if (left < 0) {
				left = 0
			}

			// 不让物体超出上边界
			if (top < 0) {
				top = 0
			}

			if (left + elRange.width >= range.width) {
				// 外层盒子的宽度 减去 物体自身的宽度 = 物体在X轴的 left点的最大值
				left = range.width - elRange.width
			}

			if (top + elRange.height >= range.height) {
				top = range.height - elRange.height
			}

			// 移动物体
			boxRef.value.style.left = left + 'px'
			boxRef.value.style.top = top + 'px'
		}
	}

	const onMoseDown = (event) => {
		event.preventDefault()
		isDraging = true

		// 计算出鼠标点击的位置距离盒子左侧的距离
		offset.x = event.clientX - boxRef.value.offsetLeft
		offset.y = event.clientY - boxRef.value.offsetTop
	}

	const removeEvents = () => {
		isDraging = false
	}

	el.addEventListener('mousedown', onMoseDown)

	// 下面一定要监听 document 否则 鼠标快速滑动，会出现鼠标脱离 拖动元素
	document.addEventListener('mousemove', onMove)
	document.addEventListener('mouseup', removeEvents)
}

onMounted(() => {
	init()
})
</script>

<style lang="scss" scoped>
.outer {
	position: relative;
	width: 500px;
	height: 500px;
	background: #000;
	border: 1px solid #f90;

	.mini-box {
		position: absolute;
		width: 40px;
		height: 40px;
		background-color: aqua;
	}
}

.info-panel {
	width: 100%;
	height: inherit;
	margin-left: 520px;

	.title {
		line-height: 32px;
		background-color: bisque;
		padding-left: 10px;
		margin-bottom: 12px;
	}

	.item-title {
		margin: 20px 0;
		background: #f90;
	}
}
</style>
