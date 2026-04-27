# autofit.js 源码分析

<script setup>
import AutofitDiagram from './AutofitDiagram.vue'
</script>



分析对象：`autofit.js`

版本信息来自 `package.json`：`autofit.js@3.2.8`。这是一个面向 PC 大屏项目的响应式缩放库，核心目标是按设计稿比例缩放主容器，并通过增加容器宽高补齐屏幕空间，避免直接拉伸业务元素。

## 项目结构

```text
autofit.js/
├─ src/
│  ├─ index.ts           # 对外 API：init、off、elRectification、scale
│  ├─ strategy.ts        # 核心缩放策略 keepFit
│  ├─ rectification.ts   # 局部元素事件/尺寸修正
│  ├─ state.ts           # 全局运行时状态
│  └─ types.ts           # TypeScript 类型定义
├─ dev/                  # 本地开发示例和 IIFE 构建产物
├─ rolldown.config.ts    # 生产构建：esm/cjs/umd/iife/min
└─ rolldown.config.dev.ts# 开发构建：serve + livereload
```

## 架构图

<AutofitDiagram />

## 运行流程

1. 业务侧调用 `autofit.init(options, isShowInitTip)`。
2. `index.ts` 合并默认参数，默认设计稿为 `1920 x 1080`，默认目标元素为 `body`。
3. 查询目标 DOM，失败时输出错误并退出。
4. 创建两个样式节点：
   - `#autofit-style`：控制 `body { overflow: hidden; }`。
   - `#ignoreStyle`：动态写入忽略缩放元素的反向缩放规则。
5. 设置目标容器基础尺寸、`transformOrigin: 0 0` 和可选 `overflow: hidden`。
6. 调用 `keepFit` 立即执行一次适配。
7. 如果 `resize` 为 `true`，注册 `window.resize` 监听；有 `delay` 时使用 `setTimeout` 防抖。
8. 每次 resize 后重新执行 `keepFit`，如果启用了 `elRectification`，同步重新修正局部元素。
9. 调用 `off()` 时移除监听器、注入样式、目标元素样式，并关闭局部修正。

## 核心模块分析

### `src/index.ts`

这是库的门面层，默认导出 `autofit` 对象。

对外能力：

- `init(options, isShowInitTip)`：初始化缩放系统。
- `off(el)`：清理运行时副作用。
- `elRectification`：导出局部修正函数。
- `scale` getter：读取当前缩放比例 `state.currScale`。
- `isAutofitRunning`：对象自身和 `state` 中都维护一份运行状态。

关键副作用：

- 写入 `state.currRenderDom`。
- 向 `body` 追加样式节点。
- 修改目标 DOM 的 `height`、`width`、`transformOrigin`、`overflow`、`transition`。
- 注册 `window.resize` 事件。

### `src/strategy.ts`

`keepFit` 是核心算法。

缩放比例计算：

```ts
state.currScale =
  clientWidth / clientHeight < dw / dh
    ? clientWidth / dw
    : clientHeight / dh;
```

含义：

- 当视口更窄时，以宽度为基准缩放。
- 当视口更高或比例更宽时，以高度为基准缩放。
- `limit` 用于避免接近 1 的微小缩放，默认差值不超过 `0.1` 时直接设为 `1`。

容器处理：

- 通过 `clientHeight / currScale`、`clientWidth / currScale` 反推缩放前容器尺寸。
- `cssMode === "zoom"` 时写入 `style.zoom`。
- 默认写入 `transform: translateZ(0) scale(...)`。

`ignore` 处理：

- 支持字符串选择器，也支持 `{ el, width, height, scale, fontSize }`。
- 默认对忽略元素使用 `1 / currScale` 做反向缩放。
- 动态写入 `#ignoreStyle`，让指定元素抵消主容器缩放。

### `src/rectification.ts`

`elRectification` 用于处理 canvas、图表等场景中事件偏移或尺寸偏移问题。

