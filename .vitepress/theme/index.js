import DefaultTheme from 'vitepress/theme';
// 自定义主题样式
import './index.less';
import 'virtual:uno.css';
// 面试题的样式
import "./interview.less"

// @link https://shiki-zh-docs.vercel.app/packages/vitepress  配置ts悬浮查看类型提示
import TwoslashFloatingVue from '@shikijs/vitepress-twoslash/client'
import '@shikijs/vitepress-twoslash/style.css'

import { Sandbox } from 'vitepress-plugin-sandpack';

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import * as ElementPlusIconsVue from '@element-plus/icons-vue'

export default {
  ...DefaultTheme,
  enhanceApp (ctx) {
    DefaultTheme.enhanceApp(ctx);
    ctx.app.component('Sandbox', Sandbox);

    ctx.app.use(ElementPlus, {
      // locale
    })

    for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
      ctx.app.component(key, component)
    }

    // https://shiki-zh-docs.vercel.app/packages/vitepress
    ctx.app.use(TwoslashFloatingVue)
  },
}