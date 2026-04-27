<script setup lang="ts">
import SourceTreeLesson from './source-tree-lesson.vue'

const highlights = [
  '围绕真实项目持续补充源码拆解与学习记录',
  '从入口、模块关系、核心流程到实现取舍逐层展开',
  '把零散阅读沉淀成一组可回看的专题索引',
]
</script>

<template>
  <div class="source-home">
    <section class="intro" aria-labelledby="source-home-title">
      <p class="intro-eyebrow" translate="no">Source Study</p>
      <h1 id="source-home-title" class="intro-title">源码学习专题</h1>
      <p class="intro-summary">
        这里不是普通目录页，而是一组持续更新的源码专题入口。每个条目都以真实项目为单位，围绕入口文件、核心模块、调用关系和实现取舍，逐步整理成可理解、可复用、可回看的学习记录。
      </p>
    </section>

    <section class="manifesto" aria-label="专题说明">
      <div class="manifesto-note">
        <p class="manifesto-label">阅读方式</p>
        <p class="manifesto-copy">
          先抓结构，再进实现；先建立模块关系，再回到细节。这里保留的是可以重复进入的专题入口，而不是一次性的随手摘录。
        </p>
      </div>

      <ul class="manifesto-list">
        <li
          v-for="item in highlights"
          :key="item"
          class="manifesto-item"
        >
          {{ item }}
        </li>
      </ul>
    </section>

    <SourceTreeLesson />
  </div>
</template>

<style scoped lang="scss">
:global(.source-code-home-page .VPDoc.has-aside .content-container),
:global(.source-code-home-page .VPDoc:not(.has-sidebar) .content),
:global(.source-code-home-page .VPDoc .container) {
  max-width: 100% !important;
}

:global(.source-code-home-page .VPDoc .content),
:global(.source-code-home-page .vp-doc) {
  padding: 0 !important;
}

.source-home {
  width: min(1180px, calc(100% - 32px));
  margin: 0 auto;
  padding: 28px 0 52px;
  color: #201913;
}

.source-home :global(.source-hub) {
  margin-top: 28px;
}

.intro {
  padding: 8px 0 0;
}

.intro-eyebrow {
  margin: 0;
  color: #9a6a3b;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.intro-title {
  margin: 12px 0 0;
  font-size: clamp(2.7rem, 5vw, 4.9rem);
  line-height: 0.96;
  font-weight: 800;
  text-wrap: balance;
}

.intro-summary {
  max-width: 760px;
  margin: 22px 0 0;
  color: rgba(32, 25, 19, 0.76);
  font-size: 1.03rem;
  line-height: 1.95;
  text-wrap: pretty;
}

.manifesto {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
  gap: 24px;
  margin-top: 34px;
  padding-top: 22px;
  border-top: 1px solid rgba(104, 74, 44, 0.14);
}

.manifesto-note,
.manifesto-list {
  min-width: 0;
}

.manifesto-label {
  margin: 0;
  color: #8f6035;
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.manifesto-copy {
  margin: 10px 0 0;
  color: rgba(32, 25, 19, 0.78);
  font-size: 0.98rem;
  line-height: 1.85;
}

.manifesto-list {
  display: grid;
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.manifesto-item {
  position: relative;
  padding-left: 22px;
  color: rgba(32, 25, 19, 0.74);
  font-size: 0.95rem;
  line-height: 1.8;
}

.manifesto-item::before {
  position: absolute;
  left: 0;
  top: 0.78rem;
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: linear-gradient(135deg, #b97b3b, #cfad84);
  content: '';
  transform: translateY(-50%);
}

@media (max-width: 960px) {
  .manifesto {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .source-home {
    width: calc(100% - 16px);
    padding-top: 18px;
    padding-bottom: 30px;
  }

  .intro-summary {
    margin-top: 16px;
    font-size: 0.96rem;
    line-height: 1.8;
  }

  .manifesto {
    gap: 16px;
    margin-top: 24px;
    padding-top: 18px;
  }
}
</style>
