<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance()
import ModifyPassword from '@/layout/components/lay-sidebar/modifyPassword.vue'

const modifyPasswordRef = ref(null)

const modifyPasswordHandler = () => {
  modifyPasswordRef.value.open()
}
</script>

<template>
  <div>
    <div>test/t3.vue</div>
    <ModifyPassword ref="modifyPasswordRef" />
    <el-button type="primary" @click="modifyPasswordHandler">测试51</el-button>
  </div>
</template>
