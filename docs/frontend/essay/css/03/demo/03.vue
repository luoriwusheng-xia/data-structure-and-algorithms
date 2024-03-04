<template>
	<div class="grid-container">
		<div style="background-color: red">内容-1</div>
		<div style="background-color: bisque">内容-2</div>
		<div style="background-color: blue">内容-3</div>

		<div style="background-color: yellow">内容-1</div>
		<div style="background-color: violet">内容-2</div>
		<div style="background-color: tomato">内容-3</div>

		<div style="background: gray">内容-1</div>
		<div style="background: goldenrod">内容-2</div>
		<div style="background: sienna">内容-3</div>

		<div style="background-color: aqua">内容-1</div>
		<div style="background: seagreen">内容-2</div>
		<div style="background: slateblue">内容-3</div>
	</div>
</template>

<script setup></script>

<style lang="scss" scoped>
.grid-container {
	display: grid;

	// 定义列宽
	grid-template-columns: 100px 200px 50px;
	// 定义行高
	grid-template-rows: 120px 500px 80px;
}
</style>
