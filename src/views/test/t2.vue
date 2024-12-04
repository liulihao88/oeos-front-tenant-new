<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance()
const form = ref({})
const isShow = ref(false)
const modifyPasswordRef = ref(null)
import ModifyPassword from '@/layout/components/lay-sidebar/modifyPassword.vue'

const open = () => {
  modifyPasswordRef.value.open()
}
</script>

<template>
  <div>
    <el-button type="primary" @click="isShow = true">测试55</el-button>
    <el-button type="primary" @click="open">测试22</el-button>
    <o-dialog ref="dialogRef" v-model="isShow" title="t2">
      <el-form ref="formRef" :model="form">
        <el-form-item label="名称" prop="name">
          <o-input v-model="form.name" v-focus />
        </el-form-item>
      </el-form>
    </o-dialog>

    <ModifyPassword ref="modifyPasswordRef" />
  </div>
</template>
