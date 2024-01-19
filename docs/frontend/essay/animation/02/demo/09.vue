<template>
	<div class="box-container">
		<div class="box green"></div>
		<div class="box purple"></div>
		<div class="box orange"></div>
		<div class="box purple"></div>
		<div class="box green"></div>
	</div>
</template>

<script setup ></script>

<style lang="scss" scoped>
.box-container {
  display: flex;
  gap: 10px;


  .box {
    width: 60px;
    height: 60px;
  }
}

.green {
  background-color: green;
}

.purple {
  background-color: purple;
}

.orange {
  background-color: orange;
}

</style>
