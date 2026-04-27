# 链云运营数据看板

## 项目定位

链云运营数据看板是一个面向企业内部运营、管理层和业务监控场景的数据大屏项目，部署在企业微信工作台入口中。系统聚合砂石骨料价格指数、运价指数、年度交易额、平台交易商品、市场交易动态、AI 控货设备、AI 调度分析和调度动态等业务数据，通过高密度可视化、自动刷新、轮播展示和数字动画，支撑运营侧对交易、运力、货物、设备和调度能力的实时感知。

项目入口位于 `E:\work\lian-yun\zhihaoscm-web\packages\operational-data-dashboard`，技术栈以 Vue 3、Vite、TypeScript、Pinia、Vue Router、ECharts、ECharts GL、Swiper、企业微信 JSSDK、autofit.js、NumberFlow 为主。

## 技术架构概览

- 前端框架：Vue 3 + Composition API + `<script setup lang="ts">`。
- 工程化：Vite 多环境构建，开发环境代理 `/api`，生产环境按 `.env.production` 指向正式 API。
- 状态管理：Pinia 管理全局刷新任务和真假数据开关。
- 图表能力：ECharts 折线、散点、面积图，ECharts GL 参数曲面实现 3D 饼图。
- 大屏适配：`autofit.js` 按 1920 x 1440 设计稿进行整体缩放。
- 登录认证：企业微信桌面端扫码登录、企业微信工作台 code/token 登录、普通浏览器登录页兜底。
- 数据策略：路由进入时请求配置开关，决定使用真实接口数据还是演示数据。
- 部署链路：Jenkins 按 dev/staging/hotfix/prod 分支或流水线阶段构建并推送到 nginx 静态目录。

## 核心业务模块

### 1. 大屏主容器与布局编排

`src/views/dashboard/index.vue` 负责整体三栏布局：左侧价格与行情，中间交易额与市场动态，右侧 AI 控货与调度。页面不是单纯堆组件，而是承担了大屏级别的数据刷新编排。

实现特点：

- 使用 `autofit.init({ dw: 1920, dh: 1440 })` 对大屏进行统一缩放。
- 主容器通过 `compRefs` 收集需要统一刷新的子组件实例。
- 使用 Pinia 的 `dashbordStore.register()` 注册子组件暴露的 `getDetail` 方法。
- 使用 `useRafTicker(0, 5000)` 形成 5 秒节奏的全局刷新触发。
- `dashbordStore.runAll()` 并行执行任务，单个任务失败不会阻塞其他模块刷新。

这个设计适合数据大屏：不同业务卡片的数据互相独立，统一调度可以降低页面层定时器散落的问题，并且能集中收集失败任务。

### 2. 任务中心与容错刷新机制

`src/stores/modules/dashbordStore.ts` 抽象了一个轻量任务中心：

- `register(id, fn, retryInterval)` 注册异步任务。
- `unregister(id)` 注销任务。
- `runAll()` 并发执行所有任务。
- 单任务最多重试 3 次。
- 失败任务最终以 `FailLog[]` 形式返回。

难点在于大屏组件数量多、接口多、刷新频率高，如果每个组件各自维护定时器，会造成节奏不可控、请求重叠、异常难定位。这个任务中心把“刷新调度”提升为全局能力，是项目里比较值得提炼的工程亮点。

### 3. 真假数据切换与演示模式

项目通过 `getDataConfig()` 获取后端开关，`dashboardConfigStore.isRealData` 决定是否走真实接口。部分模块在演示模式下使用本地 mock，并做了不同展示逻辑：

- 年度累计交易额在演示模式下使用本地初始值，并每小时自动增长。
- 市场交易动态图在演示模式下使用 `mockData.ts`，并切换为 5 条商品曲线。
- 热门产品、热门航线在演示模式下只展示指定价格字段。
- AI 调度信息在演示模式下对描述文本做脱敏。

这个能力说明项目不是简单的数据展示页，而是兼顾了真实运营和客户/会议演示两类场景。难点在于同一套 UI 要兼容真实数据、演示数据、字段差异和脱敏规则。

### 4. 复杂图表与动态窗口展示

项目中图表不是静态配置，存在多种动态处理：

