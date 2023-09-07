# 自动检测更新

当前端发布以后，用户浏览器没有刷新的情况下，通知用户，服务器有内容变动，提醒用户刷新或者自动加载最新静态资源

直接拿到网站的HTML字符串内容


### 拿到网站的HTML内容体

```js
fetch('https://vitepress.dev')
    .then(res => res.text())
    .then(res => console.log(res))
```

拿到的HTML片段内容如下：

```text
<!DOCTYPE html>
<html lang="en-US" dir="ltr">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>VitePress | Vite & Vue Powered Static Site Generator</title>
    <meta name="description" content="Vite & Vue powered static site generator.">
    <link rel="preload stylesheet" href="/assets/style.78c5b67d.css" as="style">

    <script type="module" src="/assets/app.d1b609e5.js"></script>
    <link rel="preload" href="/assets/inter-roman-latin.2ed14f66.woff2" as="font" type="font/woff2" crossorigin="">
    <link rel="modulepreload" href="/assets/chunks/framework.c59ae78c.js">
    <link rel="modulepreload" href="/assets/chunks/theme.58184835.js">
    <link rel="modulepreload" href="/assets/index.md.d949f674.lean.js">
    <link rel="icon" href="/vitepress-logo-mini.svg">
    <meta name="theme-color" content="#5f67ee">
    <meta name="og:type" content="website">
    <meta name="og:locale" content="en">
    <meta name="og:site_name" content="VitePress">
    <meta name="og:image" content="https://vitepress.dev/vitepress-og.jpg">
    <meta name="twitter:image" content="https://vitepress.dev/vitepress-og.jpg">
    <script src="https://cdn.usefathom.com/script.js" data-site="AZBRSFGG" data-spa="auto" defer></script>
    <script id="check-dark-light">(()=>{const e=localStorage.getItem("vitepress-theme-appearance")||"auto",a=window.matchMedia("(prefers-color-scheme: dark)").matches;(!e||e==="auto"?a:e==="dark")&&document.documentElement.classList.add("dark")})();</script>
    <script id="check-mac-os">document.documentElement.classList.toggle("mac",/Mac|iPhone|iPod|iPad/i.test(navigator.platform));</script>
  </head>
  <body>
    <div id="app"><div class="Layout" data-v-d3b049eb><!--[--><!--]--><!--[--><span tabindex="-1" data-v-0898fcf2></span><a href="#VPContent" class="VPSkipLink visually-hidden" data-v-0898fcf2> Skip to content </a><!--]--><!----><header class="VPNav" data-v-d3b049eb data-v-900f5a4d><div class="VPNavBar top" data-v-900f5a4d data-v-dd746aa5><div class="container" data-v-dd746aa5><div class="title" data-v-dd746aa5><div class="VPNavBarTitle" data-v-dd746aa5 data-v-e6e3b915><a class="title" href="/" data-v-e6e3b915><!--[--><!--]--><!--[--><img class="VPImage logo" src="/vitepress-logo-mini.svg" width="24" height="24" alt data-v-857f4fa7><!--]--><!--[-->VitePress<!--]--><!--[--><!--]--></a></div></div><div class="content" data-v-dd746aa5><div class="curtain" data-v-dd746aa5></div><div class="content-body" data-v-dd746aa5><!--[--><!--]--><div class="VPNavBarSearch search" data-v-dd746aa5><!--[--><!----><div id="docsearch"><button type="button" class="DocSearch DocSearch-Button" aria-label="Search"><span class="DocSearch-Button-Container"><svg class="DocSearch-Search-Icon" width="20" height="20" viewBox="0 0 20 20" aria-label="search icon"><path d="M14.386 14.386l4.0877 4.0877-4.0877-4.0877c-2.9418 2.9419-7.7115 2.9419-10.6533 0-2.9419-2.9418-2.9419-7.7115 0-10.6533 2.9418-2.9419 7.7115-2.9419 10.6533 0 2.9419 2.9418 2.9419 7.7115 0 10.6533z" stroke="currentColor" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round"></path></svg><span class="DocSearch-Button-Placeholder">Search</span></span><span class="DocSearch-Button-Keys"><kbd class="DocSearch-Button-Key"></kbd><kbd class="DocSearch-Button-Key">K</kbd></span></button></div><!--]--></div><nav aria-labelledby="main-nav-aria-label" class="VPNavBarMenu menu" data-v-dd746aa5 data-v-6cc9c09b><span id="main-nav-aria-label" class="visually-hidden" data-v-6cc9c09b>Main Navigation</span><!--[--><!--[--><a class="VPLink link VPNavBarMenuLink" href="/guide/what-is-vitepress" tabindex="0" data-v-6cc9c09b data-v-9584e84b><!--[--><span data-v-9584e84b>Guide</span><!--]--></a><!--]--><!--[--><a class="VPLink link VPNavBarMenuLink" href="/reference/site-config" tabindex="0" data-v-6cc9c09b data-v-9584e84b><!--[--><span data-v-9584e84b>Reference</span><!--]--></a><!--]--><!--[--><div class="VPFlyout VPNavBarMenuGroup" data-v-6cc9c09b data-v-d5edef4f><button type="button" class="button" aria-haspopup="true" aria-expanded="false" data-v-d5edef4f><span class="text" data-v-d5edef4f><!----><span data-v-d5edef4f>1.0.0-rc.10</span><svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" viewbox="0 0 24 24" class="text-icon" data-v-d5edef4f><path d="M12,16c-0.3,0-0.5-0.1-0.7-0.3l-6-6c-0.4-0.4-0.4-1,0-1.4s1-0.4,1.4,0l5.3,5.3l5.3-5.3c0.4-0.4,1-0.4,1.4,0s0.4,1,0,1.4l-6,6C12.5,15.9,12.3,16,12,16z"></path></svg></span></button><div class="menu" data-v-d5edef4f><div class="VPMenu" data-v-d5edef4f data-v-a7f62526><div class="items" data-v-a7f62526><!--[--><!--[--><div class="VPMenuLink" data-v-a7f62526 data-v-10dd3adf><a class="VPLink link vp-external-link-icon" href="https://github.com/vuejs/vitepress/blob/main/CHANGELOG.md" target="_blank" rel="noreferrer" data-v-10dd3adf><!--[-->Changelog<!--]--></a></div><!--]--><!--[--><div class="VPMenuLink" data-v-a7f62526 data-v
```