流程：

- 未初始化时拒绝执行。
- 每次执行前先调用 `offelRectification()` 清理旧修正。
- 查询目标元素集合。
- 第一次修正时记录 `originalWidth`、`originalHeight`。
- 根据 `state.currScale * level` 调整宽高。
- 再设置 `transform: scale(1 / currScale)` 抵消外层缩放。

`isKeepRatio` 为 `true` 时基于原始像素尺寸修正；为 `false` 时使用百分比尺寸填充父元素。

### `src/state.ts`

这是模块间共享状态容器。

主要字段：

- `currRenderDom`：当前被适配的选择器或元素。
- `resizeListener`：resize 监听函数引用，供 `off` 移除。
- `timer`：resize 防抖计时器。
- `currScale`：当前缩放比例。
- `isElRectification`：是否启用局部修正。
- `currelRectification*`：局部修正选择器和参数。
- `isAutofitRunning`：运行状态。

### `src/types.ts`

定义了公开 API 的类型契约。

`AutofitOption` 的关键参数：

- `el`：目标容器选择器。
- `dw` / `dh`：设计稿宽高。
- `resize`：是否监听窗口变化。
- `ignore`：忽略缩放的元素列表。
- `transition`：缩放过渡时间。
- `delay`：resize 防抖延迟。
- `limit`：接近 1 时忽略缩放的阈值。
- `cssMode`：`scale` 或 `zoom`。
- `allowScroll`：是否允许滚动。

## 构建与产物

生产构建入口是 `src/index.ts`，通过 `rolldown.config.ts` 输出：

- `dist/autofit.esm.js`
- `dist/autofit.cjs.js`
- `dist/autofit.umd.js`
- `dist/autofit.iife.js`
- `dist/autofit.min.js`
- `dist/types/index.d.ts`

开发构建入口是 `dev/index.ts`，输出到 `dev/autofit.iife.js`，并启动本地静态服务和 livereload。

## 设计特点

- API 面很小，接入成本低。
- 核心缩放算法集中在 `keepFit`，易于定位问题。
- `ignore` 和 `elRectification` 分别覆盖常见地图、弹层、图表、canvas 事件偏移场景。
- 默认使用 `transform: scale`，也提供 `zoom` 模式以兼容部分事件偏移场景。
- 通过全局 `state` 简化模块协作，但也意味着同一页面天然更适合单实例运行。

## 风险与改进建议

- `state` 是单例，多个容器同时初始化会互相覆盖状态。
- `#autofit-style` 和 `#ignoreStyle` 使用固定 ID，多次初始化可能追加重复节点。
- `ignoreStyleDOM.innerHTML += ...` 在循环中反复触发字符串拼接和样式重解析，元素多时可能有性能成本。
- `off()` 会把目标元素 `style.cssText` 全部清空，可能误删业务代码原本写入的内联样式。
- `transition` 实际写成 `${transition}s`，如果调用方传入 `0.3` 可用，但注释和类型需要保持一致。
- `types.ts` 中 `elRectification` 类型声明的 `isKeepRatio`、`level` 比实现更窄；实现允许 `string | boolean` 和 `string | number`。
- `dev/index.ts` 注释里有 `allowScoll` 拼写，应为 `allowScroll`。

## Web Interface Guidelines 应用到架构图

生成的 `autofit-architecture.html` 按以下规则处理：

- 使用语义化结构：`header`、`nav`、`main`、`section`、`footer`。
- 提供 skip link，方便键盘用户直达主内容。
- 链接有可见 `hover` 和 `focus-visible` 状态。
- 文本容器使用 `overflow-wrap: anywhere`，避免长路径或代码标识溢出。
- 响应式布局使用 CSS Grid，不依赖 JS 测量。
- 使用 `prefers-reduced-motion` 降低动效。
- 不使用 `transition: all`。
- 页面主题声明 `color-scheme`，并设置 `theme-color`。

