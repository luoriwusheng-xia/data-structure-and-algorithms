import DefaultTheme from 'vitepress/theme';

import { Sandbox } from 'vitepress-plugin-sandpack';

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

export default {
  ...DefaultTheme,
  enhanceApp (ctx) {
    DefaultTheme.enhanceApp(ctx);
    ctx.app.component('Sandbox', Sandbox);

    ctx.app.use(ElementPlus, {
      // locale
    })
  },
}