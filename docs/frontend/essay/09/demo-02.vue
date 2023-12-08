<template>
	<div>
		<ul class="test-2-box">
			<li class="item-2" v-for="item in 4" :key="item">{{ item }}</li>
		</ul>
	</div>
</template>

<script setup>
import { onMounted, nextTick } from 'vue'

onMounted(() => {
	let d1 = document.querySelectorAll('.item-2')
	// NodeList
	console.log(d1)

	let d2 = document.querySelector('.test-2-box')

	// 这也是一个 NodeList
	console.log(d2.childNodes)
	// childNodes 会包含前后空格， 实际页面有4个li, 但是获取到的 childNodes 是6个元素

	// 现在我们给页面添加一个元素，再去访问d1

	setTimeout(() => {
		let newLi = document.createElement('li')

		newLi.className = 'item-2'
		newLi.innerHTML = '我是新创建的'

		newLi.style.color = '#f90'

		d2.appendChild(newLi)

		console.log('旧的', d1) // 长度位4

		// 再重新获取所有的li ，对比d1的个数，是不一样的
		let nNodes = document.querySelectorAll('.item-2')
		console.log('新获取的', nNodes) // 5个
	}, 2000)
})
</script>
