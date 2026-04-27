<script setup >
import case1 from './demo/case-1.vue'
import case2 from './demo/case-2.vue'
</script>

# 数据可视化大屏

> 面向前端组长/负责人级别，结合实际业务场景（运营数据监控、企业微信多端展示）

---

## 一、大屏适配方案

### Q1：你们大屏项目支持哪些分辨率？不同比例（16:9、21:9、4:3）的屏幕如何统一适配？

**参考答案要点：**
- **明确目标分辨率**：通常以设计稿基准（如 1920x1080 或 3840x2160）为基准开发
- **核心适配策略对比**：
  - `rem` 方案：基于根字体缩放，适合固定比例场景，但比例差异大时会出现拉伸或黑边
  - `vw/vh` 方案：直接使用视口单位，响应式强，但图表字体和线条可能模糊
  - `scale` 方案（推荐）：以基准尺寸渲染，通过 CSS `transform: scale()` 整体缩放，保持比例和清晰度，配合 `transform-origin: left top` 定位
  - `flex + 媒体查询`：适合布局差异大的场景，但大屏通常追求像素级还原
- **实际做法**：采用 `scale` 方案为主，监听 `window.resize` 计算缩放比例，对超宽屏（如 32:9）做特殊处理（分屏展示或左右留白）
- **企业微信端差异**：PC 端用 scale，移动端改用 rem/vw 适配，通过 UA 或环境判断切换策略

---

### Q2：scale 缩放方案下，ECharts 图表的 tooltip、鼠标事件偏移如何解决？

**参考答案要点：**
- **问题根源**：CSS transform 缩放后，鼠标坐标与图表内部坐标系不一致，导致 tooltip 位置偏移、点击事件不准
- **解决方案**：
  - ECharts 配置 `transform: none` 单独容器，图表本身不参与 scale，仅外层容器缩放（复杂，破坏整体一致性）
  - 更优方案：通过 ECharts `convertFromPixel` / `convertToPixel` 手动转换坐标，或重写 `getZr().on('mousemove')` 事件处理
  - **最佳实践**：使用原生 `ResizeObserver` 监听容器尺寸变化，调用 `chart.resize()`，同时计算缩放比例修正鼠标事件坐标。
- **经验值**：在 scale 比例大于 1.5 或小于 0.7 时，建议启用坐标修正逻辑，避免用户体验下降

---

### Q3：大屏在 4K/8K 超高分辨率屏幕上，如何保证图表和文字的清晰度？

**参考答案要点：**
- **DPR（Device Pixel Ratio）处理**：ECharts 和 Highcharts 默认会根据 DPR 自动调整 Canvas 像素比，但需确认 `devicePixelRatio` 配置正确
- **字体策略**：避免使用过小字体（最小 12px），4K 屏上适当增大至 14-16px；使用 `vw` 或 rem 动态调整
- **SVG vs Canvas**：高分辨率下 SVG 渲染文字更清晰，但大数据量性能差；可针对文字密集型图表（如表格、KPI 卡片）用 SVG，大数据量用 Canvas
- **图片资源**：使用 2x/3x 图，或直接用 CSS/SVG 绘制装饰元素，避免位图拉伸模糊
- **实测方法**：在 3840x2160 和 7680x4320 屏幕下实测，检查 tooltip、legend、label 的锐利度

---

## 二、性能优化

### Q4：大屏同时渲染 20+ 张 ECharts 图表，首屏加载和交互卡顿如何优化？

