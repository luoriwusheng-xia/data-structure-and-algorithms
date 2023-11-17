<script setup>
import Home from './components/home.vue'
import baseCard from './components/base/index.vue'

import {ref} from 'vue'

let active = ref(0)

const onChangeTab = (index) => active.value = index
</script>

<Home @changeTab='onChangeTab'/>

<template v-if='active === 0'>

## 案例

在这里，您可以找到描述，通常包含代码，这些描述通过推荐的方式对库执行各种操作。

#### 基础

<baseCard></baseCard>

#### 语言

#### 接口

#### 集成

</template>


<template v-if='active === 1'>

## 文档

</template>

<template v-if='active === 2'>

## 在线尝试

<iframe style='border: 0; width: 100%; height: 1000px; overflow-x: auto' src='https://codemirror.net/try/'></iframe>

</template>