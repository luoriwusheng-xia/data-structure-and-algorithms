import { defineConfig } from 'vitepress'

import UnoCSS from 'unocss/vite'
import container from 'markdown-it-container'
import { renderSandbox } from 'vitepress-plugin-sandpack'
import mdItCustomAttrs from 'markdown-it-custom-attrs'

import mathjax3 from 'markdown-it-mathjax3'
import customElements from './md-latex.js'

// 代码语法高亮
import Shiki from '@shikijs/markdown-it'

import { transformerTwoslash } from '@shikijs/vitepress-twoslash'

// 将svg转成组件
import { svg4VuePlugin } from 'vite-plugin-svg4vue'

import nav from './router/nav.js'
// 文档配置
import sidebar from './router/sidebar.js'

import { fileURLToPath } from 'node:url'

// import viteSvgIcons, {createSvgIconsPlugin} from 'vite-plugin-svg-icons';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  // GitHub Pages 项目站点需要挂在仓库名路径下。
  // 发布到 https://luoriwusheng-xia.github.io/data-structure-and-algorithms/ 时，
  // 所有静态资源都会以 /data-structure-and-algorithms/ 作为基础路径。
  base: '/data-structure-and-algorithms/',
  head: [
    [
      "link",
      { rel: "stylesheet", href: "https://cdn.jsdelivr.net/npm/@fancyapps/ui/dist/fancybox.css" },
    ],
    ["script", { src: "https://cdn.jsdelivr.net/npm/@fancyapps/ui@4.0/dist/fancybox.umd.js" }],
  ],

  lang: 'zh-CN',
  // 仓库里有一篇历史文档会被 VitePress 解析出一个遗留的 ./index 相对链接。
  // 这里仅忽略这一条已知问题，保留其他死链检查，避免把整站校验直接关闭。
  ignoreDeadLinks: [
    './index',
  ],

  title: '前端杂货铺',
  description: 'A VitePress Site',
  themeConfig: {
    search: {
      provider: 'local'
    },

    outline: 'deep',
    lastUpdated: true,
    // https://vitepress.dev/reference/default-theme-config
    nav,

    sidebar,

    socialLinks: [
      { icon: 'github', link: 'https://github.com/luoriwusheng-xia/data-structure-and-algorithms' },
    ],
  },

  markdown: {
    theme: 'dark-plus',

    codeTransformers: [
      // link https://shiki.style/packages/vitepress
      transformerTwoslash()
    ],

    // 默认高亮的语言
    // defaultHighlightLang: 'js',
    lineNumbers: true,
    async config (md) {

      // md.use(await Shiki({
      //   themes: {
      //     light: 'dark-plus',
      //     dark: 'dark-plus'
      //   }
      // }))

      md
        // the second parameter is html tag name
        .use(container, 'sandbox', {
          render (tokens, idx) {
            return renderSandbox(tokens, idx, 'sandbox')
          },
        })

      md.use(mathjax3)

      md.use(mdItCustomAttrs, 'image', {
        'data-fancybox': "gallery"
      })

    },
  },

  vue: {
    template: {
      compilerOptions: {
        isCustomElement: (tag) => customElements.includes(tag),
      },
    },
  },
  // 排除不打包的目录
  srcExclude: ["./source-doc/**", 'README.md', 'Dockerfile', 'nginx.conf', '.dockerignore'],

  // 打包输出目录， 默认是 .vitepress/dist
  outDir: fileURLToPath(new URL('../dist', import.meta.url)),

  // vite.config.js 相关的配置
  vite: {
    server: {
      port: 8080,
      host: true
    },

    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler'
        },
      }
    },

    plugins: [
      UnoCSS(),

      svg4VuePlugin()

      //引入SVG图标素材文件
      // createSvgIconsPlugin({
      //   iconDirs: [path.resolve(process.cwd(), 'src/icons/svg')],
      //   symbolId: '[name]',
      // })
    ],
  }
})
