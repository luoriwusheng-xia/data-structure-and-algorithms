<script setup>
import DefaultTheme from 'vitepress/theme'
import VibrantBackground from '../../components/VibrantBackground.vue'

const { Layout } = DefaultTheme
</script>

<template>
  <Layout>
    <template #home-hero-before>
      <VibrantBackground class="vibrant-hero-bg" />
    </template>
  </Layout>
</template>

<style>
.vibrant-hero-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.VPHomeHero {
  position: relative;
  overflow: hidden;
}
</style>
