<template>
  <div class="grid-container">
    <div>内容-1</div>
    <div>内容-2</div>
    <div>内容-3</div>

    <div>内容-1</div>
    <div>内容-2</div>
    <div>内容-3</div>

    <div>内容-1</div>
    <div>内容-2</div>
    <div>内容-3</div>
  </div>
</template>

<script setup>

</script>

<style lang="scss" scoped>
.grid-container {
  display: grid;

  border: 1px solid #f90;

  // 使用百分比
  // grid-template-columns: 33.33% 33.33% 33.33%;
  // grid-template-rows: 33.33% 33.33% 33.33%;

  // 可以使用 repeat() 简写上面的形式

  grid-template-columns: repeat(3, 33.33%);
  grid-template-rows: repeat(3, 33.33%);

  width: 602px;
  height: 302px;
}

</style>