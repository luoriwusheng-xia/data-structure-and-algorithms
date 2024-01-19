<template>
    <div>
      <div class="box-3">点</div>

      <el-button @click="run" type="primary" class="m-y-2">运行</el-button>
    </div>
</template>

<script setup>
import {gsap} from 'gsap'

const run = () => {
  gsap.to('.box-3',{
    borderRadius: '50%',
    rotation: 360,
    repeat: -1,
    duration: 3
  })
}
</script>

<style lang="scss" scoped>
  .box-3 {
    width: 80px;
    height: 80px;
    background-color: #43d3bb;
    text-align: center;
    line-height: 80px;
  }
</style>