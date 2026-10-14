<template>
  <div class="container">
    欢迎使用电商选品平台
  </div>
</template>

<script>
export default {
  name: "Welcome"
}
</script>

<style scoped>
.container{
  color: aliceblue;
  font-size: xx-large;
  display: flex; /* 开启flex布局 */
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
} 
.child{
  color: aliceblue;
  font-size: xx-large;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%,-50%);
}

</style>