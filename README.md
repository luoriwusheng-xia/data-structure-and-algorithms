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

### GitHub Pages 自动部署

仓库已经增加 GitHub Actions 工作流：[.github/workflows/deploy-pages.yml](E:/github/data-structure-and-algorithms/.github/workflows/deploy-pages.yml)。

这个工作流会在以下场景自动构建并发布 VitePress 站点到 GitHub Pages：

- 向 `main` 分支推送代码
- 在 GitHub Actions 页面手动触发

发布地址为：

```
https://luoriwusheng-xia.github.io/data-structure-and-algorithms/
```

首次使用前，请在 GitHub 仓库设置中确认：

- `Settings -> Pages -> Build and deployment`
- `Source` 选择 `GitHub Actions`
