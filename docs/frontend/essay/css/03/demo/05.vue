<template>
  <div class="grid-container">
    <div style="background: pink;">内容-1</div>
    <div>内容-2</div>
    <div>内容-3</div>

    <div>内容-1</div>
    <div style="background-color: red;">内容-2</div>
    <div>内容-3</div>

    <div>内容-1</div>
    <div>内容-2</div>
    <div style="background-color: yellow;">内容-3</div>
  </div>
</template>

<script setup>

</script>

<style lang="scss" scoped>

.grid-container {
  display: grid;

  width: 300px;
  height: 300px;

  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: repeat(3, 1fr);
}
</style>