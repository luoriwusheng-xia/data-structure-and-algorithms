<template>
	<div class="box-container">
		<div class="left">左边</div>
		<div class="right">右边</div>
	</div>
</template>
<style lang="less" scoped>
.box-container {
	display: grid;
	height: 50px;
	grid-template-columns: 120px auto;

	.left {
		background-color: lawngreen;
	}

	.right {
		background-color: aquamarine;
	}
}
</style>
