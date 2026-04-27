<template>
  <div class="grid-container">
    <div>内容-1-1</div>
    <div>内容-2-2</div>
    <div>内容-3-3</div>

    <div>内容-1-1</div>
    <div>内容-2-2</div>
    <div>内容-3-3</div>

    <div>内容-1-1</div>
    <div>内容-2-2</div>
    <div>内容-3-3</div>

    <div>内容-1-1</div>
    <div>内容-2-2</div>
    <div>内容-3-3</div>
  </div>
</template>

<script setup>

</script>

<style lang="scss" scoped>
@use "sass:math";

.grid-container {
  display: grid;
  gap: 10px;

  // grid-template-columns: repeat(4, 1fr);
  // 给线条命名
  grid-template-columns: [aa] 1fr [bb] 1fr [cc] 1fr [dd] 1fr [ee];
  grid-template-rows: repeat(3, [start] 1fr [end]);

  div {
    line-height: 50px;
  }

  @for $i from 1 through 12 {
    div:nth-child(#{$i}) {
      // sass 生成随机颜色
      background-color: hsla(math.random() * 360, 100%, 50%, 0.7);
    }
  }
}



</style>