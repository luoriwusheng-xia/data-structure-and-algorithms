# css原生变量
<script setup>

  import demo03 from './demo/03.vue'

</script>


### root 全局

<<<./demo/01.css

### 某个元素作用域内

<<<./demo/02.css

这种，在 vue中仍然适用， 可以加 `scoped`


### var变量失效

<demo03/>

<<<./demo/03.vue


**失效的原因：**

- css变量定义有问题
- calc 计算需要相同的单位，上面失效是因为，0 没有单位， 所以失效
- var变量在整个作用域内找不到， 作用域可能是父作用的css变量，也有可能是 root 根作用域