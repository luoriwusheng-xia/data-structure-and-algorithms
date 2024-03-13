<template>
	<div>
		<div id="box">
			<div id="content"></div>
		</div>

		<div>
			<div>结果</div>

			<div>offset --> {{ info.offsetWidth }}, {{ info.offsetHeight }}</div>
			<div>client --> {{ info.clientWidth }}, {{ info.clientHeight }}</div>
			<div>scroll --> {{ info.scrollWidth }}, {{ info.scrollHeight }}</div>
		</div>

		<div class="test-btn" @click="getInfo">获取信息</div>
	</div>
</template>

<script setup>
import { onMounted, ref } from 'vue'

const info = ref({
	offsetWidth: '',
	offsetHeight: '',
	clientWidth: '',
	clientHeight: '',
	scrollWidth: '',
	scrollHeight: '',
})

const getInfo = () => {
	var box = document.getElementById('box')
	console.log('offsetWidth:', box.offsetWidth) // 244 (200 + 20*2 + 2* 2)
	console.log('offsetHeight:', box.offsetHeight) // 244 (200 + 20*2 + 2 * 2)

	console.log('clientWidth:', box.clientWidth) // 225 (185 + 20 + 20)
	console.log('clientHeight:', box.clientHeight) // 225 (185 + 20 + 20)

	console.log('scrollWidth:', box.scrollWidth) // 400 (实际内容的宽度 400 + 20 + 20)
  console.log('scrollHeight:', box.scrollHeight) // 400 (实际内容的的高度400 + 20 + 20)

	info.value.offsetWidth = box.offsetWidth
	info.value.offsetHeight = box.offsetHeight

	info.value.clientHeight = box.clientHeight
	info.value.clientWidth = box.clientWidth

	info.value.scrollWidth = box.scrollWidth
	info.value.scrollHeight = box.scrollHeight
}

onMounted(() => {
	getInfo()
})
</script>

<style scoped>
#box {
	width: 200px;
	height: 200px;
	padding: 20px;
	border: 2px solid black;
	overflow: scroll;

  box-sizing: content-box;
	background: pink;
}

#content {
	width: 400px;
	height: 400px;
  box-sizing: content-box;
	background: #eee;
}

.test-btn {
	width: fit-content;
	padding: 6px 10px;
	background: blueviolet;
	color: #fff;
	border-radius: 8px;
}
</style>
