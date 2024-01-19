<template>
    <div ref="easeBoxRef">
      <div class="box box-1">circ.out</div>
      <div class="box box-2">circ.in</div>
      <div class="box box-3">circ.inOut</div>
      <div class="box box-4">step</div>
      <div class="box box-5">back.in</div>
    </div>

    <div>
      <p>back.in 效果就是先出去一点，再往前走</p>
      <p>step 就是一步一步的， 要指定步频， 类似台阶一样</p>
      <p></p>
      <p></p>
      <p></p>
      <p></p>
    </div>

    <div>
      <el-button type="primary" @click="run">运行</el-button>
    </div>
</template>

<script setup>
import {ref} from 'vue'
import {gsap} from 'gsap'

const easeBoxRef = ref(null)

const run = () => {
  const children = easeBoxRef.value.children

  let duration = 3

  gsap.to(children[0], {
    x: 400,
    duration,
    ease: 'circ.out'
  })

  gsap.to(children[1], {
    x: 400,
    duration,
    ease: 'circ.in'
  })

  gsap.to(children[2], {
    x: 400,
    duration,
    ease: 'circ.inOut'
  })

  gsap.to(children[3], {
    x: 400,
    duration,
    ease: 'steps(100)'
  })

  gsap.to(children[4], {
    x: 400,
    duration,
    ease: 'back.in'
  })
}

</script>

<style lang="scss" scoped>
  .box {
    width: 60px;
    height: 60px;
    margin: 10px 0;
    background-color: #eedd22;
  }

</style>