- 砂石骨料价格指数图：支持近一周、近一月切换，动态计算 Y 轴 min/max，0 值转为 `null`，避免断点误展示为真实低值。
- 运价综合指数图：基于 computed 生成 ECharts option，响应日期和筛选条件。
- 市场交易动态图：交易额折线 + 商品散点/曲线混合展示，按 6 个点为窗口每 5 秒滚动切片。
- 平台交易商品图：使用 ECharts GL 的 `surface` + 参数方程模拟 3D 饼图，并开启自动旋转。

其中 3D 饼图是技术亮点。`platformTradeChart.vue` 通过 `getParametricEquation(startRatio, endRatio, height)` 为每个扇区生成参数曲面，根据交易额占比计算曲面角度和高度，再用 `grid3D.viewControl.autoRotate` 实现自动旋转。这比普通 2D 饼图更贴合大屏的展示冲击力。

### 5. AI 控货视频监控

`aiControlledCargo.vue` 是项目里业务复杂度较高的模块。它不仅展示设备数量，还接入船舶视频：

- 调用设备 token 接口获取视频鉴权 token。
- 根据船舶设备 id 拼接视频播放器 iframe 地址。
- 使用 Swiper 以每页两个视频的方式轮播。
- 只给当前页视频填充 `url`，离开的页清空 `url`，降低 iframe 播放资源占用。
- 通过 `TaskBridge` 和 iframe 使用 `postMessage` 交互，监听 `playerError` 和 `playerSuccess`。
- 对播放失败的设备加入 `failIds`，从后续视频轮播列表中剔除，并尝试用末尾可用设备补位。

这个模块的难点在于外部播放器是独立页面，父页面无法直接读取播放器状态，只能靠跨窗口消息协议做状态回传。它同时涉及鉴权、视频资源懒加载、轮播状态管理、异常设备剔除和 UI 状态同步。

### 6. 企业微信登录与访问控制

项目覆盖了两种企业微信场景：

- 企业微信工作台内打开：URL 携带 code 或 token，路由守卫中自动登录或写入 token。
- 普通浏览器打开：进入 `/login`，使用 `@wecom/jssdk` 创建企业微信登录组件，扫码后拿 code 换 accessToken。

`src/routes/index.ts` 在路由守卫里处理 token、白名单、企微上下文跳转、登录页兜底和数据开关初始化。`src/apis/request.ts` 在请求拦截器中附加 `Authorization` 和灰度版本号，响应拦截器统一处理业务错误、401、网络错误和离线状态。

这块可以提炼为：企业内部系统的统一登录态接入、企微多端入口兼容和权限异常兜底。

### 7. 数字动效与高频数据展示

项目对关键数字做了多层动效：

- `@number-flow/vue` 用于普通统计卡片的数字滚动。
- 自定义 `flipBoard.vue` 和 `flipDigit.vue` 用于年度累计成交贸易额的翻牌式大数字展示。
- `annualTransactionAmount.vue` 对主数字动画期间的新值做 pending 缓冲，避免动画中途被刷新打断。
- 多个排行榜和行情卡片使用 `transition-group` 实现列表进出和字段切换动画。

这说明项目关注的不只是数据正确性，还有大屏观看体验：刷新不能突兀，数据变化要可感知，关键指标要有视觉权重。

## 可写进简历的技术重难点

### 技术难点 1：多模块数据大屏的统一刷新调度

可表述为：

> 设计并实现基于 Pinia 的大屏任务调度中心，将各业务卡片的数据刷新函数注册为可重试异步任务，统一按 5 秒节奏并发刷新，支持单任务 3 次重试和失败日志收集，避免多组件独立定时器导致的请求失控和异常难追踪问题。

对应代码：`src/views/dashboard/index.vue`、`src/stores/modules/dashbordStore.ts`。

### 技术难点 2：复杂业务数据的可视化建模

可表述为：

> 基于 ECharts 封装砂石价格指数、运价指数、交易额趋势、商品成交占比等多类图表，处理多维时间序列、0 值断点、动态 Y 轴、滑动窗口轮播和多业务曲线/散点混合展示，提升运营数据的可读性和实时观察效率。

对应代码：`priceIndexChart.vue`、`freightIndexChart.vue`、`marketTransactionDynamicsChart.vue`。

### 技术难点 3：ECharts GL 参数曲面 3D 饼图

可表述为：

> 使用 ECharts GL 的 surface 参数曲面能力实现 3D 环形饼图，根据商品交易额占比动态生成扇区曲面方程，并结合自动旋转、可见性监听和图表实例销毁重建，完成大屏高表现力的成交商品占比展示。

