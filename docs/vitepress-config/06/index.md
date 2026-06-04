# unocss

在vitepress中接入 `unocss` 是很简单的事情，`vitepress` 底层是 `vite`， `vite`支持的插件，一般是可以直接使用的

```bash
pnpm i unocss -D
```

使用插件

`.vitepress/config.js`

```javascript{8,2}
import { defineConfig } from 'vitepress'
import UnoCSS from 'unocss/vite'

export default defineConfig({
    // vite.config.js 相关的配置
  vite: {
    plugins: [
      UnoCSS()
    ],
  }
})
```

在自定义主题里面引入

`.vitepress/theme/index.js`

```javascript{3}
import DefaultTheme from 'vitepress/theme';

import 'virtual:uno.css';

export default {
  ...DefaultTheme,
  enhanceApp (ctx) {
  },
}
```

