<template>
	<div class="card-list">
		<div
			class="card-panel break-all break-words"
			v-for="(item, index) in cardList"
			:key="index"
			@click="onClick(item)"
		>
			<div class="font-700 text-base gradient-text">{{ item.title }}</div>
			<div class="desc">{{ item.desc }}</div>
		</div>
	</div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vitepress'

const router = useRouter()

const cardList = ref([
	{
		title: '使用rollup打包',
		desc: '如何创建一个可以在浏览器运行的script文件',
		link: '/docs/frontend/translation/codemirror/components/base/rollup-bundling',
	},
	{
		title: '配置',
		desc: '演示如何配置编辑器并动态更改其配置。',
	},
	{
		title: '样式',
		desc: '如何设置编辑器或扩展的样式，以及如何创建新的编辑器主题。',
    link: '/docs/frontend/translation/codemirror/components/base/styling'
	},
	{
		title: '处理选项卡',
		desc: '如果您对编辑器默认不处理 Tab 感到困惑或恼火，请阅读本文。',
	},
	{
		title: '大文档',
		desc: '这里演示加载一个几百万行的文档',
		link: '/docs/frontend/translation/codemirror/components/base/huge-document',
	},
	{
		title: 'IE11浏览器',
		desc: '设置编辑器可以在IE11浏览器中运行',
	},
])
const onClick = (item) => {
	if (!item.link) return
	router.go(item.link)
}
</script>

<style lang="less" scoped>
.card-list {
	display: flex;
	flex-wrap: wrap;
	padding-top: 20px;

	.card-panel {
		width: 50%;
		// flex:1;
		flex-shrink: 0;
		margin-bottom: 20px;
		padding-right: 20px;
		box-sizing: border-box;
		cursor: pointer;
	}

	.desc {
		font-size: 13px;
	}

	.text-base {
		font-family: 'Archivo Black', sans-serif;
		// font-weight: normal;
		font-size: 1.35em;
		// margin-bottom: 0;
		// margin-bottom: -0.25em;
		// margin-left: auto;
		// margin-right: auto;

		margin-bottom: 8px;
	}

	.gradient-text {
		/* Fallback: Set a background color. */
		background-color: #ca4246;

		/* Create the gradient. */
		background-image: linear-gradient(
			45deg,
			#ca4246 16.666%,
			#e16541 16.666%,
			#e16541 33.333%,
			#f18f43 33.333%,
			#f18f43 50%,
			#8b9862 50%,
			#8b9862 66.666%,
			#476098 66.666%,
			#476098 83.333%,
			#a7489b 83.333%
		);

		/* Set the background size and repeat properties. */
		background-size: 100%;
		background-repeat: repeat;

		/* Use the text as a mask for the background. */
		/* This will show the gradient as a text color rather than element bg. */
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;

		/* Animate the text when loading the element. */
		/* This animates it on page load and when hovering out. */
		animation: rainbow-text-simple-animation-rev 0.75s ease forwards;
	}

	.gradient-text:hover {
		animation: rainbow-text-simple-animation 0.5s ease-in forwards;
	}

	/* Move the background and make it smaller. */
	/* Animation shown when entering the page and after the hover animation. */
	@keyframes rainbow-text-simple-animation-rev {
		0% {
			background-size: 650%;
		}
		40% {
			background-size: 650%;
		}
		100% {
			background-size: 100%;
		}
	}

	/* Move the background and make it larger. */
	/* Animation shown when hovering over the text. */
	@keyframes rainbow-text-simple-animation {
		0% {
			background-size: 100%;
		}
		80% {
			background-size: 650%;
		}
		100% {
			background-size: 650%;
		}
	}
}
</style>
