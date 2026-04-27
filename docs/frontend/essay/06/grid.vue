<template>
	<div class="container">
		<div class="box">
			<div v-for="item in 9" :key="item" class="item">{{ item }}</div>
		</div>
	</div>
</template>

<script setup></script>
<style lang="scss" scoped>
@use "sass:math";
@use "sass:list";

.container {
	width: 100%;
	height: 800px;
	background-color: darkgray;
}

.box {
	width: 400px;
	height: 400px;
	margin: 0 auto;
	padding-top: 50px;

	// 网格布局
	display: grid;

	// 设置3行，3列
	grid-template-columns: 1fr 1fr 1fr;
	grid-template-rows: 1fr 1fr 1fr;

	gap: 10px;
	transition: 0.2s;

	.item {
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: pink;
		font-weight: 700;
		font-size: 22px;
		border-radius: 12px;
	}

	// sass 里面的 for 循环
	@for $i from 1 through 10 {
		.item:nth-child(#{$i}) {
			// hsl 里面的第一个取值 0-360
			background: hsl($i * 80, 100%, 74%);
		}
	}
}

// 移入动画, 使用 has 匹配子元素选择器，如果有，则作用在 box 父 class 上
// 这样就可以实现子元素 hover，父元素的样式改变，不然得用 js 实现
@for $i from 0 to 9 {
	.box:has(.item:nth-child(#{$i + 1}):hover) {
		$r: math.floor(math.div($i, 3)) + 1; // 取值1-3
    $c: $i % 3 + 1; // 取值1-3

		// 初始化状态，下面只需要根据当前鼠标 hover 到哪一行，哪一列
		// 将对应的行的占比改为 2fr，列改为 2fr
		$arr: 1fr 1fr 1fr;

		// 动态修改 $arr 的值，比如 $r = 1，则 $arr: 1fr 2fr 1fr
		// 将索引下标为 1 的值改为 2fr
		$rows: list.set-nth($arr, $r, 2fr);
		$columns: list.set-nth($arr, $c, 2fr);

		grid-template-rows: $rows;
		grid-template-columns: $columns;
	}
}
</style>