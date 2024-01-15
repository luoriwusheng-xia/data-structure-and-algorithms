<template>
	<div>
		<h4>锥形渐变</h4>

		<hr />
		<div class="demo-list">
			<div>
				<div class="box box-1"></div>
				<div>从红色渐变到蓝色</div>
			</div>
			<div>
				<div class="box box-2"></div>
				<div>更改渐变的中心点</div>
			</div>
			<div>
				<div class="box box-3"></div>

				<div>通过设置 border-radius: 50% 把圆锥渐变变成一个圆：</div>
			</div>
			<div>
				<div class="box box-4"></div>
				<div>设置起点位置</div>
			</div>

			<div>
				<div class="box box-5"></div>
				<div>
					设置起始点，从50px,50px 为中心点， 蓝色从0% 渐变到 75%， 红色从75% -
					100% （占比25%）结束
				</div>
			</div>

			<div>
				<div class="box box-6"></div>
				<div>
					背景经过缩小，设置 background-size 以后，再重复，就是这样的4个角的效果
          <p>蓝色我们不需要，变成透明</p>
				</div>
			</div>

			<div>
				<div class="box-7-outer">
					<div class="box box-7"></div>
				</div>
				<div>这是背景不重复的情况</div>
			</div>
		</div>
    <div>
      <img src="./image.png" alt="">
    </div>
	</div>
</template>

<style lang="scss" scoped>
.demo-list {
	display: flex;
	flex-wrap: wrap;
	gap: 20px;
}

.box {
	width: 100px;
	height: 100px;
}

.box-1 {
	background: conic-gradient(red 0deg, blue 270deg);
}

.box-2 {
	background: conic-gradient(at 10px 10px, red 0deg, blue 270deg);
}

.box-3 {
	background-image: conic-gradient(red, yellow, green, blue, black);
	border-radius: 50%;
}

.box-4 {
	background-image: conic-gradient(from 90deg at 60% 45%, red, yellow, green);
}

.box-5 {
	background: conic-gradient(at 20px 20px, blue 75%, red 75%);
}

.box-6 {
	background: conic-gradient(at 20px 20px, blue 75%, red 75%) 0 0 /
		calc(100% - 20px) calc(100% - 20px);
}

.box-7-outer {
  width: 100px;
	height: 100px;
	background-color: pink;
}
.box-7 {
	background: conic-gradient(at 20px 20px, blue 75%, red 75%) 0 0 /
		calc(100% - 20px) calc(100% - 20px);

	background-repeat: no-repeat;
}
</style>
