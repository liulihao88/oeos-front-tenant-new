<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance()
</script>

<template>
  <div>
    <div>test/t1.vue</div>
    <div class="translate-icon1">
      旋转 90度
      <g-img :src="proxy.formatImg('login/bg')" />
      <o-icon name="expand" type="svg" class="m-l-6 m-t-10 w-100" size="100" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
// trans
.translate-icon1 {
  width: 100px; /* 设置宽度以便观察旋转效果 */
  height: 100px; /* 设置高度以便观察旋转效果 */
  background-color: lightblue; /* 设置背景颜色以便观察旋转效果 */
  transition: all 0.5s ease-out;
  transform: rotate(90deg);
}
</style>
