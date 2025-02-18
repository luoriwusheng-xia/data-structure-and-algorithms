<template>
  <div :style="{display: inline ? 'inline-block': 'block'}" class="bold-text">
    <slot></slot>
  </div>
</template>

<script setup>

const props = defineProps({
  inline: {
    type: Boolean,
    default: false
  }
})
</script>

<style lang="scss" scoped>
.bold-text {
  font-weight: 700;
  color: red;
}
</style>