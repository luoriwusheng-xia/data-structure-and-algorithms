<script setup>
import { computed, ref } from 'vue'

const ROW_COUNT = 12
const COLUMN_COUNT = 10

const hoveredCell = ref(null)

const cells = ref(
  Array.from({ length: ROW_COUNT }, () =>
    Array.from({ length: COLUMN_COUNT }, () => ({
      backgroundColor: getRandomColor(),
    })),
  ),
)

const activeNeighborKeys = computed(() => {
  if (!hoveredCell.value) {
    return new Set()
  }

  const { row, col } = hoveredCell.value
  const neighbors = [
    [row, col - 1],
    [row, col + 1],
    ...getVerticalNeighbors(row, col),
  ]

  return new Set(
    neighbors
      .filter(([neighborRow, neighborCol]) => isInBounds(neighborRow, neighborCol))
      .map(([neighborRow, neighborCol]) => getCellKey(neighborRow, neighborCol)),
  )
})

/**
 * 记录当前悬停的六边形坐标，供模板计算自身和邻居的状态类名。
 */
function handleMouseEnter(row, col) {
  hoveredCell.value = { row, col }
}

/**
 * 鼠标离开后清空悬停状态，让所有六边形回到默认视觉效果。
 */
function handleMouseLeave() {
  hoveredCell.value = null
}

/**
 * 判断当前单元格是否就是鼠标所在的六边形。
 */
function isCurrentCell(row, col) {
  return hoveredCell.value?.row === row && hoveredCell.value?.col === col
}

/**
 * 判断当前单元格是否属于悬停六边形周围的 6 个相邻节点。
 */
function isNeighborCell(row, col) {
  return activeNeighborKeys.value.has(getCellKey(row, col))
}

/**
 * 根据六边形网格的奇偶行错位规则，返回上下两行的相邻坐标。
 * 奇数行整体左移半个单元，因此其上下邻居相对当前列会向左对齐。
 */
function getVerticalNeighbors(row, col) {
  const isShiftedRow = row % 2 === 1

  if (isShiftedRow) {
    return [
      [row - 1, col - 1],
      [row - 1, col],
      [row + 1, col - 1],
      [row + 1, col],
    ]
  }

  return [
    [row - 1, col],
    [row - 1, col + 1],
    [row + 1, col],
    [row + 1, col + 1],
  ]
}

/**
 * 保护边界，避免访问超出二维数组范围的节点。
 */
function isInBounds(row, col) {
  return row >= 0 && row < ROW_COUNT && col >= 0 && col < COLUMN_COUNT
}

/**
 * 将二维坐标序列化成唯一 key，便于放进 Set 中做快速查找。
 */
function getCellKey(row, col) {
  return `${row}-${col}`
}

/**
 * 随机生成六位十六进制颜色，用于初始化每个六边形的背景色。
 */
function getRandomColor() {
  const letters = '0123456789ABCDEF'
  let color = '#'

  for (let index = 0; index < 6; index += 1) {
    color += letters[Math.floor(Math.random() * 16)]
  }

  return color
}
</script>

<template>
  <div class="demo-page-container">
    <div class="container">
      <div
        v-for="(rowItems, rowIndex) in cells"
        :key="rowIndex"
        class="parent-item"
      >
        <div
          v-for="(cell, colIndex) in rowItems"
          :key="getCellKey(rowIndex, colIndex)"
          class="item"
          :class="{
            'item-current': isCurrentCell(rowIndex, colIndex),
            'item-neighbor': isNeighborCell(rowIndex, colIndex),
          }"
          :data-row="rowIndex"
          :data-col="colIndex"
          :style="{ backgroundColor: cell.backgroundColor }"
          @mouseenter="handleMouseEnter(rowIndex, colIndex)"
          @mouseleave="handleMouseLeave"
        >
          ({{ rowIndex }}, {{ colIndex }})
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.demo-page-container {
  overflow: hidden;
}

.container {
  width: 100%;
  padding: 2vw 0;
}

.parent-item {
  $columns: 9;
  $size: calc(100vw / #{$columns});

  display: flex;
  margin-top: calc(#{$size} / -10);

  &:nth-child(even) {
    transform: translateX(calc(#{$size} / -2));
  }
}

.item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: calc(100vw / 9);
  height: calc(100vw / 9);
  flex-shrink: 0;
  clip-path: polygon(50% 0%, 94% 25%, 94% 77%, 50% 100%, 10% 76%, 10% 26%);
  color: rgba(255, 255, 255, 0.92);
  font-size: 14px;
  line-height: 1;
  transition:
    transform 0.45s cubic-bezier(0.22, 1, 0.36, 1),
    filter 0.45s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.45s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.45s cubic-bezier(0.22, 1, 0.36, 1);
  transform: scale(1);
  transform-origin: center;
  filter: saturate(0.92) brightness(0.96);
  box-shadow: 0 0 0 rgba(0, 0, 0, 0);
  opacity: 0.92;
  will-change: transform, filter;
}

.container:hover .item {
  filter: saturate(0.78) brightness(0.82);
  opacity: 0.72;
}

.item-current {
  z-index: 2;
  transform: scale(1.38);
  filter: saturate(1.15) brightness(1.08);
  box-shadow: 0 18px 36px rgba(0, 0, 0, 0.24);
  opacity: 1;
}

.item-neighbor {
  transform: scale(0.86);
  filter: saturate(1) brightness(0.98);
  opacity: 0.9;
}

.container:hover .item-current,
.container:hover .item-neighbor {
  opacity: 1;
}

@media (prefers-reduced-motion: reduce) {
  .item {
    transition: none;
  }
}
</style>
