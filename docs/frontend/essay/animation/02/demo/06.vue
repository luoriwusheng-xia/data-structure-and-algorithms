<template>
	<div>
		<div ref="parentNodeRef">
			<div class="box box-1" >2s执行完</div>
			<div class="box box-2">3s执行完</div>
			<div class="box box-3">1s执行完</div>
		</div>

		<el-button @click="run" type="primary">运行</el-button>

    <div>
      <p>使用时间线，可以保证动画执行顺序的连贯性</p>
      <p>上面第一个元素先执行，耗时2s, 第二个元素需要3s走完动画，则第3个元素应该在 2 + 3 = 5s的时候，开始执行， 耗时1s, 最快的话也就是第6s，动画结束</p>
      <p></p>
      <p></p>
    </div>
	</div>
</template>

<script setup>
import {ref} from 'vue'
import {gsap} from 'gsap'

// 创建一个时间线
const tl = gsap.timeline()

const parentNodeRef = ref(null)

const run = () => {
  // 避免demo点击过快，DOM还未形成
  if (!parentNodeRef.value || !parentNodeRef.value.children) return

  let el1 = parentNodeRef.value.children[0]
  let el2 = parentNodeRef.value.children[1]
  let el3 = parentNodeRef.value.children[2]
  tl.to(el1, {
    x: 100,
    // 任意改变这里的延迟，不需要修改后面的，时间线会让整个动画连贯
    duration: 2
  })

  tl.to(el2, {
    x: 100,
    duration: 3
  })

  tl.to(el3, {
    x: 100,
    duration: 1
  })
}
</script>

<style lang="scss" scoped>
.box {
	width: 100px;
	height: 100px;
	margin: 15px 0;
}

.box-1 {
	background-color: red;
}

.box-2 {
	background-color: yellow;
}

.box-3 {
	background-color: blue;
  color: #fff;
}
</style>
