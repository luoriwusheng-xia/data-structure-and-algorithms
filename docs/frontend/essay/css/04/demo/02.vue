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
      <div>
        更改渐变的中心点
      </div>
		</div>
		<div class="box box-3"></div>
		<div class="box box-4"></div>
    </div>
	</div>
</template>

<style lang="scss" scoped>
.demo-list {
  display: flex;
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
</style>
