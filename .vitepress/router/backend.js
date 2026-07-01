
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
      items: [
        {
          text: '基础与场景',
          link: '/docs/backend/websocket/01'
        },
        {
          text: '前端实战',
          link: '/docs/backend/websocket/02-frontend'
        },
        {
          text: '后端实战 (Node.js)',
          link: '/docs/backend/websocket/03-backend-nodejs'
        },
        {
          text: '弱网优化',
          link: '/docs/backend/websocket/04-weak-network'
        },
        {
          text: '瀑布式数据流',
          link: '/docs/backend/websocket/05-waterfall-data'
        },
        {
          text: '完整实战案例',
          link: '/docs/backend/websocket/06-cases'
        }
      ]
    },
    {
      text: 'API 接口平台',
      items: [
        {
          text: '概览',
          link: '/docs/backend/api-server/'
        },
        {
          text: '01 - 平台架构设计',
          link: '/docs/backend/api-server/01'
        },
        {
          text: '02 - Node 26 + ESM 工程骨架',
          link: '/docs/backend/api-server/02'
        },
        {
          text: '03 - 鉴权与授权设计',
          link: '/docs/backend/api-server/03'
        },
        {
          text: '04 - 接口规范与安全治理',
          link: '/docs/backend/api-server/04'
        },
        {
          text: '05 - 日志、审计与可观测性',
          link: '/docs/backend/api-server/05'
        },
        {
          text: '06 - 最小可落地实战',
          link: '/docs/backend/api-server/06'
        },
        {
          text: '07 - API Key 发放与接入流程',
          link: '/docs/backend/api-server/07'
        },
        {
          text: '08 - 密钥轮换与凭证生命周期',
          link: '/docs/backend/api-server/08'
        },
        {
          text: '09 - Webhook 回调设计与验签',
          link: '/docs/backend/api-server/09'
        },
        {
          text: '10 - OpenTelemetry 接入与链路追踪',
          link: '/docs/backend/api-server/10'
        }
      ]
    },
    {
      text: 'Stripe 支付',
      link: '/docs/backend/stripe/index'
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
        },
        {
          text: '06 - 多线程实战',
          link: '/docs/backend/06-node-worker-threads'
        },
        {
          text: '07 - Web Crypto 加解密',
          link: '/docs/backend/07-web-crypto'
        },
        {
          text: '08 - Cluster 多进程',
          link: '/docs/backend/08-node-cluster'
        },
        {
          text: '09 - 日志系统设计与实战',
          link: '/docs/backend/09-node-logging'
        },
        {
          text: '10 - Node.js 监控实战',
          link: '/docs/backend/10-node-monitoring'
        },
        {
          text: '11 - 消息队列接入与实战',
          link: '/docs/backend/11-message-queue'
        },
        {
          text: '12 - redis',
          link: '/docs/backend/12-redis'
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
