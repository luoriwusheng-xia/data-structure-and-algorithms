<template>
	<div class="container">
		<div class="box">
			<div v-for="item in 9" :key="item" class="item">{{ item }}</div>
		</div>
	</div>
</template>

<script setup lang="ts"></script>

<style lang="less" scoped>
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

	// less 里面的 for循环需要使用 each + range 进行模拟
	each(range(10), {
	  .item:nth-child(@{index}) {
	    // hsl 里面的第一个取值 0-360
	    background: hsl(@index * 80, 100%, 74%);
	  }
	});
}


// 移入动画, 使用 has匹配子元素选择器，如果有，则作用在 box父 class上， 这样就可以实现， 子元素hover, 父元素的样式改变
// 不然得用js实现
// .box:has(.item:nth-child(1):hover) {
//   // 修改父元素的 grid布局 里面的占比

//   grid-template-columns: 2fr 1fr 1fr;
//   grid-template-rows: 2fr 1fr 1fr;
// }

// .box:has(.item:nth-child(1):hover) {
//   grid-template-rows: 2fr 1fr 1fr;
//   grid-template-columns: 2fr 1fr 1fr;
// }
</style>

<style lang="scss" scoped>
@for $i from 0 to 9 {
	// $i从0开始
	.box:has(.item:nth-child(#{$i + 1}):hover) {
		$r: floor($i / 3 +1); // 取值1-3
		$c: $i % 3 + 1; // 取值1-3

    // 初始化状态， 下面只需要根据当前鼠标 hover到哪一行，哪一列， 将对应的 行的占比 改为 2fr， 列改为2fr
		$arr: 1fr 1fr 1fr;
    // 动态修改 @arr 的值， 比如 $r = 1, 则@arr: 1fr 2fr 1fr;   将索引下标为1的值，改为2fr
		$rows: set-nth($arr, $r, 2fr);
		$columns: set-nth($arr, $c, 2fr);

		grid-template-rows: $rows;
		grid-template-columns: $columns;
	}
}
</style>
