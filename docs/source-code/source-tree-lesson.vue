<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, shallowRef } from 'vue'
import { withBase } from 'vitepress'

interface LessonEntry {
  title: string
  description: string
  tag: string
  href: string
}

/**
 * 根据 VitePress 当前运行时的 base 生成站内链接
 */
function createDocLink(path: string) {
  return withBase(path)
}

const lessons: LessonEntry[] = [
  {
    title: 'lodash',
    description: '从工具函数组织方式入手，观察通用能力如何被拆分、组合与复用。',
    tag: '工具库',
    href: createDocLink('/docs/source-code/lodash/'),
  },
  {
    title: 'vue2',
    description: '回看旧版本响应式与组件通信设计，理解框架演进中的历史取舍。',
    tag: '框架',
    href: createDocLink('/docs/source-code/vue2/'),
  },
  {
    title: 'vue3',
    description: '围绕 Composition API、响应式核心和运行时设计做结构化阅读。',
    tag: '框架',
    href: createDocLink('/docs/source-code/vue3/'),
  },
  {
    title: 'mitt',
    description: '聚焦轻量事件总线的实现边界，理解小型库如何用极简接口完成职责。',
    tag: '通信',
    href: createDocLink('/docs/source-code/mitt/'),
  },
  {
    title: 'radash',
    description: '对比现代工具库的 API 风格与工程组织，补充 lodash 之外的观察样本。',
    tag: '工具库',
    href: createDocLink('/docs/source-code/radash/'),
  },
  {
    title: 'vite',
    description: '从构建链路、开发体验与插件机制切入，理解现代前端工程底座。',
    tag: '工程化',
    href: createDocLink('/docs/source-code/vite/'),
  },
  {
    title: 'autofit',
    description: '围绕大屏自适应库的入口、缩放策略与局部修正机制，整理源码分析与架构图。',
    tag: '可视化',
    href: createDocLink('/docs/source-code/autofit/'),
  },
  {
    title: '收藏夹',
    description: '汇总临时记录、零散想法和还未发展成完整专题的源码阅读入口。',
    tag: '索引',
    href: createDocLink('/docs/source-code/favorites/'),
  },
]

const lessonCount = computed(() => lessons.length)
const visibleCount = shallowRef(0)
const revealTimers: number[] = []

onMounted(() => {
  revealTimers.push(
    window.setTimeout(() => {
      lessons.forEach((_, index) => {
        const timer = window.setTimeout(() => {
          visibleCount.value = index + 1
        }, index * 110)

        revealTimers.push(timer)
      })
    }, 120),
  )
})

onBeforeUnmount(() => {
  revealTimers.forEach((timer) => window.clearTimeout(timer))
})
</script>

<template>
  <section class="source-hub" aria-labelledby="source-hub-title">
    <div class="hub-header">
      <div class="hub-copy">
        <p class="hub-eyebrow">Curated Entries</p>
        <h2 id="source-hub-title" class="hub-title">专题目录</h2>
      </div>

      <p class="hub-count">
        已收录
        <span class="hub-count-value">{{ lessonCount }}</span>
        个入口
      </p>
    </div>

    <div class="lesson-grid">
      <a
        v-for="(item, index) in lessons"
        :key="item.href"
        :class="['lesson-card', { 'is-visible': index < visibleCount }]"
        :href="item.href"
      >
        <div class="lesson-meta">
          <span class="lesson-index">{{ String(index + 1).padStart(2, '0') }}</span>
          <span class="lesson-tag">{{ item.tag }}</span>
        </div>

        <h3 class="lesson-title">{{ item.title }}</h3>
        <p class="lesson-description">{{ item.description }}</p>

        <span class="lesson-link">
          查看专题
          <span class="lesson-arrow" aria-hidden="true">→</span>
        </span>
      </a>
    </div>
  </section>
</template>

<style scoped lang="scss">
.source-hub {
  padding: 26px 0 0;
  border-top: 1px solid rgba(104, 74, 44, 0.14);
}

.hub-header {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 20px;
}

.hub-copy {
  min-width: 0;
}

.hub-eyebrow {
  margin: 0;
  color: #9a6a3b;
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
}

.hub-title {
  margin: 8px 0 0;
  color: #201913;
  font-size: 1.9rem;
  line-height: 1.05;
  font-weight: 800;
  text-wrap: balance;
}

