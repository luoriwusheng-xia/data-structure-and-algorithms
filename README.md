# 面试指南

### 项目构建

使用 docker 可以直接构建镜像

```shell
docker build -t vitepress-doc .
```

部署

```shell
docker run -itd -p 8001:80 --name vitepress-doc vitepress-doc
```

打开浏览器地址

```
http://localhost:8001
```
