<template>
	<div>
		<hr />
		<h3>方案1</h3>
		<h4>text-align: center</h4>
		<div class="wrap">
			<div class="inner-box">内容居中</div>
		</div>

		<!-- 方案2 -->

		<h3>方案-2</h3>
		<h4>grid</h4>

		<div class="grid-box">
			<div>我是内部元素</div>
		</div>
	</div>
</template>

<script setup></script>

<style lang="less" scoped>
.wrap {
	background: pink;
	text-align: center;
	height: 50px;

	.inner-box {
		display: inline;
	}
}

// grid实现
.grid-box {
	display: grid;
	justify-items: center;
	background-color: antiquewhite;
	height: 40px;
}
</style>