对应代码：`platformTradeChart.vue`。

### 技术难点 4：企业微信工作台与桌面扫码登录兼容

可表述为：

> 接入企业微信工作台和桌面端扫码登录，路由守卫内兼容 code/token 两种登录态来源，统一写入本地 token，并通过 Axios 拦截器自动注入认证头和灰度版本号，完成企业内部系统的权限访问闭环。

对应代码：`routes/index.ts`、`login/useWxLogin.ts`、`apis/request.ts`。

### 技术难点 5：视频 iframe 状态通信与资源控制

可表述为：

> 在 AI 控货模块中接入第三方视频播放器 iframe，通过 postMessage 封装父子窗口 TaskBridge，监听播放成功/失败事件；结合 Swiper 轮播只加载当前页视频流，并对异常设备自动剔除补位，降低多路视频同时播放带来的资源压力。

对应代码：`aiControlledCargo.vue`、`utils/TaskBridge.ts`。

### 技术难点 6：真实数据与演示数据双模式

可表述为：

> 通过后端配置开关实现真实运营数据与演示数据双模式切换，同一套大屏兼容接口数据、mock 数据、脱敏展示和演示增长逻辑，支持内部运营监控和外部演示复用。

对应代码：`dashboardConfig.ts`、`annualTransactionAmount.vue`、`marketTransactionDynamicsChart.vue`、`aiDispatchInfo.vue`。

## 项目亮点总结

- 大屏级刷新调度抽象比较清晰，避免所有组件各写一套刷新逻辑。
- 图表类型丰富，覆盖折线、面积、散点、3D 饼图、排行榜、滚动列表、数字翻牌。
- 视频监控模块具备真实业务复杂度：鉴权、取流、轮播、播放状态回传、失败剔除。
- 企业微信登录链路覆盖工作台和桌面浏览器，符合企业内部系统入口特点。
- 演示模式不是简单 mock，而是包含字段裁剪、展示变体、脱敏和定时增长。
- 使用 TypeScript 定义了较完整的接口类型，利于前后端接口协作。
- 使用 `autofit.js`、字体资源和大量 SVG/WEBP 素材还原大屏设计稿。

## 当前实现中不合理或可提升的点

### 1. 刷新调度需要区分“全局数据刷新”和“产品节奏刷新”

主页面有统一任务中心，但部分组件自己控制刷新节奏：

- `popularProductsMarket.vue` 内部使用递归 `setTimeout`。
- `popularRoutesIndex.vue` 内部使用递归 `setTimeout`。
- `aiDispatchDynamics.vue` 使用 `while (shouldContinue)` + `setTimeout` 每 5 秒刷新。
- 多个图表组件内部也各自使用 `useRafTicker(0, 5000)`。

这里不能简单判定为不合理。热门行情、热门航线、滚动列表、视频轮播这类组件的数据刷新往往和产品展示节奏绑定：例如一轮价格字段切换完成后再取下一批数据，或当前视频页轮播结束后再加载下一组资源。这类局部刷新是合理的产品特定设计。

真正需要优化的不是“全部收敛到一个定时器”，而是补齐局部刷新任务的生命周期治理：组件卸载时可取消、页面隐藏时可暂停、请求失败时可观测、避免递归定时器残留。全局任务中心适合处理基础指标类刷新；产品节奏强相关的模块可以保留组件内调度，但最好封装成可取消的 `usePollingTask` / `useLoopTask`，统一处理 stop、resume、错误记录和可见性暂停。

### 2. 组件实例 ref 调用耦合较重

`dashboard/index.vue` 通过 `compRefs.xxx.getDetail` 直接调用子组件暴露方法。这种方式能快速落地，但会让父组件知道太多子组件内部 API。

风险：

- 某个子组件未挂载或未暴露 `getDetail` 时容易运行时报错。
- 任务注册依赖手写 key，缺少类型约束。
- 后续组件拆分或懒加载时维护成本较高。

优化建议：不建议直接把注册完全下放给子组件，否则父容器确实很难知道“所有首屏任务是否已注册完成”，也就无法可靠决定什么时候第一次触发 `runAll()`。更稳妥的方案是保留父容器作为启动编排者，做轻量改造：

