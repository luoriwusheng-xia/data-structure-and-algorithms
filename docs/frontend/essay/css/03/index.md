
# grid

<script setup>
  import demo1 from './demo/01.vue'
  import demo2 from './demo/02.vue'
  import demo3 from './demo/03.vue'
  import demo4 from './demo/04.vue'
  import demo5 from './demo/05.vue'
  import demo6 from './demo/06.vue'
  import demo7 from './demo/07.vue'
  import demo8 from './demo/08.vue'
  import demo9 from './demo/09.vue'
</script>

## 案例

### 基础
<demo1/>

- 从上到下排列，说明，默认 grid 是块级元素

**案例1**

<<<./demo/01.vue

**案例2**

<demo2/>
<<<./demo/02.vue

- display:inline-grid  可以让元素变为行内元素

- 设为网格布局以后，容器子元素（项目）的float、display: inline-block、display: table-cell、vertical-align和column-*等设置都将失效。

### 指定行，列宽高

**案例3**

<demo3/>
<<<./demo/03.vue

### 实现等分效果 repeat + 百分比
**案例4**

实现 3*3 均分的效果

使用 `repeat`实现重复，简化写法

<demo4/>
<<<./demo/04.vue

### 等分布局 fr

<demo5/>
<<<./demo/05.vue

### 圣杯布局

<demo6/>
<<<./demo/06.vue


### 网格线

<demo7/>
<<<./demo/07.vue


### 跨列

<demo8/>
<<<./demo/08.vue

### 魔方布局

<demo9/>
<<<./demo/09.vue

## 参考资料

- [交互式-grid教程](https://www.joshwcomeau.com/css/interactive-guide-to-grid/)
- [CSS Grid 网格布局教程- 阮一峰](http://www.ruanyifeng.com/blog/2019/03/grid-layout-tutorial.html)