import sceneDesignNav from './sceneDesignNav.js';

/**
 * @type {import('vitepress').DefaultTheme.Sidebar}
 */
export default {
  '/docs/vitepress-config/': [
    {
      text: 'vitepress',
      items: [
        {
          text: '评论功能',
          link: '/docs/vitepress-config/13',
        },
        {
          text: '多语言',
          link: '/docs/vitepress-config/02/index',
        },
        {
          text: 'shiki-更改代码主题',
          link: '/docs/vitepress-config/09/index'
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
          text: '组件和代码示例预览',
          link: '/docs/vitepress-config/14/index',
        },
        {
          text: '编程式使用 Router 和 Route',
          link: '/docs/vitepress-config/08/index',
        },
        {
          text: '图片预览',
          link: '/docs/vitepress-config/10'
        },
        {
          text: '插件开发',
          link: '/docs/vitepress-config/12',
        },
        {
          text: '全局搜索',
          link: '/docs/vitepress-config/11',
        },
        {
          text: '部署',
          link: '/docs/vitepress-config/01/index',
        },
      ],
    },
  ],
  ...sceneDesignNav
}