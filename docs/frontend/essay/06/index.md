# 网格布局中的动画

<script setup>
  import grid from './grid.vue'
</script>

<grid />

### 完整代码
<<<./grid.vue

### less 实现循环

```less
// less 里面的 for循环需要使用 each + range 进行模拟
each(range(10), {
  .item:nth-child(@{index}) {
    // hsl 里面的第一个取值 0-360
    background: hsl(@index * 80, 100%, 74%);
  }
});
```

less 无法实现下面sass里面的效果， less 没有 set-nth 设置数组具体下标索引的功能，less不能改变原数组的值。

less 循环的下标索引从1开始， sass从0开始

### sass

```scss
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
```

编译后的结果

```css
.box:has(.item:nth-child(1):hover) {
  grid-template-rows: 2fr 1fr 1fr;
  grid-template-columns: 2fr 1fr 1fr;
}

.box:has(.item:nth-child(2):hover) {
  grid-template-rows: 2fr 1fr 1fr;
  grid-template-columns: 1fr 2fr 1fr;
}

.box:has(.item:nth-child(3):hover) {
  grid-template-rows: 2fr 1fr 1fr;
  grid-template-columns: 1fr 1fr 2fr;
}

.box:has(.item:nth-child(4):hover) {
  grid-template-rows: 1fr 2fr 1fr;
  grid-template-columns: 2fr 1fr 1fr;
}

.box:has(.item:nth-child(5):hover) {
  grid-template-rows: 1fr 2fr 1fr;
  grid-template-columns: 1fr 2fr 1fr;
}

.box:has(.item:nth-child(6):hover) {
  grid-template-rows: 1fr 2fr 1fr;
  grid-template-columns: 1fr 1fr 2fr;
}

.box:has(.item:nth-child(7):hover) {
  grid-template-rows: 1fr 1fr 2fr;
  grid-template-columns: 2fr 1fr 1fr;
}

.box:has(.item:nth-child(8):hover) {
  grid-template-rows: 1fr 1fr 2fr;
  grid-template-columns: 1fr 2fr 1fr;
}

.box:has(.item:nth-child(9):hover) {
  grid-template-rows: 1fr 1fr 2fr;
  grid-template-columns: 1fr 1fr 2fr;
}/*# sourceMappingURL=test.css.map */
```