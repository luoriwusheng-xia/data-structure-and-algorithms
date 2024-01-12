<template>
	<div>
		<h3>var变量失效案例</h3>

		<div class="test-container">
			<div class="item">你好 - 这里是失效的</div>
		</div>

		<hr />

		<div class="test-container-2">
			<div class="item">这里是有宽度的-成功的</div>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.test-container {
	--x: 0;
	--y: 0;

	background: pink;

	.item {
		width: calc(200px - var(--x));
		height: calc(200px - var(--y));
	}
}

.test-container-2 {
  --x: 0px;
	--y: 0px;

  .item {
		width: calc(200px - var(--x));
		height: calc(200px - var(--y));
    background-color: yellow;
	}
}
</style>