测试正则匹配src内容

```js
let t = `<!DOCTYPE html>
<html lang="en-US" dir="ltr">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>VitePress | Vite & Vue Powered Static Site Generator</title>
    <meta name="description" content="Vite & Vue powered static site generator.">
    <link rel="preload stylesheet" href="/assets/style.78c5b67d.css" as="style">

    <script type="module" src="/assets/app.d1b609e5.js"></script>
    <link rel="preload" href="/assets/inter-roman-latin.2ed14f66.woff2" as="font" type="font/woff2" crossorigin="">
    <link rel="modulepreload" href="/assets/chunks/framework.c59ae78c.js">
    <link rel="modulepreload" href="/assets/chunks/theme.58184835.js">
    <link rel="modulepreload" href="/assets/index.md.d949f674.lean.js">
    <link rel="icon" href="/vitepress-logo-mini.svg">
    <meta name="theme-color" content="#5f67ee">
    <meta name="og:type" content="website">
    <meta name="og:locale" content="en">
    <meta name="og:site_name" content="VitePress">
    <meta name="og:image" content="https://vitepress.dev/vitepress-og.jpg">
    <meta name="twitter:image" content="https://vitepress.dev/vitepress-og.jpg">
    <script src="https://cdn.usefathom.com/script.js" data-site="AZBRSFGG" data-spa="auto" defer></script>
    <script id="check-dark-light">(()=>{const e=localStorage.getItem("vitepress-theme-appearance")||"auto",a=window.matchMedia("(prefers-color-scheme: dark)").matches;(!e||e==="auto"?a:e==="dark")&&document.documentElement.classList.add("dark")})();</script>
    <script id="check-mac-os">document.documentElement.classList.toggle("mac",/Mac|iPhone|iPod|iPad/i.test(navigator.platform));</script>
  </head>`

const scriptReg = /\<script.*src=["'](?<src>[^"']+)/gm
let result = scriptReg.exec(t)
```

结果：

```js
[
    "<script type=\"module\" src=\"/assets/app.d1b609e5.js",
    "/assets/app.d1b609e5.js"
]

result[0] //  "<script type=\"module\" src=\"/assets/app.d1b609e5.js"

result[1] // "/assets/app.d1b609e5.js"

result.groups.src // "/assets/app.d1b609e5.js"
```

### 完整代码

<<<./case.js

1. 拿到网站的index.html中的字符串
2. 解析字符串，提取script中的src中的内容
3. 判断src中的内容是否发生了变化， 个数的变化、src值的变化， 只要发生变化则网站一定存在内容更新
4. 提示用户更新，刷新网页