- 方案一：继续由父容器注册首屏关键任务，但补充类型约束和空值保护，明确哪些组件纳入全局刷新。
- 方案二：子组件可以声明任务元信息，但父容器通过 `provide/inject` 或注册回调收集任务，并等待 `nextTick` 或约定的 `ready` 数量后再首次 `runAll()`。
- 方案三：只让“可延迟、不影响首屏”的任务自注册；首屏关键指标仍由父容器统一注册和启动。

以当前项目看，父容器手动注册并立即 `runTasks()` 的方式虽然耦合更高，但启动时机清晰，符合大屏首屏数据确定性要求。优化方向应是增强类型和生命周期，而不是机械地改成子组件自注册。

### 3. 多处异常被静默吞掉

很多接口调用 catch 中只有 `void 0`，例如行情、图表、AI 调度等模块。虽然不会影响页面展示，但生产排查会比较困难。

风险：

- 接口失败后没有降级态、无错误标识、无日志上报。
- 大屏看起来只是“不动了”，无法判断是无数据、接口异常还是组件内部异常。

优化建议：统一封装 `safeRequest` 或在任务中心记录错误类型、接口名、重试次数，并接入监控/埋点。至少保留开发环境日志和生产环境错误上报。

### 4. TaskBridge 存在事件监听和安全风险

`TaskBridge` 在构造函数中 `window.addEventListener("message", ...)`，但没有提供 `destroy()` 移除监听。`aiControlledCargo.vue` 中多个 iframe 会创建多个 bridge，长时间运行或路由切换后可能累积监听器。

另外，`targetOrigin` 默认是 `"*"`，接收消息时也没有校验 `event.origin` 和 `event.source`。在企业内网环境风险较低，但从安全设计上不够严谨。

优化建议：

- 为 `TaskBridge` 增加 `destroy()`，组件卸载或 iframe 移除时清理监听。
- 指定播放器域名作为 `targetOrigin`。
- 接收消息时校验 `event.origin`、`event.source` 和消息结构。
- 给 pending task 增加 timeout，避免对方不响应导致 Map 常驻。

### 5. 3D 饼图 option 不是完全响应式

`platformTradeChart.vue` 中 `option.series = getPie3D()` 在模块初始化时计算一次。后续 props.data 变化时只是 `chartInstance.setOption(option)`，但 `option.series` 没有重新生成，可能导致图表数据更新不完整。

优化建议：将 `option` 改为 computed 或在 props.data watcher 中重新执行 `getPie3D()`，再 `setOption({ ...option, series: getPie3D() }, true)`。同时避免用 `JSON.stringify` 比较数据，改为基于长度、id、金额等关键字段判断，或直接由父组件传入新引用时更新。

### 6. 部分递归轮询缺少显式取消

热门产品和热门航线使用 async 递归 + `setTimeout` 的方式轮询，但没有保存 timer id，也没有在 `onBeforeUnmount` 中取消。组件卸载后，挂起的 Promise 仍可能继续执行。

优化建议：改为可取消的 interval/ticker，或使用 `AbortController`/`isUnmounted` 标记中断异步循环，并在卸载时清理。

### 7. 视频模块有潜在数据错位问题

`aiControlledCargo.vue` 中 `getAllSourceUrl(ids)` 根据 ids 顺序写入 `allList.value[index].url2`。如果 `failIds` 过滤了 `allList`，但仍使用原始 ids 数组生成 URL，存在 index 与设备 id 不一致的风险。

优化建议：改成以 `deviceId` 为 key 的 Map 更新 URL，而不是依赖数组下标。这样即使过滤、补位、重排，也不会把视频 URL 写到错误设备上。

### 8. 大量 SVG 作为 Vue 组件直接参与编译

项目中存在多个超大 SVG Vue 组件，例如 `dispatchOneSvg.vue`、`dispatchTwoSvg.vue`、`dispatchThreeSvg.vue` 单文件约 1.3 MB，`mainBgSvg.vue` 超 2400 行。这会增加编译体积、HMR 成本和首屏 JS 解析压力。

优化建议：

- 静态背景类 SVG 优先作为资源文件引入，而不是编译为 Vue render 函数。
- 对重复 SVG 做组件复用或外链资源化。
- 对超大装饰图使用 SVG 压缩工具或转为 WebP/AVIF。
- 按模块动态加载非首屏必要资源。

### 9. 类型约束仍有不少薄弱点

项目启用了严格 TypeScript，但仍存在多个 `any` 和不精确类型：

