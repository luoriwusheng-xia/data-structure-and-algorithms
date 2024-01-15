<template>
	<div class="demo-list">
		<div class="parent-box">
			<div class="item box-1"></div>
			<p>三角形</p>
		</div>
		<div class="parent-box">
			<div class="item box-2"></div>
			<p>梯形</p>
		</div>
		<div class="parent-box">
			<div class="item box-3"></div>
			<p>平行四边形</p>
		</div>
		<div class="parent-box">
			<div class="item box-4"></div>
			<p>菱形</p>
		</div>
		<div class="parent-box">
			<div class="item box-5"></div>
			<p>五边形</p>
		</div>
		<div class="parent-box">
			<div class="item box-6"></div>
			<p></p>
		</div>
		<div class="parent-box">
			<div class="item box-7"></div>
			<p></p>
		</div>
		<div class="parent-box">
			<div class="item box-8"></div>
			<p></p>
		</div>
		<div class="parent-box">
			<div class="item box-9"></div>
			<p></p>
		</div>
		<div class="parent-box">
			<div class="item box-10"></div>
			<p></p>
		</div>
	</div>
</template>

<script setup></script>

<style lang="scss" scoped>
.demo-list {
	display: flex;
	flex-wrap: wrap;
	gap: 20px;
}

.parent-box {
	display: flex;
	flex-direction: column;
	align-items: center;
}
.item {
	width: 60px;
	height: 60px;
	background-color: pink;
	margin: 20px;
}

.box-1 {
	-webkit-clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
	clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
}

.box-2 {
	-webkit-clip-path: polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%);
	clip-path: polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%);
}

.box-3 {
	-webkit-clip-path: polygon(25% 0%, 100% 0%, 75% 100%, 0% 100%);
	clip-path: polygon(25% 0%, 100% 0%, 75% 100%, 0% 100%);
}

.box-4 {
	-webkit-clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
	clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
}
.box-5 {
	-webkit-clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%);
	clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%);
}

.box-6 {
	-webkit-clip-path: polygon(
		50% 0%,
		100% 25%,
		100% 75%,
		50% 100%,
		0% 75%,
		0% 25%
	);
	clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
}

.box-7 {
	-webkit-clip-path: polygon(
		50% 0%,
		90% 20%,
		100% 60%,
		75% 100%,
		25% 100%,
		0% 60%,
		10% 20%
	);
	clip-path: polygon(
		50% 0%,
		90% 20%,
		100% 60%,
		75% 100%,
		25% 100%,
		0% 60%,
		10% 20%
	);
}
</style>
