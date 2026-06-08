
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
    },
    {
      text: 'Express 5.x',
      items: [
        {
          text: '项目架构与实战基础',
          link: '/docs/backend/express/01'
        },
        {
          text: '中间件详解与大型项目应用',
          link: '/docs/backend/express/02'
        },
        {
          text: 'MySQL 8.x 数据库实战',
          link: '/docs/backend/express/03'
        },
        {
          text: '安全实战与生产部署',
          link: '/docs/backend/express/04'
        }
      ]
    },
    {
      text: 'Node.js 实战',
      items: [
        {
          text: '01 - 安全实战',
          link: '/docs/backend/01-node-security'
        },
        {
          text: '02 - 性能优化',
          link: '/docs/backend/02-node-performance'
        },
        {
          text: '03 - 调试技巧',
          link: '/docs/backend/03-node-debug'
        },
        {
          text: '04 - 线上问题排查',
          link: '/docs/backend/04-node-production'
        },
        {
          text: '05 - Node 24+ 新特性',
          link: '/docs/backend/05-node-modern'
        }
      ]
    },
    {
      text: 'PM2',
      link: '/docs/backend/pm2'
    },
    {
      text: 'AI Agent',
      items: [
        {
          text: '概览',
          link: '/docs/backend/ai-agent/'
        },
        {
          text: 'LangChain 快速入门',
          link: '/docs/backend/ai-agent/01'
        },
        {
          text: 'LangChain 高阶',
          link: '/docs/backend/ai-agent/02'
        },
        {
          text: '实战：智能客服',
          link: '/docs/backend/ai-agent/03'
        },
        {
          text: '实战：自动化 Agent',
          link: '/docs/backend/ai-agent/04'
        },
        {
          text: '部署与运维',
          link: '/docs/backend/ai-agent/05'
        }
      ]
    }
  ]
}