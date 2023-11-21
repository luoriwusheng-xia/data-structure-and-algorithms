import { defineConfig } from 'vitepress'

import UnoCSS from 'unocss/vite'
import container from 'markdown-it-container'
import { renderSandbox } from 'vitepress-plugin-sandpack'
import mdItCustomAttrs from 'markdown-it-custom-attrs'

import mathjax3 from 'markdown-it-mathjax3'
import customElements from './md-latex.js'

// 文档配置
import sidebar from './sidebar.js'

// import viteSvgIcons, {createSvgIconsPlugin} from 'vite-plugin-svg-icons';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  head: [
    [
      "link",
      { rel: "stylesheet", href: "https://cdn.jsdelivr.net/npm/@fancyapps/ui/dist/fancybox.css" },
    ],
    ["script", { src: "https://cdn.jsdelivr.net/npm/@fancyapps/ui@4.0/dist/fancybox.umd.js" }],
  ],

  lang: 'zh-CN',

  title: '前端杂货铺',
  description: 'A VitePress Site',
  themeConfig: {
    outline: 'deep',
    lastUpdated: true,
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '首页', link: '/' },
      {
        text: '数据结构',
        items: [
          {
            text: '数据结构',
            link: '/docs/list/',
          },
          { text: '参考文章', link: '/docs/referenceArticle' },
        ],
      },
      {
        text: '前端',
        items: [
          {
            text: '杂文',
            link: '/docs/frontend/essay/index',
          },
          {
            text: '文档翻译',
            link: '/docs/frontend/translation/index',
          }
        ]
      },
      {
        text: '面试题',
        items: [
          {
            text: '基础篇',
            link: '/docs/interview/base/'
          },
          {
            text: '进阶篇',
            link: '/docs/interview/improve/01'
          },
          {
            text: '手写篇',
            link: '/docs/interview/handwritten/01'
          },
          {
            text: '原理篇',
            link: '/docs/interview/principle/'
          }
        ]
      },
      {
        text: '后端',
        items: [
          {
            text: 'jwt登录',
            link: '/docs/backend/jwt/'
          },
          {
            text: 'websocket',
            link: '/docs/backend/websocket/01'
          },
          {
            text: 'api服务',
            link: '/docs/backend/api-server'
          },
          {
            text: '邮件',
            link: '/docs/backend/email'
          },
          {
            text: '文件操作',
            link: '/docs/backend/file/index'
          },
          {
            text: '性能',
            link: '/docs/backend/optimize/01'
          }
        ]
      },

      {
        text: 'vitepress配置',
        link: '/docs/vitepress-config/',
      },
      {
        text: '源码学习',
        items: [
          {
            text: 'lodash',
            link: '/docs/lodash/',
          },
          {
            text: 'vue2',
            link: '/docs/vue2/',
          },
          {
            text: 'vue3',
            link: '/docs/vue3/',
          },
          {
            text: '收藏夹',
            link: '/docs/favorites/',
          }
        ],
      },
    ],

    sidebar,

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' },
    ],
  },

  markdown: {
    // 默认高亮的语言
    // defaultHighlightLang: 'js',
    lineNumbers: true,
    config (md) {
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

  // vite.config.js 相关的配置
  vite: {
    server: {
      host: true
    },
    plugins: [
      UnoCSS()

      //引入SVG图标素材文件
      // createSvgIconsPlugin({
      //   iconDirs: [path.resolve(process.cwd(), 'src/icons/svg')],
      //   symbolId: '[name]',
      // })
    ],
  }
})
