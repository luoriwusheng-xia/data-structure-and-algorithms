import DefaultTheme from 'vitepress/theme';
// 自定义主题样式
// import './index.less';

// 面试题的样式
import "./interview.less"

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