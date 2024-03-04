<template>
  <div class="grid-container">
    <div class="left">左侧固定宽度</div>
    <div class="mid">自适应宽度</div>
    <div class="right">右侧固定宽度</div>
  </div>
</template>

<script setup>

</script>

<style lang="scss" scoped>
.grid-container {
  display: grid;

  // minmax 表示 右侧的列，最大是1fr, 最小是80px
  // grid-template-columns: 120px auto minmax(80px, 1fr);
  grid-template-columns: 120px auto 80px;
}

.left {
  background-color: pink;
}

.mid {
  background-color: blue;
}

.right {
  background-color: yellow;
}
</style>