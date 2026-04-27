<template>
  <div class="autofit-wrapper">
    <div class="container">
      <header class="header">
        <div class="header-row">
          <div class="pulse-dot"></div>
          <h1>autofit.js-架构图</h1>
        </div>
        <p class="subtitle">
          基于 autofit.js 源码绘制，重点展示公开 API、缩放策略、DOM 副作用、共享状态和构建产物。
        </p>
      </header>

      <main>
        <div class="diagram-container">
              <svg viewBox="0 0 1100 760" role="img" aria-labelledby="diagram-title diagram-desc">
          <title id="diagram-title">autofit.js 架构图</title>
          <desc id="diagram-desc">深色主题 SVG 架构图，展示业务调用方、autofit 公开 API、keepFit 缩放策略、局部修正、共享状态、注入样式、浏览器 DOM API 和构建产物。</desc>
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#64748b"></polygon>
            </marker>
            <marker id="arrowhead-cyan" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#22d3ee"></polygon>
            </marker>
            <marker id="arrowhead-emerald" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#34d399"></polygon>
            </marker>
            <marker id="arrowhead-rose" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#fb7185"></polygon>
            </marker>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" stroke-width="0.5"></path>
            </pattern>
          </defs>

          <rect width="100%" height="100%" fill="url(#grid)"></rect>

          <!-- 连接线绘制在组件后方 -->
          <line x1="150" y1="160" x2="225" y2="160" stroke="#22d3ee" stroke-width="1.5" marker-end="url(#arrowhead-cyan)"></line>
          <text x="188" y="148" fill="#94a3b8" font-size="9" text-anchor="middle">init()</text>

          <line x1="350" y1="160" x2="420" y2="160" stroke="#22d3ee" stroke-width="1.5" marker-end="url(#arrowhead-cyan)"></line>
          <text x="385" y="148" fill="#94a3b8" font-size="9" text-anchor="middle">参数归一化</text>

          <line x1="560" y1="160" x2="655" y2="160" stroke="#34d399" stroke-width="1.5" marker-end="url(#arrowhead-emerald)"></line>
          <text x="608" y="148" fill="#94a3b8" font-size="9" text-anchor="middle">keepFit()</text>

          <line x1="780" y1="160" x2="895" y2="160" stroke="#34d399" stroke-width="1.5" marker-end="url(#arrowhead-emerald)"></line>
          <text x="838" y="148" fill="#94a3b8" font-size="9" text-anchor="middle">写入样式</text>

          <path d="M 705 220 L 705 270 Q 705 290 685 290 L 560 290" fill="none" stroke="#a78bfa" stroke-width="1.5" marker-end="url(#arrowhead)"></path>
          <text x="716" y="258" fill="#94a3b8" font-size="9">currScale</text>

          <line x1="490" y1="220" x2="490" y2="258" stroke="#64748b" stroke-width="1.5" marker-end="url(#arrowhead)"></line>
          <text x="505" y="246" fill="#94a3b8" font-size="9">状态</text>

          <path d="M 490 322 L 490 370 Q 490 390 510 390 L 655 390" fill="none" stroke="#fb7185" stroke-width="1.5" stroke-dasharray="5,5" marker-end="url(#arrowhead-rose)"></path>
          <text x="562" y="378" fill="#fb7185" font-size="8" text-anchor="middle">resize 重跑</text>

          <path d="M 930 220 L 930 260 Q 930 280 910 280 L 780 280" fill="none" stroke="#fb7185" stroke-width="1.5" stroke-dasharray="5,5" marker-end="url(#arrowhead-rose)"></path>
          <text x="943" y="254" fill="#fb7185" font-size="8">resize</text>

          <line x1="350" y1="420" x2="420" y2="420" stroke="#fb7185" stroke-width="1.5" marker-end="url(#arrowhead-rose)"></line>
          <text x="385" y="408" fill="#94a3b8" font-size="9" text-anchor="middle">off()</text>

          <line x1="560" y1="420" x2="655" y2="420" stroke="#fb7185" stroke-width="1.5" marker-end="url(#arrowhead-rose)"></line>
          <text x="608" y="408" fill="#94a3b8" font-size="9" text-anchor="middle">清理</text>

          <line x1="705" y1="220" x2="705" y2="355" stroke="#fb923c" stroke-width="1.5" marker-end="url(#arrowhead)"></line>
          <text x="720" y="306" fill="#94a3b8" font-size="9">忽略元素 CSS</text>

          <path d="M 350 535 L 655 535" fill="none" stroke="#fbbf24" stroke-width="1.5" marker-end="url(#arrowhead)"></path>
          <text x="502" y="523" fill="#94a3b8" font-size="9" text-anchor="middle">rolldown 构建</text>

          <!-- 源码边界 -->
          <rect x="205" y="80" width="620" height="410" rx="12" fill="rgba(251, 191, 36, 0.05)" stroke="#fbbf24" stroke-width="1" stroke-dasharray="8,4"></rect>
          <text x="220" y="102" fill="#fbbf24" font-size="10" font-weight="600">src/ TypeScript 模块</text>

          <!-- 外部调用方 -->
          <rect x="35" y="120" width="115" height="80" rx="6" fill="#0f172a"></rect>
          <rect x="35" y="120" width="115" height="80" rx="6" fill="rgba(30, 41, 59, 0.5)" stroke="#94a3b8" stroke-width="1.5"></rect>
          <text x="92.5" y="146" fill="white" font-size="11" font-weight="600" text-anchor="middle">业务调用方</text>
          <text x="92.5" y="164" fill="#94a3b8" font-size="9" text-anchor="middle">Vue / React</text>
          <text x="92.5" y="180" fill="#94a3b8" font-size="9" text-anchor="middle">大屏界面</text>

          <!-- API 门面 -->
          <rect x="225" y="120" width="125" height="80" rx="6" fill="#0f172a"></rect>
          <rect x="225" y="120" width="125" height="80" rx="6" fill="rgba(8, 51, 68, 0.4)" stroke="#22d3ee" stroke-width="1.5"></rect>
          <text x="287.5" y="143" fill="white" font-size="11" font-weight="600" text-anchor="middle">index.ts</text>
          <text x="287.5" y="161" fill="#94a3b8" font-size="9" text-anchor="middle">autofit 门面</text>
          <text x="287.5" y="177" fill="#22d3ee" font-size="8" text-anchor="middle">init / off / scale</text>

          <!-- 参数归一化 -->
          <rect x="420" y="120" width="140" height="80" rx="6" fill="#0f172a"></rect>
          <rect x="420" y="120" width="140" height="80" rx="6" fill="rgba(8, 51, 68, 0.4)" stroke="#22d3ee" stroke-width="1.5"></rect>
          <text x="490" y="143" fill="white" font-size="11" font-weight="600" text-anchor="middle">初始化流程</text>
          <text x="490" y="161" fill="#94a3b8" font-size="9" text-anchor="middle">默认值 + DOM 查询</text>
          <text x="490" y="177" fill="#94a3b8" font-size="8" text-anchor="middle">样式注入</text>

          <!-- 缩放策略 -->
          <rect x="655" y="120" width="125" height="100" rx="6" fill="#0f172a"></rect>
          <rect x="655" y="120" width="125" height="100" rx="6" fill="rgba(6, 78, 59, 0.4)" stroke="#34d399" stroke-width="1.5"></rect>
          <text x="717.5" y="143" fill="white" font-size="11" font-weight="600" text-anchor="middle">strategy.ts</text>
          <text x="717.5" y="161" fill="#94a3b8" font-size="9" text-anchor="middle">keepFit()</text>
          <text x="717.5" y="178" fill="#94a3b8" font-size="8" text-anchor="middle">视口比例</text>
          <text x="717.5" y="193" fill="#34d399" font-size="8" text-anchor="middle">scale / zoom</text>

          <!-- 浏览器 DOM -->
          <rect x="895" y="120" width="150" height="100" rx="6" fill="#0f172a"></rect>
          <rect x="895" y="120" width="150" height="100" rx="6" fill="rgba(30, 41, 59, 0.5)" stroke="#94a3b8" stroke-width="1.5"></rect>
          <text x="970" y="143" fill="white" font-size="11" font-weight="600" text-anchor="middle">浏览器 DOM</text>
          <text x="970" y="161" fill="#94a3b8" font-size="9" text-anchor="middle">document / window</text>
          <text x="970" y="178" fill="#94a3b8" font-size="8" text-anchor="middle">resize 监听器</text>
          <text x="970" y="193" fill="#94a3b8" font-size="8" text-anchor="middle">内联样式</text>

          <!-- 共享状态 -->
          <rect x="420" y="258" width="140" height="64" rx="6" fill="#0f172a"></rect>
          <rect x="420" y="258" width="140" height="64" rx="6" fill="rgba(76, 29, 149, 0.4)" stroke="#a78bfa" stroke-width="1.5"></rect>
          <text x="490" y="282" fill="white" font-size="11" font-weight="600" text-anchor="middle">state.ts</text>
          <text x="490" y="300" fill="#94a3b8" font-size="9" text-anchor="middle">currScale / timer</text>

          <!-- 忽略元素样式 -->
          <rect x="650" y="355" width="135" height="64" rx="6" fill="#0f172a"></rect>
          <rect x="650" y="355" width="135" height="64" rx="6" fill="rgba(251, 146, 60, 0.3)" stroke="#fb923c" stroke-width="1.5"></rect>
          <text x="717.5" y="379" fill="white" font-size="11" font-weight="600" text-anchor="middle">#ignoreStyle</text>
          <text x="717.5" y="397" fill="#94a3b8" font-size="9" text-anchor="middle">反向缩放 CSS</text>

          <!-- 局部修正 -->
          <rect x="655" y="258" width="125" height="72" rx="6" fill="#0f172a"></rect>
          <rect x="655" y="258" width="125" height="72" rx="6" fill="rgba(136, 19, 55, 0.4)" stroke="#fb7185" stroke-width="1.5"></rect>
          <text x="717.5" y="282" fill="white" font-size="11" font-weight="600" text-anchor="middle">rectification.ts</text>
          <text x="717.5" y="300" fill="#94a3b8" font-size="9" text-anchor="middle">canvas/图表修正</text>
          <text x="717.5" y="315" fill="#fb7185" font-size="8" text-anchor="middle">反向缩放</text>

          <!-- 关闭清理 -->
          <rect x="225" y="380" width="125" height="80" rx="6" fill="#0f172a"></rect>
          <rect x="225" y="380" width="125" height="80" rx="6" fill="rgba(136, 19, 55, 0.4)" stroke="#fb7185" stroke-width="1.5"></rect>
          <text x="287.5" y="404" fill="white" font-size="11" font-weight="600" text-anchor="middle">off()</text>
          <text x="287.5" y="422" fill="#94a3b8" font-size="9" text-anchor="middle">移除监听器</text>
          <text x="287.5" y="438" fill="#94a3b8" font-size="8" text-anchor="middle">清理样式</text>

          <rect x="420" y="380" width="140" height="80" rx="6" fill="#0f172a"></rect>
          <rect x="420" y="380" width="140" height="80" rx="6" fill="rgba(136, 19, 55, 0.4)" stroke="#fb7185" stroke-width="1.5"></rect>
          <text x="490" y="404" fill="white" font-size="11" font-weight="600" text-anchor="middle">清理流程</text>
          <text x="490" y="422" fill="#94a3b8" font-size="9" text-anchor="middle">#autofit-style</text>
          <text x="490" y="438" fill="#94a3b8" font-size="8" text-anchor="middle">#ignoreStyle + DOM</text>

          <!-- 构建流程 -->
          <rect x="205" y="510" width="620" height="100" rx="12" fill="rgba(251, 191, 36, 0.05)" stroke="#fbbf24" stroke-width="1" stroke-dasharray="8,4"></rect>
          <text x="220" y="532" fill="#fbbf24" font-size="10" font-weight="600">构建与发布层</text>

          <rect x="225" y="548" width="125" height="44" rx="6" fill="#0f172a"></rect>
          <rect x="225" y="548" width="125" height="44" rx="6" fill="rgba(120, 53, 15, 0.3)" stroke="#fbbf24" stroke-width="1.5"></rect>
          <text x="287.5" y="567" fill="white" font-size="11" font-weight="600" text-anchor="middle">package.json</text>
          <text x="287.5" y="582" fill="#94a3b8" font-size="8" text-anchor="middle">脚本 + 导出</text>

          <rect x="655" y="548" width="150" height="44" rx="6" fill="#0f172a"></rect>
          <rect x="655" y="548" width="150" height="44" rx="6" fill="rgba(120, 53, 15, 0.3)" stroke="#fbbf24" stroke-width="1.5"></rect>
          <text x="730" y="567" fill="white" font-size="11" font-weight="600" text-anchor="middle">dist 产物</text>
          <text x="730" y="582" fill="#94a3b8" font-size="8" text-anchor="middle">esm / cjs / umd / iife</text>

          <!-- 开发层 -->
          <rect x="35" y="548" width="115" height="44" rx="6" fill="#0f172a"></rect>
          <rect x="35" y="548" width="115" height="44" rx="6" fill="rgba(30, 41, 59, 0.5)" stroke="#94a3b8" stroke-width="1.5"></rect>
          <text x="92.5" y="567" fill="white" font-size="11" font-weight="600" text-anchor="middle">dev/</text>
          <text x="92.5" y="582" fill="#94a3b8" font-size="8" text-anchor="middle">服务 + 示例</text>

          <!-- 图例位于边界框外 -->
          <text x="35" y="670" fill="white" font-size="10" font-weight="600">图例</text>

          <rect x="35" y="684" width="16" height="10" rx="2" fill="rgba(8, 51, 68, 0.4)" stroke="#22d3ee" stroke-width="1"></rect>
          <text x="58" y="692" fill="#94a3b8" font-size="8">公开 API / 门面</text>

          <rect x="190" y="684" width="16" height="10" rx="2" fill="rgba(6, 78, 59, 0.4)" stroke="#34d399" stroke-width="1"></rect>
          <text x="213" y="692" fill="#94a3b8" font-size="8">缩放策略</text>

          <rect x="330" y="684" width="16" height="10" rx="2" fill="rgba(76, 29, 149, 0.4)" stroke="#a78bfa" stroke-width="1"></rect>
          <text x="353" y="692" fill="#94a3b8" font-size="8">共享状态</text>

          <rect x="455" y="684" width="16" height="10" rx="2" fill="rgba(136, 19, 55, 0.4)" stroke="#fb7185" stroke-width="1"></rect>
          <text x="478" y="692" fill="#94a3b8" font-size="8">局部修正 / 清理</text>

          <rect x="635" y="684" width="16" height="10" rx="2" fill="rgba(120, 53, 15, 0.3)" stroke="#fbbf24" stroke-width="1"></rect>
          <text x="658" y="692" fill="#94a3b8" font-size="8">构建 / 发布</text>

          <rect x="780" y="684" width="16" height="10" rx="2" fill="rgba(251, 146, 60, 0.3)" stroke="#fb923c" stroke-width="1"></rect>
          <text x="803" y="692" fill="#94a3b8" font-size="8">注入 CSS</text>
        </svg>

        </div>

        <section class="cards">
          <div class="card">
            <div class="card-header">
              <div class="card-dot cyan"></div>
              <h3>公开 API</h3>
            </div>
            <ul>
              <li>• index.ts 导出 autofit</li>
              <li>• init / off / scale</li>
              <li>• resize 编排</li>
            </ul>
          </div>

          <div class="card">
            <div class="card-header">
              <div class="card-dot emerald"></div>
              <h3>缩放核心</h3>
            </div>
            <ul>
              <li>• keepFit 计算 scale</li>
              <li>• scale / zoom</li>
              <li>• ignore 反向缩放</li>
            </ul>
          </div>

          <div class="card">
            <div class="card-header">
              <div class="card-dot rose"></div>
              <h3>生命周期风险</h3>
            </div>
            <ul>
              <li>• 单例 state</li>
              <li>• 重复 init 风险</li>
              <li>• 样式清理问题</li>
            </ul>
          </div>
        </section>
      </main>

      <p class="footer">
        autofit.js 架构图 • architecture-diagram
      </p>
    </div>
  </div>
