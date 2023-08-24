import { defineConfig } from 'vitepress'

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
			{ text: 'Examples', link: '/markdown-examples' },
			{ text: '数据结构', link: '/docs/list/' },
			{ text: '参考文章', link: '/docs/referenceArticle' },
      {
        text: 'vitepress配置',
        link: '/docs/vitepress-config/'
      },
      {
        text: '源码学习',
        items: [
          {
            text: 'lodash',
            link: '/docs/lodash/'
          },
          {
            text: 'vue2',
            link: '/docs/vue2/'
          },
          {
            text: 'vue3',
            link: '/docs/vue3/'
          }
        ]
      }
		],

		sidebar: {
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
					],
				},
			],

      '/docs/vitepress-config/': [
        {
          text: 'vitepress',
          items: [
            {
              text: '评论功能',
              link: '/docs/vitepress-config/01/index'
            },
            {
              text: '多语言',
              link: '/docs/vitepress-config/01/index'
            },
            {
              text: '主体开发',
              link: '/docs/vitepress-config/01/index'
            },
            {
              text: '插件开发',
              link: '/docs/vitepress-config/01/index'
            },
            {
              text: '全局搜索',
              link: '/docs/vitepress-config/01/index'
            },
            {
              text: '部署',
              link: '/docs/vitepress-config/01/index'
            }
          ]
        }
      ]
		},

		socialLinks: [
			{ icon: 'github', link: 'https://github.com/vuejs/vitepress' },
		],
	},

	markdown: {
		lineNumbers: true,
		config(md) {
			md
				// the second parameter is html tag name
				.use(container, 'sandbox', {
					render(tokens, idx) {
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
			//引入SVG图标素材文件
			// createSvgIconsPlugin({
			//   iconDirs: [path.resolve(process.cwd(), 'src/icons/svg')],
			//   symbolId: '[name]',
			// })
		],
	},
})
