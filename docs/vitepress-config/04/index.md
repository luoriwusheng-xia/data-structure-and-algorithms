# element-plus

```shell
pnpm add element-plus -S
```

**.vitepress/theme/index.js**
```javascript
import DefaultTheme from 'vitepress/theme';

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

export default {
  ...DefaultTheme,
  enhanceApp (ctx) {
    DefaultTheme.enhanceApp(ctx);

    ctx.app.use(ElementPlus, {
    })
  }
}
```
