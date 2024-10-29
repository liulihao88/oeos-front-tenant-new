<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance()
proxy.$toast('保存失败', 'e')
</script>

<template>
  <div>
    <div>test/t1.vue</div>
  </div>
</template>