.hub-count {
  margin: 0;
  color: rgba(32, 25, 19, 0.68);
  font-size: 0.94rem;
  line-height: 1.4;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

.hub-count-value {
  color: #201913;
  font-size: 1.08rem;
  font-weight: 800;
}

.lesson-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.lesson-card {
  position: relative;
  display: grid;
  min-width: 0;
  min-height: 232px;
  padding: 22px 22px 20px;
  border: 1px solid rgba(113, 84, 53, 0.12);
  border-radius: 18px;
  background:
    linear-gradient(180deg, rgba(255, 253, 249, 0.98), rgba(247, 242, 234, 0.92));
  box-shadow: 0 12px 28px rgba(76, 56, 33, 0.05);
  color: inherit;
  text-decoration: none;
  overflow: hidden;
  isolation: isolate;
  transition:
    opacity 560ms cubic-bezier(0.16, 1, 0.3, 1),
    border-color 260ms ease,
    box-shadow 260ms ease,
    transform 260ms cubic-bezier(0.22, 1, 0.36, 1),
    background-color 260ms ease,
    filter 560ms cubic-bezier(0.16, 1, 0.3, 1);
  touch-action: manipulation;
  opacity: 0;
  transform: translateY(34px);
  filter: blur(8px);
  transform-origin: center bottom;
}

.lesson-card.is-visible {
  opacity: 1;
  transform: translateY(0);
  filter: blur(0);
}

.lesson-card:hover {
  border-color: rgba(154, 106, 59, 0.3);
  box-shadow:
    0 20px 40px rgba(76, 56, 33, 0.09),
    0 1px 0 rgba(255, 255, 255, 0.7) inset;
  transform: translateY(-8px);
}

.lesson-card:focus-visible {
  outline: 3px solid rgba(173, 122, 70, 0.22);
  outline-offset: 3px;
  border-color: rgba(154, 106, 59, 0.34);
}

.lesson-meta,
.lesson-title,
.lesson-description,
.lesson-link {
  min-width: 0;
  transition:
    transform 260ms cubic-bezier(0.22, 1, 0.36, 1),
    color 220ms ease,
    opacity 220ms ease;
  will-change: transform;
}

.lesson-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.lesson-index {
  color: rgba(32, 25, 19, 0.42);
  font-size: 0.82rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.lesson-tag {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0.22rem 0.62rem;
  border-radius: 999px;
  background: rgba(179, 136, 93, 0.1);
  color: #86572c;
  font-size: 0.76rem;
  font-weight: 700;
}

.lesson-title {
  margin: 22px 0 0;
  color: #201913;
  font-size: 1.34rem;
  line-height: 1.15;
  font-weight: 800;
  overflow-wrap: anywhere;
}

.lesson-description {
  margin: 12px 0 0;
  color: rgba(32, 25, 19, 0.72);
  font-size: 0.94rem;
  line-height: 1.8;
  overflow-wrap: anywhere;
}

.lesson-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  align-self: end;
  margin-top: 22px;
  color: #7c4f27;
  font-size: 0.88rem;
  font-weight: 700;
  opacity: 0.84;
}

.lesson-arrow {
  display: inline-block;
  transition: transform 260ms cubic-bezier(0.22, 1, 0.36, 1);
}

.lesson-card:hover .lesson-arrow,
.lesson-card:focus-visible .lesson-arrow {
  transform: translateX(7px);
}

.lesson-card:hover .lesson-title,
.lesson-card:focus-visible .lesson-title {
  transform: translateY(-3px);
}

.lesson-card:hover .lesson-description,
.lesson-card:focus-visible .lesson-description {
  transform: translateY(-2px);
}

.lesson-card:hover .lesson-link,
.lesson-card:focus-visible .lesson-link {
  opacity: 1;
  transform: translateY(-1px);
}

.lesson-card::before {
  position: absolute;
  inset: 0;
  z-index: 0;
  background:
    radial-gradient(circle at 88% 14%, rgba(196, 146, 94, 0.16), transparent 0);
  content: '';
  opacity: 0.9;
  transform: scale(1);
  transition:
    background-size 380ms cubic-bezier(0.22, 1, 0.36, 1),
    transform 380ms cubic-bezier(0.22, 1, 0.36, 1),
    opacity 220ms ease;
  pointer-events: none;
  background-repeat: no-repeat;
  background-size: 0% 0%;
}

.lesson-card:hover::before,
.lesson-card:focus-visible::before {
  background-size: 160% 160%;
  transform: scale(1.02);
}

.lesson-card::after {
  position: absolute;
  left: 22px;
  right: 22px;
  bottom: 0;
  height: 1px;
  background: linear-gradient(90deg, rgba(167, 112, 61, 0), rgba(167, 112, 61, 0.55), rgba(167, 112, 61, 0));
  content: '';
  transform: scaleX(0.22);
  transform-origin: left center;
  opacity: 0.42;
  transition:
    transform 320ms cubic-bezier(0.22, 1, 0.36, 1),
    opacity 220ms ease;
}

.lesson-card:hover::after,
.lesson-card:focus-visible::after {
  transform: scaleX(1);
  opacity: 0.9;
}

@media (prefers-reduced-motion: reduce) {
  .lesson-card {
    opacity: 1 !important;
    transform: none !important;
    filter: none !important;
  }

  .lesson-card,
  .lesson-meta,
  .lesson-title,
  .lesson-description,
  .lesson-link,
  .lesson-arrow,
  .lesson-card::before {
    animation: none !important;
    transition: none !important;
  }

  .lesson-card:hover,
  .lesson-card:focus-visible,
  .lesson-card:hover .lesson-title,
  .lesson-card:focus-visible .lesson-title,
  .lesson-card:hover .lesson-description,
  .lesson-card:focus-visible .lesson-description,
  .lesson-card:hover .lesson-arrow,
  .lesson-card:focus-visible .lesson-arrow,
  .lesson-card:hover::before,
  .lesson-card:focus-visible::before {
    transform: none !important;
    opacity: 1;
    filter: none !important;
  }
}

@media (max-width: 960px) {
  .lesson-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .hub-header {
    flex-direction: column;
    align-items: start;
    margin-bottom: 16px;
  }

  .lesson-grid {
    grid-template-columns: 1fr;
  }

  .lesson-card {
    min-height: 210px;
    padding: 18px;
  }

  .lesson-title {
    margin-top: 18px;
  }
}
</style>
