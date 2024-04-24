<template>
  <div>
    <div class="grid-wrapper">
      <div class="item-1">
        左侧
      </div>
      <div class="item-2">
        右侧-1
      </div>
      <div class="item-3">右侧-2</div>
      <div class="item-4">底部-居中</div>
    </div>
  </div>
</template>

<script setup>

</script>

<style lang="scss" scoped>
.grid-wrapper {
  display: grid;
  grid-template-rows: 1fr 1fr auto;

  grid-template-columns: repeat(2, 1fr);
  font-weight: 700;
  text-align: center;
  color: #fff;

  .item-1 {
    // 这里设置了高度，则右侧的 .item-2, item-3 会平分这里的 80px. 各40px高度
    height: 80px;
    line-height: 80px;
    // 跨2行
    grid-row: span 2;
    background-color: blue;
  }

  .item-2 {
    line-height: 40px;
    background-color: blueviolet;
  }

  .item-3 {
    line-height: 40px;
    background-color: aquamarine;
  }

  .item-4 {
    // 跨2列
    grid-column: span 2;
    background-color: pink;
    text-align: center;
    line-height: 120px;
  }
}
</style>