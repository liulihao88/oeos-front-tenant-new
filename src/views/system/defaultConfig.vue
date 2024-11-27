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
const limitQuota = ref(0)
const validateNumber = (rule, value, callback) => {
  let getQuota = proxy.formatBytesConvert(value + form.value.quotaUnit)
  let minQuota = proxy.formatBytesConvert('0.5GB')
  if (getQuota < minQuota) {
    callback(new Error('请输入数字'))
  } else {
    callback()
  }
}
async function getLimitCeilingInit() {
  let res = await getLimitCeiling()
  limitQuota.value = proxy.formatBytes(res)
}
getLimitCeilingInit()
const fieldList = [
  {
    label: '默认配额大小',
    prop: 'quota',
    useSlot: true,
    rules: [
      {
        required: true,
        trigger: ['change', 'blur'],
      },
      {
        validator: validateNumber,
        trigger: ['change', 'blur'],
        message: '桶最小为0.5GB',
      },
    ],
  },
  {
    label: '存储桶配额类型',
    prop: 'quotaType',
    comp: 'o-select',
    useSlot: true,
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
    <o-title title="默认桶配置" b="16" />
    <div class="c-box">
      <o-form ref="oFormRef" :fieldList="fieldList" :model="form" :rules="rules">
        <template #quota>
          <div class="f-st-ed w-100%">
            <div class="m-r-16">
              <el-input-number v-model="form.quota" :precision="2" :min="0" />
            </div>
            <div>
              <o-radio v-model="form.quotaUnit" :options="QUOTA_UNIT" showType="button" />
            </div>
          </div>
          <div class="mt2">
            <g-warning content="默认空间不能小于0.5GB、不能小于0.1TB或者不能小于0.01PB" class="mb2" />
            <g-warning :content="`新建桶配额下限为 0.5GB, 剩余可用容量为 ${limitQuota}`" style="align-items: center" />
          </div>
        </template>

        <template #quotaType>
          <div>
            <o-select v-model="form.quotaType" :options="QUOTA_OPTIONS" :clearable="false" />
            <div class="mt2">
              <g-dif-warning type="quota" />
            </div>
          </div>
        </template>
      </o-form>

      <div>
        <el-button type="primary" @click="save">保存</el-button>
        <el-button type="primary" @click="init(true)">重置</el-button>
      </div>
    </div>
  </div>
</template>
