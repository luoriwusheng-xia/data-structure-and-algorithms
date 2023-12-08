<template>
    <div class="container-box">
      <div class="left">左边</div>
      <div class="right">右边</div>
    </div>
</template>


<style lang="less" scoped>
  .container-box {
    display: flex;
    width: 100%;
    height: 50px;
    background-color: pink;
    .left {
      width: 120px;
      background: greenyellow;
    }

    .right {
      flex: 1;
      background-color: aquamarine;
    }
  }
</style>