**参考答案要点：**
- **首屏优化**：
  - 图表按需加载：首屏只渲染可视区域图表，下方图表使用 `IntersectionObserver` 懒加载
  - 数据预请求：页面加载前通过 `<link rel="preload">` 或 [Service Worker 缓存图表数据](#sw-cache-strategy)
  - 骨架屏：图表区域先用 CSS 骨架屏占位，数据就绪后替换
- **渲染优化**：
  - ECharts 实例复用：避免重复 `init`，使用 `chart.setOption(newOption, true)` 更新
  - 关闭不必要的动画：`animation: false` 或降低 `animationDuration`（大屏通常不需要复杂动画）
  - 减少 series 数量：合并同类图表，使用 `dataset` 统一数据源
- **交互优化**：
  - 防抖处理 resize 事件（200ms 延迟）
  - 对联动图表使用 [`connect`](#echarts-connect) 共享事件，避免重复监听

---

### Q5：单张图表数据量超过 10 万点，ECharts 卡顿甚至崩溃，如何优化？

**参考答案要点：**
- **数据层优化**：
  - 数据降采样（Sampling）：使用 ECharts [`sampling: 'lttb'`](https://echarts.apache.org/zh/option.html#series-line.sampling)（ Largest Triangle Three Buckets ）或后端预聚合（如按分钟/小时聚合）
  - 数据分片：只渲染可视区域数据，配合 `dataZoom` 动态加载
- **渲染层优化**：
  - 启用 `large` 模式：`series.large = true`，ECharts 会切换为增量渲染模式
  - 使用 `progressive` 渐进式渲染：`progressive: 1000`，分帧渲染避免阻塞主线程
  - Canvas 优先：大数据量禁用 SVG 渲染
- **架构层优化**：
  - Web Worker 数据处理：将数据解析、格式化逻辑放入 Worker，避免阻塞 UI
  - WebGL 加速：ECharts GL（基于 WebGL）或迁移至 Apache ECharts 5 的 `custom series` + WebGL 渲染
  - 极端场景：考虑用 Canvas 原生绘制或引入专门的 WebGL 图表库（如 deck.gl、three.js）替代 ECharts

---

### Q6：Canvas 和 SVG 在大屏场景下如何选择？你们项目中是如何决策的？

**参考答案要点：**
- **Canvas 优势**：渲染性能高，适合大数据量、频繁更新的图表（如实时折线图、热力图）；内存占用相对可控
- **SVG 优势**：DOM 可操作性强，适合交互复杂、需要 CSS 样式控制的图表；高分辨率下文字和线条更清晰；事件处理更精准
- **决策依据**：
  - 数据量 > 1 万点：Canvas
  - 需要频繁交互（下钻、联动）：SVG 或 Canvas + 自定义事件层
  - 静态展示、文字密集（如组织架构图、关系图）：SVG
  - 实时高频更新（秒级）：Canvas + `requestAnimationFrame` 优化
- **项目实践**：混合使用——KPI 卡片、简单柱状图用 SVG；实时趋势图、地图用 Canvas；通过配置化封装让业务层无感知

---

### Q7：WebGL 加速在大屏中有哪些应用场景？遇到过什么坑？

**参考答案要点：**
- **应用场景**：
  - 3D 地图/地球（ECharts GL 的 `map3D`、`globe`）
  - 大规模散点图、热力图（百万级数据点）
  - 复杂关系图（力导向布局节点数 > 5000）
  - 粒子效果、流体模拟等视觉增强
- **技术实现**：
  - ECharts GL 基于 Three.js 封装，可复用 ECharts 配置体系
  - 自定义 Shader：通过 `graphic.GL` 注入 GLSL 实现特殊效果（如热力图的动态渐变）
- **踩坑经验**：
  - **兼容性**：部分集成显卡或远程桌面环境不支持 WebGL，需降级到 Canvas
  - **内存泄漏**：WebGL Context 有上限（通常 8-16 个），大屏多图表场景需共享 Renderer 或及时 `dispose`
  - **调试困难**：WebGL 报错信息不友好，需配合 Spector.js 等工具抓帧分析
  - **文字渲染**：WebGL 中文字渲染需借助 Canvas2D 生成纹理，中文字体加载慢时会出现方框

---

## 三、实时数据

### Q8：大屏的实时数据推送架构是怎样的？WebSocket 断线后如何保障数据不丢失？

**参考答案要点：**
- **架构设计**：
  - 传输层：WebSocket 长连接，心跳机制（30s 间隔）保活
  - 协议层：自定义消息格式 `{ type: 'data', topic: 'order_realtime', payload: {}, timestamp: 1713686400000, seq: 10086 }`
  - 服务层：按主题（topic）订阅，不同大屏页面订阅不同数据频道
- **断线重连策略**：
  - 指数退避重连：1s -> 2s -> 4s -> 8s -> 最大 30s，避免洪泛
  - 重连后同步：携带 `lastSeq` 请求断线期间的数据，后端维护环形缓冲区（如最近 5 分钟数据）
  - 降级方案：WebSocket 不可用降级为 SSE（Server-Sent Events）或轮询（5s 间隔）
- **数据一致性**：
  - 关键指标（如 GMV、订单数）采用 `timestamp + seq` 去重，乱序到达时按时间排序
  - 非关键指标（如热力图）允许丢帧，优先保证实时性

---

### Q9：实时数据频繁更新（秒级），如何避免图表频繁重绘导致的性能问题和视觉闪烁？

**参考答案要点：**
- **节流与合并**：
  - 前端节流：使用 `requestAnimationFrame` 或 1-2s 的定时器合并数据更新，而非每收到一条消息就重绘
  - 后端聚合：将秒级数据在服务端聚合成 5s/10s 批次推送，减少推送频率
  - **渲染帧去重（Last Write Wins）**：当 WebSocket 推送频率高于渲染帧率时，中间帧会堆积，导致 `setOption` 排队、动画反复打断、CPU 飙高。前端只保留最新一帧，丢弃中间过程：
    ```js
    let latestData = null;
    let rafId = null;

    ws.onmessage = (e) => {
      latestData = JSON.parse(e.data); // 只缓存最新数据
      if (rafId) return;               // 若已预约下一帧，直接丢弃本次推送
      rafId = requestAnimationFrame(() => {
        chart.setOption(
          { series: [{ data: latestData }] },
          { notMerge: false, lazyUpdate: true }
        );
        rafId = null;
      });
    };
    ```
    或采用**固定频率渲染**，与 WS 推送彻底解耦：
    ```js
    let bufferData = null;
    ws.onmessage = (e) => { bufferData = JSON.parse(e.data); };

    setInterval(() => {
      if (!bufferData) return;
      chart.setOption({ series: [{ data: bufferData }] }, { notMerge: false });
      bufferData = null;
    }, 1000); // 无论 1s 内来了多少条消息，只渲染最后一次
    ```
- **增量更新**：
  - ECharts `setOption` 的第二个参数：`{ notMerge: false, lazyUpdate: true }`，只更新变化的数据系列
  - 对时间序列数据，使用 [`appendData`](https://echarts.apache.org/zh/api.html#echartsInstance.appendData) 动态追加（ECharts 5 支持），避免全量 `setOption`
- **视觉优化**：
  - 关闭更新动画或设置极短动画时长（`animationDuration: 100`）
  - **动画打断问题**：若 `animationDuration`（如 1000ms）大于数据推送间隔，每次 `setOption` 都会打断上一次动画，造成视觉闪烁。秒级高频更新场景建议直接 `animation: false`
  - 数字使用 `CountUp.js` 或 CSS transition 平滑过渡，不依赖图表重绘
  - 对表格类组件，使用虚拟滚动（如 `vue-virtual-scroller`）只渲染可视行
- **内存管理**：
  - 限制时间窗口：只保留最近 N 分钟数据，超期数据自动丢弃
  - 定期 `clear()` 或 `dispose()` 长时间运行的图表实例

---

### Q10：大屏数据缓存策略是怎样的？如何保证离线或弱网环境下基础数据可展示？

**参考答案要点：**
- **分层缓存**：
  - L1（内存）：Vuex/Pinia 存储当前会话数据，页面切换不丢失
  - L2（LocalStorage/IndexedDB）：存储静态配置（图表主题、布局）、最近 1 小时的历史数据
  - L3（Service Worker）：离线包缓存，确保 HTML/JS/CSS 离线可用
- **数据时效性标记**：每条缓存数据带 `cachedAt` 时间戳，展示时标注"数据更新时间"
- **弱网降级**：
  - 网络质量检测（`navigator.connection`），慢网时减少图表数量、关闭实时推送
  - 企业微信环境内：利用企业微信 JS-SDK 的缓存能力或小程序 WebView 的本地存储
- **缓存清理**：设置最大缓存容量（如 50MB），LRU 策略淘汰旧数据

---

## 四、图表设计

### Q11：ECharts 中如何实现复杂的自定义图表（如带进度环的仪表盘、异形柱状图）？

**参考答案要点：**
- **自定义系列（custom series）**：
  - 使用 `renderItem` 函数，基于 Canvas API 完全自定义绘制逻辑
  - 示例：进度环仪表盘 = 底层灰色圆环 + 上层渐变圆弧 + 中心文字，通过 `renderItem` 计算角度和路径
- **graphic 组件**：
  - 使用 `graphic.elements` 插入自定义 SVG Path、图片、文字，与图表叠加
  - 适合装饰性元素（如边框、背景水印、状态标识）
- **扩展 ECharts**：
  - 注册自定义系列：`echarts.registerMap`、`echarts.registerTheme`
  - 封装可复用的 Vue 组件，通过 props 传入配置，内部处理绘制逻辑
- **实际案例**：
  - 异形柱状图（圆角、渐变色、顶部图标）：使用 `itemStyle.borderRadius` + `linearGradient` + `label.formatter` 配合 `rich` 富文本
  - 带阴影的发光效果：`shadowBlur`、`shadowColor` 配合深色背景

---

### Q12：大屏中的下钻联动设计是如何实现的？比如从全国地图点击下钻到省份，再下钻到城市。

**参考答案要点：**
- **状态管理**：
  - 使用 Pinia 维护 `drillState`：`{ level: 'country' | 'province' | 'city', code: string, name: string }`
  - 下钻时更新状态，所有联动图表监听状态变化自动刷新
- **地图下钻**：
  - 预加载 geoJSON：全国、各省、重点城市三级 geoJSON 按需加载（`import()` 动态导入）
  - ECharts `map` 系列：`registerMap` 注册后，通过 `setOption` 切换 `map` 名称
  - 点击事件：`chart.on('click', params => { if (params.componentType === 'series') { drillDown(params.name) } })`
- **联动设计**：
  - 地图点击 -> 触发全局事件 -> 右侧 KPI 面板、趋势图、排行表同步更新
  - 使用 ECharts `connect` 实现多图表联动，或自定义事件总线（ mitt ）
  - 面包屑导航：记录下钻路径，支持返回上级
- **性能考虑**：
  - geoJSON 压缩：使用 topojson 格式，减少 60%+ 体积
  - 地图数据缓存：已加载的 geoJSON 存入内存，避免重复请求

---

### Q13：大屏的交互设计有哪些原则？如何平衡"炫酷"与"实用"？

**参考答案要点：**
- **设计原则**：
  - **3秒法则**：用户应在 3 秒内获取核心信息，避免过度装饰干扰数据阅读
  - **视觉层级**：通过颜色对比（如红绿黄状态色）、大小、位置引导注意力，核心 KPI 最大最醒目
  - **一致性**：同类型图表使用统一配色和交互模式，降低认知成本
- **交互深度控制**：
  - L1（静态展示）：默认状态，自动轮播、自动刷新，无人操作时也完整表达
  - L2（基础交互）：hover 显示详情、点击下钻、时间范围切换
  - L3（深度分析）：弹窗详情、多维度筛选、数据导出，仅在有操作意图时展开
- **实际做法**：
  - 运营监控场景：强调实时性和异常预警（红色闪烁、声音提示），减少不必要动画
  - 汇报展示场景：适当增加入场动画、过渡效果，提升视觉冲击力
  - 企业微信端：简化交互，以点击查看为主，避免复杂的 hover 和下钻

---

## 五、部署与稳定性

### Q14：大屏长时间运行（7x24小时）出现过哪些稳定性问题？如何排查和解决？

**参考答案要点：**
- **常见问题**：
  - **内存泄漏**：ECharts 实例未 `dispose`，事件监听未移除，setInterval/setTimeout 未清理
  - **CPU 占用高**：实时数据更新 + 动画导致主线程阻塞
  - **浏览器崩溃**：标签页内存超过 2-4GB（Chrome 单标签上限）
  - **时间漂移**：长时间运行后，定时器累积误差导致数据不同步
- **排查方法**：
  - Chrome DevTools Memory 面板：Heap Snapshot 对比，查找 detached DOM tree 和 retained ECharts 实例
  - Performance 面板：录制长时间运行的火焰图，定位高频函数
  - `performance.memory` API：监控内存使用趋势，超阈值报警
- **解决方案**：
  - 实例管理：页面卸载/图表切换时调用 `chart.dispose()`，使用 WeakMap 管理实例引用
  - 定时器治理：所有 `setInterval` 封装为可清理的服务，页面失焦时暂停（`document.visibilitychange`）
  - 自动刷新页面：设置 4-6 小时自动 `location.reload()`，彻底释放内存（配合 sessionStorage 恢复状态）
  - 使用 Web Worker 处理数据，减少主线程压力

---

### Q15：大屏的自动刷新和热更新机制是如何设计的？

**参考答案要点：**
- **数据自动刷新**：
  - 配置化刷新间隔：不同图表可配置不同刷新频率（KPI 5s、趋势图 30s、报表 5min）
  - 智能刷新：数据变化时才触发更新，通过对比 hash 或 timestamp 判断
  - 刷新状态提示：右上角显示"数据更新中"旋转图标，更新完成显示"刚刚更新"
- **配置热更新**：
  - 图表配置（颜色、标题、阈值）存储在数据库/配置中心，前端轮询配置版本号
  - 版本变化时，不刷新页面动态应用新配置（`chart.setOption(newConfig)`）
  - 布局热更新：使用 JSON Schema 描述大屏布局，后端保存后前端重新渲染（类似低代码平台）
- **代码热更新**：
  - 开发环境：Vite HMR
  - 生产环境：使用微前端架构（如 qiankun），大屏作为独立应用可独立部署更新

---

### Q16：大屏的监控告警体系是如何搭建的？如何第一时间发现大屏故障？

**参考答案要点：**
- **前端监控**：
  - 性能监控：FP/FCP/FID/LCP 指标，图表首屏渲染时间 > 3s 报警
  - 错误监控：Sentry 捕获 JS 异常、Promise 拒绝、资源加载失败
  - 业务监控：数据接口成功率、WebSocket 连接状态、图表渲染失败率
- **大屏专用监控**：
  - 截图比对：定时对大屏截图，与基准图对比，发现白屏、布局错乱
  - 心跳检测：大屏页面向监控服务发送心跳，失联即报警
  - 数据新鲜度监控：核心业务指标超过 5 分钟未更新则触发预警
- **告警通道**：
  - 企业微信机器人：异常时推送群消息
  - 短信/电话：P0 级故障（如大屏完全不可用）
  - 值班轮询：大屏现场值班人员 + 远程 on-call


采集代码（最简可用版）
```js
  const chart = echarts.init(dom)

  // 记录 setOption 调用时刻
  const renderStart = performance.now()

  // 监听 ECharts 渲染完成事件
  chart.on('rendered', () => {
    const duration = Math.round(performance.now() - renderStart)

    // 上报
    report({
      type: 'chart_first_render',
      duration,          // 纯渲染耗时（ms）
      page: location.pathname,
      chartType: 'line',
      timestamp: Date.now(),
      isSlow: duration > 3000,  // 标记是否超过 3s
    })
  })

  chart.setOption(option)
```

为什么用 rendered 不用 finished？
- rendered：Canvas/SVG 已经画完，图表可见可交互
- finished：等所有动画播完才触发。如果动画 1s，你的 3s 阈值会被动画时间"污染"


## 六、多端展示

### Q17：同一份数据大屏，如何在 PC 大屏、企业微信 PC 端、企业微信手机端差异化展示？

**参考答案要点：**
- **响应式策略**：
  - 断点划分：>= 1920（大屏）、>= 1366（PC）、>= 768（平板）、< 768（手机）
  - 企业微信内嵌：通过 `wx.invoke('getSystemInfo')` 或 UA 判断环境，调整交互方式
- **布局差异**：
  - PC 大屏：多列布局（3-4 列），图表并列展示，支持复杂联动
  - 企业微信 PC：与 PC 大屏类似，但需适配企业微信侧边栏宽度（可能占 20% 屏幕）
  - 企业微信手机：单列布局，图表堆叠，核心 KPI 置顶，隐藏次要图表或折叠到二级页面
- **图表适配**：
  - 小屏简化：图例从右侧/顶部改为底部或隐藏（点击显示）；坐标轴标签旋转或省略；tooltip 固定位置避免遮挡
  - 交互适配：手机端禁用 hover，改用 click；下钻改为页面跳转而非弹窗
  - 字体适配：手机端最小 14px，避免 ECharts 自动缩放过小
- **技术实现**：
  - 同一数据源，不同渲染组件：PC 用复杂 ECharts 组件，手机用简化版或卡片式展示
  - 条件编译/动态导入：`import.meta.glob` 按端加载不同组件

---

### Q18：企业微信环境中访问大屏，遇到过哪些兼容性或权限问题？

**参考答案要点：**
- **兼容性问题**：
  - 企业微信内置浏览器基于 Chromium，但版本滞后（可能对应 Chrome 80+），需确认 ES2020+ 语法兼容性
  - WebGL 在企业微信某些版本（尤其是 Windows 旧版）中默认禁用，需检测并降级
  - 企业微信 PC 端缩放比例（125%、150%）导致页面模糊，需设置 `viewport` 和 `minimum-scale`
- **权限问题**：
  - 身份认证：企业微信 OAuth2 登录，获取 `userid` 后换取系统账号，单点登录（SSO）
  - 数据权限：根据企业微信组织架构（部门 ID）控制可见数据范围
  - 企业微信 JS-SDK：调用 `agentConfig` 鉴权后，可使用扫码、定位、分享等能力
- **特殊场景**：
  - 企业微信侧边栏打开：宽度仅 400-600px，需专门适配
  - 企业微信工作台：图标和名称规范，需按官方尺寸提供
  - 消息卡片推送：将关键指标通过企业微信机器人推送到群，点击跳转大屏详情

---

### Q19：移动端展示大屏时，如何处理大量图表导致的性能问题和发热耗电？

**参考答案要点：**
- **渲染优化**：
  - 减少图表数量：手机端只保留核心 3-5 个图表，其余用文字卡片或折叠菜单替代
  - 禁用动画：`animation: false`，减少 GPU 占用
  - 降低数据精度：手机端数据聚合粒度更粗（如按天而非按小时）
- **资源控制**：
  - 图片懒加载：装饰性背景图、图标按需加载
  - 字体子集化：只加载用到的字符，减少字体文件体积
  - 减少轮询频率：手机端数据刷新间隔延长至 30s-1min
- **体验优化**：
  - 页面可见性 API：手机切后台时暂停数据请求和渲染（`document.hidden`）
  - 降低屏幕亮度提示：长时间展示时提示用户接电使用
  - 提供"省电模式"：用户可手动切换为纯文字模式，关闭所有图表

---

### Q20：如果让你从零设计一个可配置、可复用的大屏搭建平台，技术架构会怎么设计？

**参考答案要点：**
- **核心架构**：
  - 前端：Vue3 + TypeScript + Vite，低代码画布（参考 datav、帆软）
  - 图表库：ECharts 为主，Highcharts/Plotly 作为扩展，统一封装为组件市场
  - 状态管理：Pinia 管理画布状态，Yjs 或自研 OT 算法实现协同编辑
- **关键模块**：
  - **画布引擎**：基于绝对定位的拖拽布局，支持网格吸附、层级管理、组合/解组
  - **组件系统**：JSON Schema 描述组件 props，支持自定义组件上传（Vue SFC 或 UMD 包）
  - **数据源层**：支持静态数据、API、WebSocket、SQL 查询，数据转换层（类似轻量 ETL）
  - **主题系统**：全局主题变量（颜色、字体、圆角），组件级样式覆盖
- **大屏适配层**：
  - 布局引擎支持多分辨率预设，导出时自动 scale 适配
  - 多端发布：一次搭建，生成 PC/手机/企业微信多份配置
- **部署与稳定性**：
  - 微前端架构：编辑器、预览、播放器分离部署
  - 配置版本管理：大屏配置支持历史版本回滚
  - 运行时监控：嵌入自研 SDK，自动上报性能和错误

---

<a id="sw-cache-strategy"></a>

## 附：Service Worker 缓存图表数据策略

> 在 Q4 / Q10 中提及"Service Worker 缓存图表数据"，此处对该方案做完整参考：策略代码、优缺点、适用场景。

### 一、参考代码

#### 1. 注册（主应用入口）

```js
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('[SW] registered', reg.scope))
      .catch(err => console.error('[SW] failed', err))
  })
}
```

#### 2. `public/sw.js` —— 按接口分策略

```js
/**
 * Service Worker 缓存策略 —— 数据大屏专用
 * 目标：首屏秒开 + 弱网兜底 + 不同接口走不同缓存策略
 */

// 版本号：每次发布新逻辑时递增，确保旧缓存被清理
const CACHE_VERSION = 'dashboard-v1'
// 数据缓存库名称，版本隔离防止旧数据污染
const DATA_CACHE = `chart-data-${CACHE_VERSION}`

/**
 * 策略配置表：按 URL 匹配，灵活控制每条接口的缓存行为
 * - strategy: 缓存策略名
 * - ttl: 缓存有效期（毫秒），过期后视为不可用
 */
const STRATEGIES = [
  // 实时接口：网络优先，缓存仅作断网兜底，TTL 极短（5s）
  { test: /\/api\/realtime\//,  strategy: 'network-first',          ttl: 5_000 },
  // 历史接口：先读缓存展示，后台静默更新，适合报表型大屏
  { test: /\/api\/history\//,   strategy: 'stale-while-revalidate', ttl: 60_000 },
  // 配置接口：几乎不变，缓存优先，后台静默刷新，TTL 一天
  { test: /\/api\/config\//,    strategy: 'cache-first',            ttl: 86_400_000 },
]

// ===== 生命周期：install =====
self.addEventListener('install', () => {
  // skipWaiting 立即激活，避免新版本等待旧版本退出（适合频繁更新的后台大屏）
  self.skipWaiting()
})

// ===== 生命周期：activate =====
self.addEventListener('activate', (e) => {
  e.waitUntil(
    // 清理不属于当前版本的旧缓存，防止磁盘膨胀
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== DATA_CACHE) // 保留当前版本
          .map(k => caches.delete(k))    // 删除旧版本
      )
    ).then(() =>
      // claim 立即接管所有页面，避免刷新后才生效
      self.clients.claim()
    )
  )
})

// ===== 核心：拦截 fetch =====
self.addEventListener('fetch', (event) => {
  const { request } = event

  // SW 默认只能可靠缓存 GET 请求；POST/PUT/DELETE 跳过
  if (request.method !== 'GET') return

  // 按 URL 匹配策略表，未命中的请求不拦截（如静态资源交给浏览器默认缓存）
  const rule = STRATEGIES.find(r => r.test.test(request.url))
  if (!rule) return

  // 劫持该请求，由自定义逻辑响应
  event.respondWith(handle(request, rule))
})

/**
 * 请求处理调度器
 * @param request 原始 Request 对象
 * @param strategy 缓存策略名
 * @param ttl      缓存有效期（毫秒）
 */
async function handle(request, { strategy, ttl }) {
  const cache = await caches.open(DATA_CACHE)
  const cached = await cache.match(request)

  // 判断缓存是否"新鲜"：存在 且 未超过 TTL
  const fresh = cached && (Date.now() - Number(cached.headers.get('x-cached-at')) < ttl)

  // ---------- 策略 1：缓存优先（适合配置、字典类接口） ----------
  if (strategy === 'cache-first' && fresh) {
    // 即使命中缓存，也静默发请求更新（可选，此处省略以简化逻辑）
    return cached
  }

  // ---------- 策略 2：网络优先（适合实时数据） ----------
  if (strategy === 'network-first') {
    try {
      // 优先走网络，拿到后同时写入缓存
      return await fetchAndStore(request, cache)
    } catch {
      // 网络失败时兜底：有缓存读缓存，否则返回 JSON 错误
      return cached || jsonError('offline')
    }
  }

  // ---------- 策略 3：Stale-While-Revalidate（适合历史/报表数据） ----------
  if (strategy === 'stale-while-revalidate') {
    // 后台静默发请求更新缓存，不阻塞当前响应
    const updating = fetchAndStore(request, cache).catch(() => null)
    // 有缓存立刻返回（即使旧一点），没缓存则等网络结果
    return cached || updating
  }

  // 兜底：默认网络请求并缓存
  return fetchAndStore(request, cache)
}

/**
 * 网络请求 + 缓存写入
 * 注意：Response 只能消费一次，必须用 clone 存两份
 */
async function fetchAndStore(request, cache) {
  const res = await fetch(request)
  // 只缓存成功响应；4xx/5xx 不写入缓存，避免脏数据长期滞留
  if (!res.ok) return res

  // 克隆响应体，同时给 Header 打时间戳，用于后续 TTL 新鲜度判断
  const cloned = new Response(await res.clone().blob(), {
    status: res.status,
    headers: {
      ...Object.fromEntries(res.headers),
      'x-cached-at': Date.now().toString(),
    },
  })

  // 一份写入 Cache Storage，一份返回给页面
  cache.put(request, cloned.clone())
  return cloned
}

/**
 * 构造离线时的兜底 JSON 响应
 * 业务侧可识别 { ok: false, reason: 'offline' } 做降级展示
 */
function jsonError(reason) {
  return new Response(JSON.stringify({ ok: false, reason }), {
    headers: { 'Content-Type': 'application/json' },
  })
}
```

#### 3. 主线程主动失效（点"刷新"按钮时）

```js
// 业务侧
navigator.serviceWorker.controller?.postMessage({
  type: 'INVALIDATE',
  url: '/api/history/sales',
})

// sw.js
self.addEventListener('message', async (e) => {
  if (e.data?.type === 'INVALIDATE') {
    const cache = await caches.open(DATA_CACHE)
    await cache.delete(e.data.url)
  }
})
```

### 二、优点

| 维度 | 说明 |
|------|------|
| 首屏快 | 缓存命中直接返回，跳过网络往返，大屏冷启动从几秒压到 200ms 内 |
| 弱网兜底 | 网络抖动 / 断网时仍能显示上一份数据，不会白屏闪烁 |
| 减轻后端 | 多 tab、刷新页面都吃同一份缓存，后端 QPS 显著下降 |
| 业务无感知 | 业务里仍写 `fetch('/api/...')`，缓存层透明，不污染组件 |
| 后台同步 | 配合 Background Sync / Periodic Sync 实现离屏预拉取 |
| 跨页面共享 | 多个看板页面共享同一缓存，切换无需重新拉数据 |

### 三、缺点 / 坑点

1. **实时性冲突** —— 大屏通常追求秒级 / 毫秒级刷新，过激缓存会让看板"骗人"，必须给每条接口单独评估 TTL。
2. **HTTPS 强制** —— 除 `localhost` 外必须 HTTPS，内网大屏要自签证书或反向代理。
3. **生命周期反直觉** —— `install / waiting / activate / claim` 链路复杂，旧版本 SW 会"赖着不走"，常见现象是"代码改了但页面拿到的还是老逻辑"。
4. **调试成本高** —— DevTools 要勾 `Update on reload` / `Bypass for network`，否则改了 sw.js 看不到效果。
5. **不能拦截 WebSocket / SSE** —— 实时推送通道 SW 管不到，对推送型大屏基本无收益。
6. **存储配额** —— Cache Storage 走浏览器配额（一般几十 MB ~ 几百 MB），图表数据量大时要做 LRU 清理，否则被浏览器整体驱逐。
7. **缓存一致性** —— 多 tab、强制刷新、版本发布场景常出现"明明改了接口字段但前端还在画老图"，需 `CACHE_VERSION` + 版本协商。
8. **POST 接口失效** —— 默认只能缓存 `GET`，很多大屏数据接口是 `POST` 查询，需要做 key 序列化才能命中。
9. **常开设备红利打折** —— Kiosk 模式下浏览器极少关闭，"二次打开秒开"的收益被稀释。

### 四、适用 / 不适用场景

| 场景 | 建议 |
|------|------|
| 报表型 / 历史型大屏（小时、日维度） | ✅ 强烈推荐，SWR 命中率最高 |
| 工厂、户外、车载等弱网环境 | ✅ 推荐，可作为离线兜底 |
| 多看板共用字典 / 配置接口 | ✅ 推荐，cache-first + 后台静默更新 |
| 秒级实时监控（运维、交易、风控） | ❌ 不建议，反而掩盖故障 |
| 数据强一致（金额、告警） | ❌ 不建议，宁可白屏也别给错数 |
| 用 WebSocket / SSE 推送的大屏 | ⚠️ 没必要，SW 拦不到推送 |

> 一句话总结：**Service Worker 适合"读多、变慢、能容忍秒级旧"的图表数据；不适合"高频实时、强一致"的看板**。给每条接口单独配 TTL / 策略，比一刀切更安全。

<a id="echarts-connect"></a>

## 附：ECharts connect 图表联动机制

> 在 Q4 / Q12 中提及"对联动图表使用 connect"，此处对该 API 做完整说明：用法、行为差异、异构限制、与手动监听的取舍。

### 一、正确用法（v5）

```js
const chartA = echarts.init(domA);
const chartB = echarts.init(domB);
const chartC = echarts.init(domC);

// 方式一：先挂 group，再按 groupId 连接
chartA.group = 'dashboard-group';
chartB.group = 'dashboard-group';
chartC.group = 'dashboard-group';
echarts.connect('dashboard-group');

// 方式二：直接传入实例数组
echarts.connect([chartA, chartB, chartC]);

// 断开联动
echarts.disconnect('dashboard-group');
```

### 二、connect 到底同步了什么？

不是"所有事件自动广播"，而是 ECharts 内部针对**特定交互状态**做自动同步：

| 同步的行为 | 效果 |
|-----------|------|
| `dataZoom` | 一张图缩放 / 平移，同组其它图表同步到相同的坐标轴范围 |
| `legendToggleSelect` | 点图例隐藏某系列，同组图表对应 series name 也隐藏 |
| `brush` | 框选后，同组图表高亮相同的数据区域 |
| `axisPointer` | 鼠标悬停时，同组图表显示对应位置的 axisPointer |

> 注意：`click` 业务事件（如点击地图下钻）**不会**自动同步，仍需手写 `on('click')` + `setOption`。

### 三、行为对比 Demo（同构图表）

下面代码可直接保存为 `.html` 运行。点击"开启联动"后，缩放任意一张图，观察另外两张是否跟随：

<<<./demo/case-1.vue

<case1 />

---

<<<./demo/case-2.vue

<case2 />


**运行后对比：**

| 状态 | 操作图表 A | 图表 B、C 表现 |
|------|-----------|---------------|
| **未联动** | 框选放大某一段 | **完全不动**，保持原样 |
| **已联动** | 框选放大某一段 | **自动缩放到相同区间** |
| **已联动** | 点击 legend 隐藏"销售额" | **同步隐藏"销售额"** |
| **已联动** | 拖动底部 slider | **同步平移** |

### 四、异构图表（折线 + 柱状 + 饼图）的结论

**技术上可以 `connect`，但效果取决于图表类型是否支持对应交互。**

| 同步的行为 | 折线图 | 柱状图 | 饼图 | 联动效果 |
|-----------|--------|--------|------|---------|
| `dataZoom` | ✅ 有轴，支持 | ✅ 有轴，支持 | ❌ 无轴，不支持 | 饼图完全无动于衷 |
| `legendToggleSelect` | ✅ | ✅ | ✅ | 只有 **series name 完全一致** 时才有效 |
| `brush` | ✅ | ✅ | ❌ | 饼图无响应 |
| `axisPointer` | ✅ | ✅ | ❌ | 饼图无坐标轴，不显示 |

> 面试要点：如果问到"不同类型图表能不能 connect"，要答**"可以连，但 dataZoom/brush 对无轴图表无效；legend 联动要求 series name 一致。"**

### 五、connect vs 手动监听：什么时候用什么？

| 场景 | 推荐方案 | 原因 |
|------|---------|------|
| 同类型图表，只需要 1:1 同步 dataZoom / legend | `echarts.connect` | 一行代码搞定，无循环风险 |
| 异构图表，需要个性化映射（如 A 缩放 3月，B 要加 5% 边距） | 手动 `on('dataZoom')` + `dispatchAction` | connect 只能 identical 同步，无法自定义映射 |
| 需要同步 `click` 业务事件（如点击下钻） | 手动 `on('click')` + `setOption` | connect 不广播 click |
| 数据源长度不同（A 100 条，B 50 条） | 手动监听 | connect 按百分比同步会错位，需手动换算索引 |

**手动监听的典型写法（防循环）：**

```js
let inSync = false;

chartA.on('dataZoom', () => syncFrom(chartA));
chartB.on('dataZoom', () => syncFrom(chartB));
chartC.on('dataZoom', () => syncFrom(chartC));

function syncFrom(sourceChart) {
  if (inSync) return;
  const dz = sourceChart.getOption().dataZoom?.[0];
  if (!dz) return;

  inSync = true;
  [chartA, chartB, chartC].forEach(target => {
    if (target === sourceChart) return;
    // 个性化映射写在这里
    target.dispatchAction({
      type: 'dataZoom',
      startValue: dz.startValue,
      endValue: dz.endValue,
    });
  });
  inSync = false;
}
```

### 六、注意事项

1. **用 `startValue/endValue`，别用 `start/end`** —— 百分比在不同数据长度的图表间会错位，真实轴值才可靠。
2. **`dispatchAction` 优于 `setOption`** —— 走 action 通道性能更好，也不会把 dataZoom 写死到 option 里。
3. **`inSync` 锁必不可少** —— 手动监听时，A → B → A 的无限循环靠布尔锁阻止。
4. **谁触发、谁就是 source** —— 不要固定某张图为 master，任何一张被用户缩放时都应成为 source。
5. **connect 不同步业务事件** —— `click`、`mouseover` 等业务逻辑仍需手写事件总线（mitt / 全局状态）。

---

## 附：评分参考

| 能力维度 | 考察重点 |
|---------|---------|
| 适配方案 | 是否理解 scale/rem/vw 的本质差异，能否根据场景选择 |
| 性能优化 | 是否有大数据量实战经验，是否了解 ECharts 底层渲染机制 |
| 实时数据 | 是否设计过完整的推送-消费-降级链路 |
| 图表设计 | 是否有自定义图表封装能力，是否理解可视化设计原则 |
| 稳定性 | 是否有 7x24 运维经验，是否建立过监控体系 |
| 多端展示 | 是否理解企业微信生态特性，是否有移动端适配经验 |
| 架构设计 | 是否有平台化思维，能否抽象复用能力 |


## 参考项目分析

- [链云运营数据看板](./operator.md)