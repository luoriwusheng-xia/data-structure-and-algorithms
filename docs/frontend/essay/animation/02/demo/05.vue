<template>
	<div>
    <hr>
		<div class="box-5 green">repeatDelay</div>

		<el-button @click="run" type="primary">运行</el-button>

    <div>
      重复 + 延迟： 动画先执行一次，然后停顿 repeatDelay 指定的几秒钟， 再执行下一次，再停顿
    </div>
	</div>
</template>

<script setup>
import { gsap } from 'gsap'
const run = () => {
	gsap.to('.box-5', {
		x: 100,
		duration: 1,
    repeat: 3,
    repeatDelay: 1
	})
}
</script>

<style lang="scss" scoped>
.box-5 {
	width: 100px;
	height: 100px;
	margin: 10px 0;
	color: #fff;
}

.green {
	background-color: green;
}

</style>
