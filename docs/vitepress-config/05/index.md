# sandpack

[vitepress-plugin-sandpack 文档](https://vitepress-sandbox.js-bridge.com/)

> sandpack 插件可以在线运行程序代码

```shell
pnpm add vitepress-plugin-sandpack -D

pnpm add markdown-it-container -D
```

### 配置

package.json

```json
{
   "type": "module", // [!code ++]
}

```


**.vitepress/theme/index.js**

```js
import DefaultTheme from 'vitepress/theme'

import { Sandbox } from 'vitepress-plugin-sandpack' // [!code ++]

export default {
	...DefaultTheme,
	enhanceApp(ctx) {
		DefaultTheme.enhanceApp(ctx)
		ctx.app.component('Sandbox', Sandbox) // [!code ++]
	},
}
```



**.vitepress/config.js**

```js
import { defineConfig } from 'vitepress'
import { renderSandbox } from 'vitepress-plugin-sandpack'

export default defineConfig({
	markdown: {
		config(md) {
			md.use(container, 'sandbox', { // [!code ++]
				render(tokens, idx) { // [!code ++]
					return renderSandbox(tokens, idx, 'sandbox') // [!code ++]
				}, // [!code ++]
			})
		},
	},
})
```
让 markdown语法能识别  sandbox 标志

### 使用

因为是在线请求的， 会存在一定几率 超时情况

::: sandbox

```vue /src/App.vue [active]
<template>
	<div>{{ hello }}</div>
</template>

<script setup>
import { ref } from 'vue'

const hello = ref('Hello World!')
</script>
```

```js /src/main.js
import App from './App.vue'
import { createApp } from 'vue'

createApp(App).mount('#app')
```
:::
