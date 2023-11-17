<template>
	<div>
		<div class="nav-list" ref="navRef">
			<div
        v-for="(item, index) in navList"
				:key="index"
				class="nav-item"
				:class="activeClass ? 'is-active' : ''"
				:active-color="item.color"
				@click="onChangeTab(item, index,$event)"
			>
				{{ item.text }}
			</div>

      <!-- 动态挪动的元素 -->
      <span class="nav-indicator" :style="ponterStyle"></span>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const activeClass = ref(0)
const navRef = ref(null)

const emits = defineEmits(['changeTab'])

const navList = ref([
	{
		text: '案例',
		color: 'orange',
	},
	{
		text: '文档',
		color: 'green',
	},
	{
		text: 'Try尝试',
		color: 'blue',
	},
	{
		text: '讨论',
		color: 'red',
	},
	{
		text: 'Github',
		color: 'rebeccapurple',
	},
	{
		text: 'Version 5',
		color: 'pink',
	},
])

const ponterStyle = ref({})

const onChangeTab = (item, index,event) => {
  activeClass.value = index

  ponterStyle.value.width = event.target.offsetWidth + 'px'
  ponterStyle.value.left = event.target.offsetLeft + 'px'
  ponterStyle.value.backgroundColor = item.color

  emits('changeTab', index)
}

const setInit = () => {
  let el = navRef.value.children[0]

  ponterStyle.value.width = el.offsetWidth + 'px'
  ponterStyle.value.left = el.offsetLeft + 'px'

  ponterStyle.value.backgroundColor = navList.value[0].color
}

onMounted(() => {
  setInit()
})
</script>
<style lang="less" scoped>
.nav-list {
  position: relative;
	display: flex;
	overflow: hidden;
	max-width: 100%;
	background: #fff;
	padding: 0 20px;
	border-radius: 40px;
	box-shadow: 0 10px 40px rgba(159, 162, 177, 0.8);

	.nav-item {
		color: #83818c;
		padding: 20px;
		transition: 0.3s;
		margin: 0 6px;
		z-index: 1;
		font-family: 'DM Sans', sans-serif;
		font-weight: 500;
		position: relative;
		cursor: pointer;

		&:before {
			content: '';
			position: absolute;
			bottom: -6px;
			left: 0;
			width: 100%;
			height: 5px;
			background-color: #dfe2ea;
			border-radius: 8px 8px 0 0;
			opacity: 0;
			transition: 0.3s;
		}
	}

	.nav-item:not(.is-active):hover:before {
		opacity: 1;
		bottom: 0;
	}

	.nav-item:not(.is-active):hover {
		color: #333;
	}

	.nav-indicator {
		position: absolute;
		left: 0;
		bottom: 0;
		height: 4px;
		transition: 0.4s;
		height: 5px;
		z-index: 1;
		border-radius: 8px 8px 0 0;
	}

	@media (max-width: 580px) {
		.nav {
			overflow: auto;
		}
	}
}
</style>
