# vitepress中混合使用vue

[在markdown里面使用vue-vitepress官方文档](https://vitepress.dev/guide/using-vue)

vitepress中是可以直接使用vue组件的

如下

```js
<script setup>
import testCom from './testCom.vue'
import {ref} from 'vue'

let a = ref(1)

</script>

<input v-model='a' class='border  b-red border-style-dashed'>

**这里是markdown语法**
```
<script setup>
  import {ref} from 'vue'
      import testCom from './testCom.vue'

  let a = ref(1)
</script>

<input v-model='a' class='border  b-red border-style-dashed'>

{{a}}

**这里是markdown语法**

上面案例是使用了 `unocss` 写样式


### 从外部导入vue组件
也可以从外部导入一个组件， 但是需要注意的是。一个md文件内，只能有一个 `<script setup>`
也就是说，不管从当前页直接写vue代码还是从外部导入，都只允许有一个 `script`，不要重复定义，会报错

示例：

<testCom></testCom>