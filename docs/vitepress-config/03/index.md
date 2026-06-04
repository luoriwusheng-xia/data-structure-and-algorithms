# 主题

自定义主题，可以修改 `.vitepress/theme/index.js`;  新建项目没有 **theme** 目录的，自己创建一个，并创建 `index.js` 文件

**.vitepress/theme/index.js**
```javascript
// 需要引入默认的主题， 基于这个上面做改造
import DefaultTheme from 'vitepress/theme';
// 自定义主题样式
import './index.less';

export default {
  ...DefaultTheme,
  enhanceApp (ctx) {
    DefaultTheme.enhanceApp(ctx);
  }
}
```

**.vitepress/theme/index.less**

```less
.container {
	.content {
		padding-left: 0 !important;
		padding-right: 0 !important;
	}

  .aside {
    .content {
      padding-left: 16px !important;
    }
  }

  .content-container {
    max-width: none !important;
  }
}

```

如果使用的是 `less` 或者 `sass` 文件， 需要安装  less 或sass 包

```shell
pnpm add less -D

或者

pnpm add sass -D
```



