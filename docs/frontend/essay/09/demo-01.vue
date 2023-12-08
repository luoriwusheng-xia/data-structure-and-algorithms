<template>
	<div>
		<ul class="box">
			<li class="li" v-for="item in 10" :key="item">
				{{ item }}
			</li>
		</ul>
		<hr />
		<h4>原生表单访问</h4>

		<form class="form-container">
			<div>
				<label for="">姓名</label>
				<input type="text" class="name" />
			</div>
			<div class="m-y-2">
				<label for="">年龄</label>
				<input type="text" class="age" />
			</div>
			<div>
				<label for="">密码</label>
				<input type="text" class="passoword" />
			</div>
		</form>
	</div>
</template>

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
	let parentEl = document.querySelector('.box')

	let htmlColletction = document.getElementsByClassName('li')

	// 类型也是一个 HTMLCollection 类型， 类数组
	console.log('删除节点之前： htmlColletction', htmlColletction)

	// 拿到所有的form表单的集合， 类型也是一个 HTMLCollection 类型， 类数组
	console.log(document.forms)

	let tagsList = document.getElementsByTagName('li')

	// 也是 HTMLCollection 类型
	console.log(tagsList)

	// 现在，通过setTimeout删除一个DOM元素， 看看变量 htmlColletction 的个数

	setTimeout(() => {
		let node = document.getElementsByClassName('li')[0]
		console.log('第一个子节点', node)

		parentEl.removeChild(node)

		console.log('重新访问 htmlColletction 变量', htmlColletction)

		// 假设我创建一个DOM, 但是我不显示添加到页面， 我添加到 htmlCollection里面

		let newLi = document.createElement('li')
		newLi.innerHTML = '我是新创建的'
		newLi.style.color = '#f90'

		parentEl.appendChild(newLi)

		// 再次访问 htmlColletction， 发现数量变多了
	}, 2000)
})

const badCode = () => {
	let parentNode = document.getElementsByClassName('box')

	// 假设我们希望复制页面上已经有的 一个DOM集合
	let list = document.getElementsByTagName('li')

	for (let i = 0; i < list.length; i++) {
		const cloned = list[i].cloneNode()

		// 这里有问题， 这里push，会导致 list 一直在变大，
		// 因为 list 是一个 HTMLCollection 类型，是实时的，
		// 我们这里append 一个子元素， list 长度会加+1. 导致for循环卡死
		parentNode.appendChild(cloned)
	}
}
</script>

<style lang="less" scoped>
.form-container {
	line-height: 2em;
	input {
		border: 1px solid #ddd;
		margin-left: 10px;
		border-radius: 8px;
		text-indent: 0.75em;
	}
}
</style>
