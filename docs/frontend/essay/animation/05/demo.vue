<template>

  <div class="container">
    <div class="box"></div>
  </div>
</template>

<script setup></script>

<style lang="scss" scoped>

.container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 30vh;
  background-color: #000;
}
.box {
  width: 300px;
  height: 300px;
  background: url(./circle.png)
    no-repeat center;
  background-size: 100%;
  transform-style: preserve-3d;
  transform: translateX(-50%) rotateX(75deg);
  animation: rotate3 20s linear infinite;
}

@keyframes rotate3 {
  0% {
    transform: translateX(-50%) rotateX(75deg) rotateZ(0);
  }

  100% {
    transform: translateX(-50%) rotateX(75deg) rotateZ(360deg);
  }
}
</style>
