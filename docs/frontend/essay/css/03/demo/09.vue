<template>
  <div>
    <div class="parent">
      <!-- 四方格 -->
      <div class="item">1</div>
      <div class="item">2</div>
      <div class="item">3</div>
      <div class="item">4</div>
      <!-- 右侧的 -->
      <div class="item pink">5</div>
    </div>
  </div>
</template>

<script setup>

</script>

<style lang="scss" scoped>
.parent {
  display: grid;
  width: 200px;
  height: 200px;
  background-color: gray;
  gap: 10px;

  grid-template-rows: auto 50px;
  grid-template-columns: auto auto 50px;
}

.pink {
  background-color: pink;
  grid-template-columns: span 2;
}
</style>