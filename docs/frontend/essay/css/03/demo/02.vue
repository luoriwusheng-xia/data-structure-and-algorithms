<template>
	<div>
		<span>左边的元素</span>
		<div class="grid-container" data-desc="容器">
			<div class="grid-item" data-desc="项目">
				<p data-desc="这一层不是项目">1-项目</p>
			</div>
			<div class="grid-item"><p>2-项目</p></div>
			<div class="grid-item"><p>3-项目</p></div>
		</div>

		<span>右边的元素</span>
	</div>
</template>

<script setup></script>

<style lang="scss" scoped>
.grid-container {
	display: inline-grid;
	background-color: pink;
}
</style>
