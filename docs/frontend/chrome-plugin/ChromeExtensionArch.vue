<template>
  <div class="ext-arch">
    <svg viewBox="0 0 800 560" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- 阴影滤镜 -->
        <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.15"/>
        </filter>
        <!-- 渐变定义 -->
        <linearGradient id="grad-chrome" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#4285f4"/>
          <stop offset="50%" stop-color="#34a853"/>
          <stop offset="100%" stop-color="#fbbc05"/>
        </linearGradient>
        <linearGradient id="grad-sw" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#1a73e8"/>
          <stop offset="100%" stop-color="#1557b0"/>
        </linearGradient>
        <linearGradient id="grad-popup" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#34a853"/>
          <stop offset="100%" stop-color="#2d8e47"/>
        </linearGradient>
        <linearGradient id="grad-content" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#fbbc05"/>
          <stop offset="100%" stop-color="#f9a825"/>
        </linearGradient>
        <linearGradient id="grad-extra" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#ea4335"/>
          <stop offset="100%" stop-color="#d33b28"/>
        </linearGradient>
      </defs>

      <!-- 外框：Chrome 浏览器 -->
      <rect x="10" y="10" width="780" height="540" rx="16" fill="#f8f9fa" stroke="#dadce0" stroke-width="2"/>
      <rect x="10" y="10" width="780" height="42" rx="16" fill="#fff" stroke="#dadce0" stroke-width="2"/>
      <rect x="10" y="36" width="780" height="16" fill="#fff"/>
      <text x="400" y="37" text-anchor="middle" font-size="14" font-weight="600" fill="#5f6368">Chrome 浏览器</text>

      <!-- 标签栏 -->
      <rect x="24" y="58" width="180" height="28" rx="8" fill="#e8f0fe" stroke="#4285f4" stroke-width="1.5"/>
      <circle cx="42" cy="72" r="6" fill="#4285f4"/>
      <text x="56" y="77" font-size="11" fill="#1967d2" font-weight="500">扩展图标</text>

      <!-- ====== 上层：UI 组件 ====== -->
      <g filter="url(#shadow)">
        <!-- Popup -->
        <rect x="60" y="110" width="180" height="90" rx="10" fill="url(#grad-popup)"/>
        <rect x="60" y="110" width="180" height="24" rx="10" fill="#2d8e47"/>
        <rect x="60" y="126" width="180" height="8" fill="#2d8e47"/>
        <text x="150" y="127" text-anchor="middle" font-size="12" font-weight="600" fill="#fff">Popup</text>
        <text x="150" y="160" text-anchor="middle" font-size="11" fill="#e8f5e9">点击图标弹出</text>
        <text x="150" y="178" text-anchor="middle" font-size="10" fill="#c8e6c9">临时交互面板</text>

        <!-- Options -->
        <rect x="310" y="110" width="180" height="90" rx="10" fill="#fff" stroke="#34a853" stroke-width="2"/>
        <rect x="310" y="110" width="180" height="24" rx="10" fill="#34a853"/>
        <rect x="310" y="126" width="180" height="8" fill="#34a853"/>
        <text x="400" y="127" text-anchor="middle" font-size="12" font-weight="600" fill="#fff">Options</text>
        <text x="400" y="160" text-anchor="middle" font-size="11" fill="#2e7d32">右键 → 选项</text>
        <text x="400" y="178" text-anchor="middle" font-size="10" fill="#757575">持久配置页面</text>

        <!-- DevTools -->
        <rect x="560" y="110" width="180" height="90" rx="10" fill="#fff" stroke="#fbbc05" stroke-width="2"/>
        <rect x="560" y="110" width="180" height="24" rx="10" fill="#fbbc05"/>
        <rect x="560" y="126" width="180" height="8" fill="#fbbc05"/>
        <text x="650" y="127" text-anchor="middle" font-size="12" font-weight="600" fill="#fff">DevTools</text>
        <text x="650" y="160" text-anchor="middle" font-size="11" fill="#f57f17">F12 → 自定义面板</text>
        <text x="650" y="178" text-anchor="middle" font-size="10" fill="#757575">开发者工具扩展</text>
      </g>

      <!-- 上层 → 中层 连接线 -->
      <g stroke="#9aa0a6" stroke-width="1.5" fill="none" stroke-dasharray="4,3">
        <line x1="150" y1="200" x2="150" y2="230"/>
        <line x1="400" y1="200" x2="400" y2="230"/>
        <line x1="650" y1="200" x2="650" y2="230"/>
        <line x1="150" y1="230" x2="650" y2="230"/>
        <line x1="400" y1="230" x2="400" y2="240"/>
      </g>
      <!-- 箭头 -->
      <polygon points="400,240 396,232 404,232" fill="#9aa0a6"/>

      <!-- ====== 中层：Service Worker ====== -->
      <g filter="url(#shadow)">
        <rect x="200" y="250" width="400" height="90" rx="12" fill="url(#grad-sw)"/>
        <text x="400" y="280" text-anchor="middle" font-size="15" font-weight="700" fill="#fff">Service Worker</text>
        <text x="400" y="305" text-anchor="middle" font-size="12" fill="#bbdefb">后台事件中枢 · 事件驱动 · 非持久</text>
        <text x="400" y="325" text-anchor="middle" font-size="11" fill="#90caf9">chrome.runtime.onMessage · chrome.storage · chrome.tabs</text>
      </g>

      <!-- 中层 → 下层 连接线 -->
      <g stroke="#9aa0a6" stroke-width="1.5" fill="none" stroke-dasharray="4,3">
        <line x1="280" y1="340" x2="280" y2="360"/>
        <line x1="400" y1="340" x2="400" y2="360"/>
        <line x1="520" y1="340" x2="520" y2="360"/>
        <line x1="180" y1="360" x2="620" y2="360"/>
        <line x1="180" y1="360" x2="180" y2="370"/>
        <line x1="400" y1="360" x2="400" y2="370"/>
        <line x1="620" y1="360" x2="620" y2="370"/>
      </g>
      <polygon points="180,370 176,362 184,362" fill="#9aa0a6"/>
      <polygon points="400,370 396,362 404,362" fill="#9aa0a6"/>
      <polygon points="620,370 616,362 624,362" fill="#9aa0a6"/>

      <!-- ====== 下层：Content Scripts ====== -->
      <g filter="url(#shadow)">
        <rect x="60" y="380" width="220" height="80" rx="10" fill="url(#grad-content)"/>
        <text x="170" y="408" text-anchor="middle" font-size="13" font-weight="600" fill="#fff">Content Script A</text>
        <text x="170" y="430" text-anchor="middle" font-size="11" fill="#fff9c4">example.com</text>
        <text x="170" y="448" text-anchor="middle" font-size="10" fill="#fff59d">可读写 DOM · 隔离执行环境</text>

        <rect x="290" y="380" width="220" height="80" rx="10" fill="url(#grad-content)"/>
        <text x="400" y="408" text-anchor="middle" font-size="13" font-weight="600" fill="#fff">Content Script B</text>
        <text x="400" y="430" text-anchor="middle" font-size="11" fill="#fff9c4">github.com</text>
        <text x="400" y="448" text-anchor="middle" font-size="10" fill="#fff59d">可读写 DOM · 隔离执行环境</text>

        <rect x="520" y="380" width="220" height="80" rx="10" fill="url(#grad-content)"/>
        <text x="630" y="408" text-anchor="middle" font-size="13" font-weight="600" fill="#fff">Content Script C</text>
        <text x="630" y="430" text-anchor="middle" font-size="11" fill="#fff9c4">custom-site.com</text>
        <text x="630" y="448" text-anchor="middle" font-size="10" fill="#fff59d">可读写 DOM · 隔离执行环境</text>
      </g>

      <!-- 虚线连接到底层 -->
      <g stroke="#bdbdbd" stroke-width="1" fill="none" stroke-dasharray="3,3">
        <line x1="170" y1="460" x2="170" y2="470"/>
        <line x1="400" y1="460" x2="400" y2="470"/>
        <line x1="630" y1="460" x2="630" y2="470"/>
      </g>

      <!-- ====== 底层：辅助模块 ====== -->
      <g filter="url(#shadow)">
        <rect x="60" y="482" width="220" height="36" rx="8" fill="url(#grad-extra)"/>
        <text x="170" y="501" text-anchor="middle" font-size="11" font-weight="500" fill="#fff">Offscreen Document</text>

        <rect x="290" y="482" width="220" height="36" rx="8" fill="#fff" stroke="#ea4335" stroke-width="2"/>
        <text x="400" y="505" text-anchor="middle" font-size="11" font-weight="500" fill="#c62828">declarativeNetRequest</text>

        <rect x="520" y="482" width="220" height="36" rx="8" fill="#fff" stroke="#4285f4" stroke-width="2"/>
        <text x="630" y="501" text-anchor="middle" font-size="11" font-weight="500" fill="#1565c0">chrome.* APIs</text>
      </g>
    </svg>
  </div>
</template>

<style scoped>
.ext-arch {
  width: 100%;
  max-width: 800px;
  margin: 1rem auto;
}
.ext-arch svg {
  width: 100%;
  height: auto;
  display: block;
}
</style>
