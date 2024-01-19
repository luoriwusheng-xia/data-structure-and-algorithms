<template>
    <div>
      <div class="box-1">重复2次，不回弹</div>
      <div class="box-2">重复2次，回弹</div>

      <el-button @click="run" type="danger" class="m-y-2">运行</el-button>
    </div>
</template>

<script setup>
  import {gsap} from 'gsap'

  const run = () => {
    gsap.to('.box-1', {
      repeat: 2,
      duration: 2,
      x: 200,
      rotation: 360
    })

    gsap.to('.box-2', {
      repeat: 2,
      x: 200,
      duration: 2,
      yoyo: true,
      rotation: 360
    })
  }
</script>

<style lang="scss" scoped>
.box-1 {
  width: 200px;
  height: 80px;

  background-color: pink;
}

.box-2 {
  width: 200px;
  height: 80px;
  margin-top: 20px;
  background-color: green;
}
</style>