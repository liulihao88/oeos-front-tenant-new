<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance()
import { useRouter, useRoute } from 'vue-router'
const router = useRouter()
const route = useRoute()
const options = ref([
  { name: '小月月', value: 'xyy' },
  { name: '小鑫鑫', value: 'xxx' },
])

const a = ref('xxx')
const toT4 = () => {
  console.log('toT4')
  router.push('/test3/t3/t4')
}
</script>

<template>
  <div>
    <div class="container">
      <div class="left">左侧固定宽度</div>
      <div class="right">
        右侧自适应宽度I want to set some random text, if you like it , please tell me. good wish for you! thank you so
        much. hive a nice day!I want to set some random text, if you like it , please tell me. good wish for you! thank
        you so much. hive a nice day!I want to set some random text, if you like it , please tell me. good wish for you!
        thank you so much. hive a nice day! 2024-07-16 18:04:13I want to set some random text, if you like it , please
        tell me. good wish for you! thank you so much. have a nice day!
      </div>
    </div>
    <el-button type="primary" @click="toT4">跳转t4</el-button>

    <roiter-view />
  </div>
</template>

<style lang="scss" scoped>
.container {
  display: flex;
}

.left {
  width: 200px; /* 左侧固定宽度 */
  background-color: lightblue;
}

.right {
  flex-grow: 1; /* 右侧自适应 */
  background-color: red;
}
</style>
