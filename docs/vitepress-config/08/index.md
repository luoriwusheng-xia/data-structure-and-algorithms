# 编程式使用 Router 和 Route

[vitepress-useRouter 文档地址](https://vitepress.dev/reference/runtime-api#useroute)

```js
<script setup>
import {useRouter, useRoute} from 'vitepress'

const router = useRouter()

// 页面跳转
router.go('/docs/frontend/translation/codemirror/components/base/rollup-bundling')
</script>
```

`useRouter` 等API一定要在setup第一层进行执行，拿到实例， 不能包裹在 方法体里面，否则会执行报错