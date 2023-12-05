<template>
	<div class="gallery-container">
		<div class="thumbnails"></div>

		<!-- 自定义滚动条 -->
		<div class="scrollbar">
			<div class="thumb"></div>
		</div>

		<div class="slides">
			<div><img src="https://picsum.photos/id/1067/540/720" /></div>
			<div><img src="https://picsum.photos/id/122/540/720" /></div>
			<div><img src="https://picsum.photos/id/188/540/720" /></div>
			<div><img src="https://picsum.photos/id/249/540/720" /></div>
			<div><img src="https://picsum.photos/id/257/540/720" /></div>
			<div><img src="https://picsum.photos/id/259/540/720" /></div>
			<div><img src="https://picsum.photos/id/283/540/720" /></div>
			<div><img src="https://picsum.photos/id/288/540/720" /></div>
			<div><img src="https://picsum.photos/id/299/540/720" /></div>
		</div>
	</div>
</template>

<script setup>
// 纯js实现
import { onMounted } from 'vue'

// 单个元素高度
const slideHeight = 720
const marginTop = 16

const init = () => {
	const slideGallery = document.querySelector('.slides')
	const slides = slideGallery.querySelectorAll('div')

	const scrollbarThrumb = document.querySelector('.thumb')
	const slideCount = slides.length

	// 缩略图-容器
	const thumbnails = document.querySelector('.thumbnails')

	/**
	 * 计算自定义滚动条高度，初始 height = 0
	 */
	const scrollThumb = () => {
		const index = Math.floor(slideGallery.scrollTop / slideHeight)
		const h = ((index + 1) / slideCount) * slideHeight

		scrollbarThrumb.style.height = `${h}px`

		// 让左侧缩略图高亮
		let imgs = thumbnails.querySelectorAll('img')

		Array.from(imgs).forEach((p) => {
			p.style.border = 'none'
		})

		thumbnails.querySelectorAll('img')[index].style.border = '1px solid red'
	}

	// 让图片滚动到具体位置
	const scrollToElement = (el) => {
		let index = Number(el.dataset.id)

		slideGallery.scrollTo(0, index * slideHeight + marginTop)
	}

	// 动态生成缩略图
	const dots = [...slides].map((item, i) => {
		let img = new Image()

		img.src = item.querySelector('img').src
		img.dataset.id = i
		img.classList = ['pic']

		img.style.width = '40px'
		img.style.height = '40px'
		img.style.cursor = 'pointer'

		return img
	})

	thumbnails.append(...dots)

	// 监听点击
	// document.querySelectorAll('.thumbnails img').forEach((el) => {
	// 	// 点击哪个缩略图，就跳转到对应图片
	// 	el.addEventListener('click', () => scrollToElement(el))
	// })

	// 采用事件代理的方式实现
	thumbnails.addEventListener('click', (e) => {
		let id = e.target.dataset.id
		if (id !== undefined) {
			// 说明点击的是图片
			scrollToElement(e.target)
		}
	})

	// 监听父盒子的滚动，动态改变自定义滚动条高度
	slideGallery.addEventListener('scroll', (e) => scrollThumb())

	scrollThumb()
}

onMounted(() => {
	init()
})
</script>
<style lang="less" scoped>
.gallery-container {
	display: flex;
	// 先水平居中
	justify-content: center;

	.thumbnails {
		display: flex;
		flex-direction: column;
		gap: 8px;

		// 这里不会生效，因为当前使用的是 vue. vue中使用了 scoped,会生成 .gallery-container .thumbnails[data-v-a12da231]
		// hash, 动态创建的元素，并不能跟这里的 pic 匹配，那怕写的  img {xxx样式}
		// 2种方式， style 不加 scoped, 则为全局样式
		// 使用js动态添加样式
		.pic {
			width: 40px;
			height: 40px;
			cursor: pointer;
		}
	}
}
.scrollbar {
	width: 1px;
	height: 720px;
	background: #ccc;
	display: block;
	margin: 0 0 0 8px;

	.thumb {
		width: 1px;
		position: absolute;
		height: 0;
		background: #000;
	}
}

// 图片的设置

.slides {
	display: grid;
	grid-auto-flow: row;
	gap: 1rem;

	width: calc(540px + 1rem);
	height: 720px;

	padding: 0 0.25rem;
	margin: 0 16px;

	overflow-y: auto;
	overscroll-behavior-y: contain;
	scroll-snap-type: y mandatory;
	scrollbar-width: none;

	div {
		scroll-snap-align: start;
	}

	img {
		width: 540px;
		object-fit: contain;
	}

	// 隐藏原生滚动条
	&::-webkit-scrollbar {
		display: none;
	}
}
</style>
