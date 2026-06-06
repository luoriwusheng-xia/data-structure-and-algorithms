
/**
 * @type {import('vitepress').DefaultTheme.Sidebar}
 */
export default {
  '/docs/backend/': [
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
    },
    {
      text: 'stream-流',
      link: '/docs/backend/stream/index'
    },
    {
      text: 'SQLite',
      items: [
        {
          text: '入门',
          link: '/docs/backend/sqlite/01'
        },
        {
          text: '进阶',
          link: '/docs/backend/sqlite/02'
        },
        {
          text: '实战',
          link: '/docs/backend/sqlite/03'
        },
        {
          text: '面试',
          link: '/docs/backend/sqlite/04'
        }
      ]
    }
  ]
}