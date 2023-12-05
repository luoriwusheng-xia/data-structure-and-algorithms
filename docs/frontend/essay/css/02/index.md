# 你不需要javascript系列

内容均来源于 [You-Dont-Need-JavaScript](https://github.com/you-dont-need/You-Dont-Need-JavaScript)

## 案例
> 案例顺序均为随机


<script setup>
import layout from './layout.vue'
</script>

<layout></layout>


---

随机颜色生成函数

```js

const generateRandomColor = () => {
  return `#` + Math.floor(Math.random() * 16777215).toString(16)
}

const generateUniqueColors = () => {
  const colors = new Set()

  while(colors.size < article.value.length) {
    colors.add(generateRandomColor())
  }

  return Array.from(colors)
}

let colors = generateUniqueColors()
```
