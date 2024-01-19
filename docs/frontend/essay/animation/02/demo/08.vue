<template>
	<div>
		<div ref="unitBoxRef">
			<div class="box box-1"></div>
			<div class="box box-2"></div>
			<div class="box box-3"></div>
			<div class="box box-4"></div>
			<div class="box box-5"></div>
		</div>

    <el-button @click="run">运行</el-button>
	</div>
</template>

<script setup>
import {ref} from 'vue'
import {gsap} from 'gsap'

const unitBoxRef = ref(null)

const run = () => {
  // let d1 = unitBoxRef.value.children[0]
  gsap.to(unitBoxRef.value.children, {
    x: 200,
    duration: 1,
    stagger: 1
  })
}

</script>

<style lang="scss" scoped>
.box {
  width: 100px;
  height: 100px;
  background-color: pink;
  margin: 10px 0;
}

</style>
