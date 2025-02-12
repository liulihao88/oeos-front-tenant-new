<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance()
const cc = ref(123)
</script>

<template>
  <div>
    <div>test/t1.vue</div>
    <oCompTitle title="批量添加" width="200" />
    <o-input v-model="cc" title="你好" />
  </div>
</template>
