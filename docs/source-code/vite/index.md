# vite

### vite中给文件形成hash值

<<<./code/01.js

在 `vite/plugin-vue` 源码中， `vite`编译`.vue` 文件时， 会调用  `vite`提供的 transform 方法， 里面就会涉及到将文件路径或者内容转为hash的操作

开发环境就只是将文件路径序列化以后，作为 getHash的入参， 生成环境则是将内容转为 hash

- https://github1s.com/vitejs/vite-plugin-vue/blob/main/packages/plugin-vue/src/index.ts
- https://github1s.com/vitejs/vite-plugin-vue/blob/main/packages/plugin-vue/src/utils/descriptorCache.ts
