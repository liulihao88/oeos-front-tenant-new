<script setup>
import { ref, getCurrentInstance } from 'vue'
import { initBucket, saveBucket, getLimitCeiling } from '@/api/system.ts'
import { QUOTA_OPTIONS } from '@/assets/globalData.ts'

const { proxy } = getCurrentInstance()
const form = ref({
  quota: '1.0',
  quotaType: 'hard',
})
const limitMax = ref(0)
const fieldList = [
  {
    label: '默认容量大小',
    prop: 'quota',
    comp: 'el-input-number',
    attrs: {
      min: 0,
      precision: 2,
      style: {
        width: '300px',
      },
    },
  },
  {
    label: '存储桶容量类型',
    prop: 'quotaType',
    comp: 'o-select',
    attrs: {
      width: 300,
      clearable: false,
      options: QUOTA_OPTIONS,
    },
  },
]
const rules = {
  quota: [proxy.validate('默认空间不能小于0.5GB、不能小于0.1TB或者不能小于0.01PB')],
}
const save = async () => {
  if (form.value.quota < 0.5 && form.value.quotaUnit === 'GB') {
    proxy.$toast('默认空间不能小于0.51GB', 'w')
    return false
  } else if (form.value.quota < 0.1 && form.value.quotaUnit === 'TB') {
    proxy.$toast('默认空间不能小于0.1TB', 'w')
    return false
  } else if (form.value.quota < 0.01 && form.value.quotaUnit === 'PB') {
    proxy.$toast('默认空间不能小于0.01PB', 'w')
    return false
  }
  let num = proxy.formatBytes(form.value.quota + form.value.quotaUnit)
  console.log(`37 num`, num)
  if (num > limitMax.value) {
    proxy.$toast('默认空间不能大于' + proxy.formatBytes(limitMax.value), 'w')
    return false
  }
  await saveBucket(form.value)
  proxy.$toast('保存成功')
}
async function init(isReset = false) {
  let res = await initBucket()
  form.value = res
  if (isReset) {
    proxy.$toast('重置成功')
  }
}

const getLimitCeilingFn = async () => {
  let res = await getLimitCeiling()
  limitMax.value = res
}
init()
</script>

<template>
  <div class="c-container">
    <o-title title="默认桶配置" sub-title="默认空间不能小于0.5GB、不能小于0.1TB或者不能小于0.01PB" b="16" />

    <o-form ref="oFormRef" :fieldList="fieldList" :model="form" :rules="rules" />

    <div>
      <el-button type="primary" @click="save">保存</el-button>
      <el-button type="primary" @click="init(true)">重置</el-button>
    </div>
  </div>
</template>
