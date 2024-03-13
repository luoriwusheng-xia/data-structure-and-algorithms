# 拖动元素

<script setup>
  import dragDemo from './demo/drag-1.vue'
</script>


- 元素可以拖动
- 在限定的边框内移动
- 原生js实现

## 效果

<dragDemo />

## 代码实现

<<<./demo/drag-1.vue

## 关键点

1. 元素移动的时候，`mousemove` 不能是 目标元素监听， 得用 `document` 监听， 否则在移动过快的时候，发现鼠标和元素脱离了
2. 边界的判断需要针对 父盒子和当前盒子的宽度计算
3. 需要在鼠标按下的时候，就计算出 鼠标距离盒子左边的距离， 还有上边的距离， 得到 `offset`, 在鼠标移动的时候，根据屏幕坐标 `client` 减去这个 `offset`, 得到物体应该移动到 left, top 哪个位置