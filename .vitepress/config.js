import { defineConfig } from 'vitepress'

import UnoCSS from 'unocss/vite'
import container from 'markdown-it-container'
import { renderSandbox } from 'vitepress-plugin-sandpack'

import mathjax3 from 'markdown-it-mathjax3'
import customElements from './md-latex.js'

// import viteSvgIcons, {createSvgIconsPlugin} from 'vite-plugin-svg-icons';

// https://vitepress.dev/reference/site-config
export default defineConfig({
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
            link: '/docs/interview/improve/'
          },
          {
            text: '手写篇',
            link: '/docs/interview/handwritten/'
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

    sidebar: {
      // '/docs/frontend/': [
      //   {
      //     text: '前端',
      //     items: [
      //       {
      //         text: '杂文',
      //         link: '/docs/frontend/index'
      //       }
      //     ]
      //   }
      // ],
      "/docs/frontend/translation/index": [
        {
          text: 'codemirror-中文文档',
          link: '/docs/frontend/translation/codemirror/index'
        }
      ],
      '/docs/list/': [
        {
          text: 'leetcode',
          items: [
            { text: '链表', link: '/docs/list/01/index' },
            { text: '数组', link: '/docs/list/02/index' },
            { text: '树', link: '/docs/list/03/index' },
            { text: '排序', link: '/docs/list/04/index' },
            { text: '字符串', link: '/docs/list/05/index' },
            { text: '动态规划', link: '/docs/list/06/index' },
            { text: '位运算', link: '/docs/list/07/index' },
            { text: '双指针', link: '/docs/list/08/index' },
            { text: '素数个数统计', link: '/docs/list/09/index' },
            { text: '数学', link: '/docs/list/10/index' },

            {
              text: '简单',
              items: [
                {
                  text: '回文数',
                  link: '/docs/list/11/index'
                }
              ]
            },
            {
              text: '中等',
              items: [
                {
                  text: '寻找两个正序数组的中位数',
                  link: '/docs/list/12/index'
                }
              ]
            }
          ],
        },
      ],

      '/docs/vitepress-config/': [
        {
          text: 'vitepress',
          items: [
            {
              text: '评论功能',
              link: '/docs/vitepress-config/01/index',
            },
            {
              text: '多语言',
              link: '/docs/vitepress-config/02/index',
            },
            {
              text: '主题开发',
              link: '/docs/vitepress-config/03/index',
            },
            {
              text: 'element-plus接入',
              link: '/docs/vitepress-config/04/index',
            },
            {
              text: 'sandpack接入',
              link: '/docs/vitepress-config/05/index',
            },
            {
              text: '使用unocss',
              link: '/docs/vitepress-config/06/index',
            },
            {
              text: '使用vue',
              link: '/docs/vitepress-config/07/index',
            },
            {
              text: '编程式使用 Router 和 Route',
              link: '/docs/vitepress-config/08/index',
            },
            {
              text: '插件开发',
              link: '/docs/vitepress-config/01/index',
            },
            {
              text: '全局搜索',
              link: '/docs/vitepress-config/01/index',
            },
            {
              text: '部署',
              link: '/docs/vitepress-config/01/index',
            },
          ],
        },
      ],

      '/docs/backend/file/': [
        {
          text: '文件分片上传',
          link: '/docs/backend/file/01'
        },
        {
          text: '文件分片下载',
          link: '/docs/backend/file/02'
        }
      ],

      '/docs/backend/jwt/': [
        {
          text: 'jwt登录',
          link: '/docs/backend/jwt/'
        },
        {
          text: 'RBAC',
          link: '/docs/backend/jwt/rbac'
        }
      ],

      '/docs/backend/optimize/01': [
        {
          text: '压测',
          link: '/docs/backend/optimize/01'
        }
      ],
      '/docs/backend/websocket/01': [
        {
          text: 'websocket',
          link: '/docs/backend/websocket/01'
        }
      ],

      '/docs/frontend/essay/': [
        {
          text: '渡一前端',
          link: '/docs/frontend/essay/01/',
          items: [
            {
              text: '判断函数是否标记了async',
              link: '/docs/frontend/essay/01/'
            },
            {
              text: '消除异步的传染性',
              link: '/docs/frontend/essay/02/'
            },
            {
              text: '自动检测更新',
              link: '/docs/frontend/essay/03/'
            },
            {
              text: '妙用位运算-算法-找唯一数字',
              link: '/docs/frontend/essay/04/'
            }
          ]
        }
      ],
      '/docs/vue2/': [
        {
          text: '源码首页',
          link: '/docs/vue2/'
        },
        {
          text: '01-',
          link: '/docs/vue2/01'
        },
        {
          text: '02-',
          link: '/docs/vue2/02'
        },
        {
          text: '03-响应式原理',
          link: '/docs/vue2/03'
        },
        {
          text: '04-异步更新',
          link: '/docs/vue2/04'
        },
        {
          text: '05-全局API实现原理',
          link: '/docs/vue2/05'
        },
        {
          text: '2.7.14 调试',
          link: '/docs/vue2/30'
        },
        {
          text: '变更日志',
          link: '/docs/vue2/changelog'
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' },
    ],
  },

  markdown: {
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
    plugins: [
      UnoCSS()

      //引入SVG图标素材文件
      // createSvgIconsPlugin({
      //   iconDirs: [path.resolve(process.cwd(), 'src/icons/svg')],
      //   symbolId: '[name]',
      // })
    ],
  },
})
