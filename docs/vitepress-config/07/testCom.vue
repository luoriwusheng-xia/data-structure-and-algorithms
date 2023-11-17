<template>
	<div class="tag-container">

		<div class="tag" v-for="item in list" :key="item" @click="onClick(item)">
			{{ item }}
		</div>
	</div>
</template>
<script setup>
import { ref } from 'vue'

const list = ref(10)

const onClick = (tag) => {
  alert('你点击的是--'+ tag)
}
</script>
<style lang="less" scoped>
.tag-container {
  display: flex;
}
.tag {
	padding: 4px 10px;
	border: 1px solid greenyellow;
	margin-right: 6px;
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0 0 2px #333;
}
</style>
