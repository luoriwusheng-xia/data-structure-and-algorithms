<template>
  <div>
    <div>
    vue3中演示 v-if 与v-for 不可同时使用
    </div>

    <!-- 这里是不允许的，会报错， v-if 优先级高，导致item.value其实不在 v-for的作用域内，会不存在 -->
     <!-- @link https://cn.vuejs.org/guide/essentials/list.html#v-for-with-v-if -->
    <div v-for="item in list"  v-if="item.value > 60">
      <span>{{ item.text }}</span> - <span>{{ item.value }}</span>
    </div>
  </div>
</template>

<script setup>

import {ref} from 'vue'

const list = ref([
  {
    text: '语文',
    value: 80
  },
  {
    text: '数学',
    value: 90
  },
  {
    text: '英语',
    value: 33
  }
])
</script>
