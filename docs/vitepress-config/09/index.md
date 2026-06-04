# shiki-更改代码主题

vitepress 代码主题 底层依赖 `shiki`

- [shiki-官网](https://shiki-zh-docs.vercel.app/)
- [vitepress 配置 markdown 官网](https://vitepress.dev/zh/reference/site-config#markdown)


.vitepress/config.js

```javascript
export default defineConfig({
   markdown: {
    theme: {
      // 主题从 shiki 官网找，2个单词使用分割线分开
      // 2024-03-12 配置2个主题，目前看是有问题
      light: 'dark-plus',
      dark: 'dark-plus'
    },

    // 或者直接配一个
    theme: 'dark-plus',
   }
})
```


不要使用  markdown.config 这个去配置 `shiki`

目前在 ` "vitepress": "1.0.0-rc.45"`, `"shiki": "^1.1.7"`, 会导致无法显示 代码行号问题

.vitepress/config.js

```javascript
 async config (md) {
    md.use(await Shiki({
      // 2024-03-12 配置2个主题，目前看是有问题， 代码的行号无法正常显示，只显示了1行
      themes: {
        light: 'dark-plus',
        dark: 'dark-plus'
      }
    }))
 }
```

## ts 代码主题提示

```shell
pnpm add @shikijs/vitepress-twoslash -D
```

- [twoslash](https://shiki-zh-docs.vercel.app/packages/vitepress#twoslash)

正常情况下， 应该只安装  `@shikijs/vitepress-twoslash` 就可以了，截止到 2024-03-12 发现不行， Vue SFC 中使用 会报错

```shell
"vue": "^3.4.21"
"vite": "^5.1.6",
"shiki": "^1.1.7",
```

参照 [shiki-zh-docs 官方文档](https://github.com/ifshizuku/shiki-zh-docs/blob/main/package.json) 额外显示安装了 vite 等包


案例代码

```ts twoslash
console.log('hello')
//      ^?
```

在 vue SFC 中的案例

```vue twoslash
<script setup>
import { onMounted, ref } from 'vue'
//                   ^?

// Reactive state.
const count = ref(0)

// Functions that mutate state and trigger updates.
function increment() {
  count.value++
}

// Lifecycle hooks.
onMounted(() => {
  console.log(`The initial count is ${count.value}.`)
})
</script>

<template>
  <button @click="increment">
    Count is: {{ count }}
  </button>
</template>
```

通过 `<<<./case/01.vue` 引入的代码，不支持上面的格式