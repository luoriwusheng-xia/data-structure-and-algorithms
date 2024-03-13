import sourceCode from './source-code.js'
import lettcode from './leetcode.js'
import vitepress from './vitepress.js'
import interview from './interview.js'

/**
 * @type {import('vitepress').DefaultTheme.Sidebar}
 */
export default {
  ...sourceCode,
  ...lettcode,

  ...vitepress,
  ...interview,
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
    },
    {
      text: 'cac-中文文档',
      link: '/docs/frontend/translation/cac/index'
    },
    {
      text: 'babel-ast',
      link: '/docs/frontend/translation/babel-ast/index'
    }
  ],
  "/docs/frontend/translation/babel-ast/index": [
    {
      text: 'user handbook 设置/配置 Babel',
      link: '/docs/frontend/translation/babel-ast/user-handbook'
    },
    {
      text: 'plugin 开发',
      link: '/docs/frontend/translation/babel-ast/plugin-handbook'
    }
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
        },
        {
          text: '跳出指定for循环',
          link: '/docs/frontend/essay/05/'
        },
        {
          text: '网格布局中的动画',
          link: '/docs/frontend/essay/06/'
        },
        {
          text: '瀑布流布局',
          link: '/docs/frontend/essay/07/'
        },
        {
          text: '统计字符串中字符频率',
          link: '/docs/frontend/essay/08/'
        },
        {
          text: 'HTMLCollection与NodeList区别',
          link: '/docs/frontend/essay/09/'
        },
      ]
    },
    {
      text: '动画特效',
      items: [
        {
          text: 'svg动画',
          link: '/docs/frontend/essay/animation/01/',
        },
        {
          text: 'gsap',
          link: '/docs/frontend/essay/animation/02/index'
        },
        {
          text: '原生拖动',
          link: '/docs/frontend/essay/animation/03/index'
        },
        {
          text: '任意两个点的曲线连接JS算法',
          linl: '/docs/frontend/essay/animation/04/index'
        }
      ]
    },
    {
      text: '工具',
      items: [
        {
          text: '将html转成md',
          link: '/docs/frontend/tools/01/'
        },
        {
          text: 'markdown-it',
          link: '/docs/frontend/tools/markdown-it/'
        }
      ]
    },
    {
      text: 'css',
      items: [
        {
          text: '轮播',
          link: '/docs/frontend/essay/css/01/'
        },
        {
          text: '你不需要javascript-系列',
          link: '/docs/frontend/essay/css/02/'
        },
        {
          text: 'grid',
          link: '/docs/frontend/essay/css/03/'
        },
        {
          text: '四角线框的跟随移动',
          link: '/docs/frontend/essay/css/04/'
        },
        {
          text: 'css原生变量',
          link: '/docs/frontend/essay/css/05/'
        },
        {
          text: '六边形布局',
          link: '/docs/frontend/essay/css/06/'
        }
      ]
    },
    {
      text: '计算机基础',
      items: [
        {
          text: '左移, 右移',
          link: '/docs/frontend/essay/100/'
        }
      ]
    }
  ],



}