</template>

<style scoped>
.autofit-wrapper {
  background: #020617;
  padding: 2rem;
  border-radius: 12px;
  color: white;
}

/* 👉 防止污染 VitePress 全局 */
.container {
  max-width: 1240px;
  margin: 0 auto;
}

.header {
  margin-bottom: 2rem;
}

.header-row {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.pulse-dot {
  width: 12px;
  height: 12px;
  background: #22d3ee;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  50% { opacity: 0.5; }
}

h1 {
  font-size: 1.4rem;
  font-weight: 700;
}

.subtitle {
  color: #94a3b8;
  font-size: 0.85rem;
}

.diagram-container {
  background: rgba(15, 23, 42, 0.5);
  border-radius: 1rem;
  border: 1px solid #1e293b;
  padding: 1.5rem;
  overflow-x: auto;
}

svg {
  width: 100%;
  min-width: 1000px;
}

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1rem;
  margin-top: 2rem;
}

.card {
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid #1e293b;
  border-radius: 0.75rem;
  padding: 1rem;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.card-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.cyan { background: #22d3ee; }
.emerald { background: #34d399; }
.rose { background: #fb7185; }

.footer {
  text-align: center;
  margin-top: 1.5rem;
  color: #475569;
  font-size: 0.75rem;
}
</style>