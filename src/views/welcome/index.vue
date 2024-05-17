<script setup lang="ts">
import { ref } from 'vue'
defineOptions({
  name: 'Welcome',
})
const isShow = ref(false)
function isTest85() {
  isShow.value = true
}
</script>

<template>
  <div>
    <o-dialog ref="dialogRef" v-model="isShow" title="index" />
    <h1>oeos-front-tenant-new</h1>
    <el-button type="primary" @click="isTest85">测试15</el-button>
  </div>
</template>
