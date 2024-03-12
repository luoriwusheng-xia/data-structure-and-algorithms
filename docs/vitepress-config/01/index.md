# 部署教程

## 项目构建

创建核心的3个文件

- Dockerfile
- .dockerignore
- nginx.conf

### Dockerfile

```
FROM node:20.9.0
WORKDIR /app
COPY package.json ./
RUN npm install -g pnpm && pnpm install
RUN echo "依赖安装完成..."
COPY . .

RUN echo '开始build'
RUN pnpm run docs:build
RUN echo '---build 完成---'

FROM nginx:latest

RUN echo '拷贝dist到 nginx目录'
COPY --from=0 /app/dist /usr/share/nginx/html
COPY --from=0 /app/nginx.conf /etc/nginx/conf.d/default.conf
```

我这里docker 指令 `copy`的 `dist` 目录是在根目录， 也就是 `npm run docs:build` 执行的时候， `dist` 文件夹 是在项目根目录， 默认是生成在 `.vitepress/dist`, 需要调整一下vitepress的配置文件即可

.vitepress/config.js

```js
import { defineConfig } from 'vitepress'
import { fileURLToPath } from 'node:url'

export default defineConfig({
   // 排除不打包的目录
  srcExclude: ["./source-doc/**", 'README.md', 'Dockerfile', 'nginx.conf', '.dockerignore'],

  // 打包输出目录， 默认是 .vitepress/dist
  outDir: fileURLToPath(new URL('../dist', import.meta.url)),
})
```


以下内容，不需要copy进docker, 忽略， 上面copy使用的是  `copy . .`  表示把当前目录所有的文件都copy进设置的工作目录  /app。 这里忽略，就会跳过这些内容

**.dockerignore**

```
node_modules
.git
scripts
source-doc
README.md
dist
```

### nginx配置

nginx.conf

```nginx
server {
  listen 80;
  server_name localhost;

  location / {
    root /usr/share/nginx/html;
    index index.html;
    # 对于vue或者React项目，使用 history路由需要
    try_files $uri $uri/ /index.html;
  }

  location = 50x.html {
    root /usr/share/nginx/html;
  }
}
```

### 构建镜像

使用 docker 可以直接构建镜像

```shell
docker build -t vitepress-doc .
```

### 启动

```shell
docker run -itd -p 8001:80 --name vitepress-doc vitepress-doc
```

打开浏览器地址

```
http://localhost:8001
```
