<template>
    <div class="logo"></div>

    <div>
      <div class="box">1</div>
      <div class="box">2</div>
    </div>

    <div>
      使用 translate(300px, 20px) 平移了300px, Y轴平移了20px
    </div>

    <hr>
    <div class="green-box"></div>
</template>

<script setup>
import {gsap} from 'gsap'

import {onMounted} from 'vue'

const init  = () => {
  gsap.to('.logo', {
    x: 300,
    y: 20
  })


  // 可以将目标对象传入多个元素，使用数组形式

  let box = document.querySelectorAll('.box')

  setTimeout(() => {
    gsap.to(box, {
    x: 500,
    // duration: 300,
    // 重复2次， 2次是完整的，从起点到终点
    repeat: 2
  })
  }, 1500);


  // 多个动画组合
  gsap.to('.green-box', {
    // 2s走完动画
    duration: 2,
    // 移动到 200px
    x: 200,
    // 旋转并移动
    rotation: 360
  })
}

onMounted(() => {

  init()
})
</script>

<style lang="scss" scoped>
  .logo {
    width: 100px;
    height: 100px;
    background-color: pink;
  }

  .box {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 20px;

    &:nth-child(1) {
      background-color: green;
    }

    &:nth-child(2) {
      background-color: yellow;
    }
  }

  .green-box {
    width: 80px;
    height: 80px;
    background-color: green;
  }
</style>