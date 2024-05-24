<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance()
const options = ref([
  { name: '小月月', value: 'xyy' },
  { name: '小鑫鑫', value: 'xxx' },
])

const a = ref('xxx')
</script>

<template>
  <div>
    <div class="container">
      <div class="left">左侧固定宽度</div>
      <div class="right">
        右侧自适应宽度I want to set some random text, if you like it , please tell me. good wish for you! thank you so
        much. hive a nice day!I want to set some random text, if you like it , please tell me. good wish for you! thank
        you so much. hive a nice day!I want to set some random text, if you like it , please tell me. good wish for you!
        thank you so much. hive a nice day!
      </div>
    </div>
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
