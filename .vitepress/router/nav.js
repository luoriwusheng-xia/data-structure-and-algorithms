/**
 * @type {Array<import('vitepress').DefaultTheme.NavItem>}
 */
export default [
  { text: '首页', link: '/' },
  {
    text: '数据结构',
    items: [
      {
        text: 'leetcode',
        link: '/docs/leetcode/01/',
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
      },
      {
        text: '前端工程化',
        link: '/docs/frontend/engineering/index'
      },
      {
        text: 'typescript',
        link: '/docs/frontend/typescript/index'
      },
      {
        text: 'threejs',
        link: '/docs/frontend/threejs/index'
      },
      {
        text: 'webRTC',
        link: '/docs/frontend/webrtc/webrtc-01'
      },
    ]
  },
  {
    text: '面试题',
    items: [
      {
        text: '基础篇',
        link: '/docs/interview/base/01'
      },
      {
        text: '进阶篇',
        link: '/docs/interview/improve/01'
      },
      {
        text: '高频篇',
        link: '/docs/interview/high-frequency/01'
      },
      {
        text: '精选篇',
        link: '/docs/interview/excellent-docs/01'
      },
      {
        text: '手写篇',
        link: '/docs/interview/handwritten/01'
      },
      {
        text: '原理篇',
        items: [
          {
            text: 'Vue',
            link: '/docs/interview/principle/vue/01'
          },
          {
            text: 'React',
            link: '/docs/interview/principle/react/01'
          },
          {
            text: 'Webpack',
            link: '/docs/interview/principle/webpack/01'
          },

          {
            text: 'Node',
            link: '/docs/interview/principle/node/01'
          },

          {
            text: 'javascript',
            link: '/docs/interview/principle/javascript/01'
          },

          {
            text: '综合题型',
            link: '/docs/interview/principle/comprehensive/01'
          }

        ]
      },

      {
        text: '设计模式',
        link: '/docs/interview/design-pattern/01'
      },
      {
        text: '面经篇',
        link: '/docs/interview/interview-exp/01'
      },
      {
        text: '自检篇',
        link: '/docs/interview/self-checking/01'
      },

        {
        text: '场景设计',
        link: '/docs/interview/scene-design/data-dashboard'
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
      },
      {
        text: '邀请域名',
        link: '/docs/backend/invite-domain-name/'
      }
    ]
  },

  {
    text: 'vitepress配置',
    link: '/docs/vitepress-config/',
  },
  {
    text: '源码学习',
    link: '/docs/source-code/'
  },
  {
    text: '在线工具',
    link: '/docs/online-tools/'
  },
]