- `compRefs: Record<string, any>`。
- `TaskFunc = (...args: any[]) => Promise<any>`。
- Swiper 回调参数 `swiper: any`。
- `TaskBridge` payload/result 大量使用 `any`。
- `aiDispatchDynamics.vue` 中 `cId` 声明为 `ref<number|string|undefined>([])`，初始值是数组但类型不是数组。

优化建议：补充任务注册类型、组件 expose 类型、TaskBridge 泛型事件映射、Swiper 类型和业务 id 类型，减少运行期错误。

### 10. 企微 JS SDK 签名逻辑仍是 TODO

`login/useWxLogin.ts` 中 `getConfigSignature()` 返回的是 `timestamp: 'todo'`、`signature: 'todo'`。目前桌面扫码登录组件不依赖 `ww.register`，但如果后续要调用企业微信 JSAPI，这会成为隐性问题。

优化建议：要么移除未使用的 `registerWxContext`，要么接入后端签名接口并按当前 URL 动态生成签名，避免留下半成品 API。

### 11. 构建质量门禁不一致

`package.json` 中：

- `build` 使用 `vue-tsc -b && vite build`。
- `build:dev` 使用 `tsc --noEmit && vite build`。
- `build:staging` 和 `build:prod` 只执行 `vite build`，没有类型检查。

Jenkins 部署使用 `pnpm run build:${PJ_ENV}`，因此 staging/prod 可能绕过类型检查。

优化建议：所有环境构建都统一先执行 `vue-tsc -b`，再执行 `vite build --mode xxx`，保证生产构建不会跳过类型错误。

### 12. 验证情况

尝试执行 `pnpm -F operational-data-dashboard build` 时，当前工作区没有安装 `node_modules`，构建失败于 `vue-tsc` 命令不存在。因此本次分析主要基于源码静态阅读，未完成真实构建验证。

## 可优化路线图

短期优先级：

1. 统一构建脚本，保证 dev/staging/prod 都执行类型检查。
2. 给 TaskBridge 增加 destroy、origin/source 校验和超时机制。
3. 修复 `platformTradeChart.vue` 数据更新不重新生成 series 的问题。
4. 给递归轮询组件增加卸载取消逻辑。
5. 将接口 catch 的静默失败改成可观测的错误记录。

中期优先级：

1. 保留父容器对首屏关键任务的启动编排，给 `compRefs`、`defineExpose` 和任务注册增加类型约束与空值保护。
2. 将产品节奏型轮询封装成可取消的 `usePollingTask` / `useLoopTask`，统一管理暂停、恢复、卸载清理和错误记录。
3. 对 mock/真实数据切换抽象统一 data provider，减少组件内部分支。
4. 抽取 ECharts 通用生命周期 composable，统一 init、resize、dispose、visibility 处理。
5. 压缩或资源化超大 SVG Vue 组件，降低包体和编译成本。

长期优先级：

1. 接入前端监控，对接口失败、刷新任务失败、视频播放失败进行埋点。
2. 为大屏关键链路补充组件测试或契约测试，尤其是数据转换和图表 option 生成。
3. 做首屏资源预算和性能分析，优化大屏加载时间。
4. 将企业微信登录、灰度版本头、错误处理抽成内部通用 SDK 或基础模板。

## 简历项目描述示例

链云运营数据看板｜Vue 3 + TypeScript + ECharts 数据大屏

- 负责企业内部运营数据大屏开发，基于 Vue 3、Vite、Pinia、ECharts/ECharts GL 实现交易额、砂石价格指数、运价指数、AI 调度和控货设备等多业务模块可视化。
- 设计大屏任务调度中心，将多个业务卡片刷新逻辑注册为可重试异步任务，支持统一 5 秒刷新、并发执行和失败收集，提升大屏实时性与异常隔离能力。
- 基于 ECharts 实现多维折线、面积、散点混合图表，并使用 ECharts GL 参数曲面实现 3D 交易商品占比图，支持自动旋转和页面可见性生命周期管理。
- 接入企业微信工作台与桌面扫码登录，兼容 code/token 登录态来源，通过 Axios 拦截器统一注入认证信息和灰度版本号。
- 在 AI 控货模块中接入船舶视频 iframe，封装 postMessage 通信桥接播放器状态，结合 Swiper 轮播、异常设备剔除和按需加载降低多路视频资源消耗。
- 支持真实数据与演示数据双模式切换，对演示场景进行数据脱敏、数值自动增长和展示字段裁剪，提升项目在运营监控和对外演示场景下的复用能力。
