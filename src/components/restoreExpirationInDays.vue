<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance()
import KeepTime from '@/views/task/components/keepTime.vue'
import { objectRestore, objectRestoreBatch } from '@/api/bucketReview'

const isShow = ref(false)
const keepTimeRef = ref(null)
const form = ref({
  expirationInDays: '0y0m1d0h',
})

const sendRowOrArr = ref()
const emits = defineEmits(['success'])

const open = (row) => {
  sendRowOrArr.value = proxy.clone(row)
  form.value.expirationInDays = '0y0m1d0h'
  isShow.value = true
}

const confirm = async () => {
  let expirationInDays = keepTimeRef.value.getValue()
  let sendExpirationInDays = ''
  const regex = /(\d+)y(\d+)m(\d+\.?\d*)d([\d]*\.[\d]+|[\d]+)h/
  if (expirationInDays) {
    const match = expirationInDays.match(regex)
    sendExpirationInDays = match[3]
  }
  if (Array.isArray(sendRowOrArr.value)) {
    await objectRestoreBatch(sendExpirationInDays, sendRowOrArr.value)
  } else {
    let sendData = {
      bucket: sendRowOrArr.value.bucket,
      expirationInDays: sendExpirationInDays,
      key: sendRowOrArr.value.key,
      version: sendRowOrArr.value.version,
    }
    await objectRestore(sendData)
  }
  proxy.$toast('恢复成功')
  emits('success')
  isShow.value = false
}

defineExpose({
  open,
})
</script>

<template>
  <div>
    <o-dialog ref="dialogRef" v-model="isShow" title="设置过期时间" width="800px" @confirm="confirm">
      <el-form ref="formRef" :model="form" :rules="rules">
        <el-form-item label="恢复过期时间" prop="expirationInDays">
          <KeepTime
            ref="keepTimeRef"
            :inputAttrs="{ precision: 0, min: 1 }"
            :value="form.expirationInDays"
            type="restore"
          />
        </el-form-item>
      </el-form>
    </o-dialog>
  </div>
</template>
