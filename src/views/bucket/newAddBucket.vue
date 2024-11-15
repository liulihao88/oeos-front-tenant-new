<script setup lang="tsx">
import { ref, getCurrentInstance, h } from 'vue'
const { proxy } = getCurrentInstance()
import { saveBucket } from '@/api/bucket.ts'
import { getLimitCeiling } from '@/api/system.ts'
import { QUOTA_UNIT, QUOTA_OPTIONS } from '@/assets/globalData.ts'

import GetBucketList from '@/hooks/getBucketList.ts'
const getBucketList = GetBucketList()
const limitQuota = ref(0)

async function getLimitCeilingInit() {
  let res = await getLimitCeiling()
  limitQuota.value = proxy.formatBytes(res)
}

const originModel = ref({
  bucketName: '',
  quota: '1.00',
  quotaUnit: 'GB',
  quotaType: 'hard',
  versionEnabled: false,
  objectLockEnabled: false,
  bucketEncryptionEnabled: false,
  bucketNotification: true,
})
const model = ref({})
const isShow = ref(false)
const formRef = ref()

const emits = defineEmits(['success'])
const validateNumber = (rule, value, callback) => {
  let getQuota = proxy.formatBytesConvert(value + model.value.quotaUnit)
  let minQuota = proxy.formatBytesConvert('0.5GB')
  if (getQuota < minQuota) {
    callback(new Error('请输入数字'))
  } else {
    callback()
  }
}
const fieldList = [
  {
    label: '桶名',
    prop: 'bucketName',
    placeholder: '桶名必填, 限3-63个字符',
    directives: {
      focus: true,
    },
    rules: [
      {
        min: 3,
        message: '字符最少是3',
      },
      {
        max: 63,
        message: '字符最长是63',
      },
      proxy.validate(),
    ],
  },

  {
    label: '配额',
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
    label: '类型',
    prop: 'quotaType',
    comp: 'o-select',
    attrs: {
      clearable: false,
      options: QUOTA_OPTIONS,
    },
  },
  {
    label: '桶版本',
    prop: 'versionEnabled',
    comp: 'o-radio',
    attrs: {
      options: [
        { label: '启用', value: true },
        { label: '禁用', value: false },
      ],
    },
  },
  // {
  //   label: '锁定',
  //   prop: 'objectLockEnabled',
  //   comp: 'o-radio',
  //   attrs: {
  //     options: [
  //       { label: '启用', value: true },
  //       { label: '禁用', value: false },
  //     ],
  //   },
  // },
  // {
  //   label: '加密',
  //   prop: 'bucketEncryptionEnabled',
  //   comp: 'o-radio',
  //   attrs: {
  //     options: [
  //       { label: '启用', value: true },
  //       { label: '禁用', value: false },
  //     ],
  //   },
  // },
]

async function confirm() {
  await formRef.value.validate()
  await saveBucket(model.value)
  await getBucketList.update()
  isShow.value = false
  emits('success')
}

function devTest() {
  if (proxy.$dev) {
    model.value.bucketName = proxy.uuid('bucketName')
    model.value.quota = proxy.random(1, 10)
  }
}
function open() {
  model.value = proxy.clone(originModel)
  devTest()
  getLimitCeilingInit()
  isShow.value = true
}
defineExpose({
  open,
})
</script>

<template>
  <div>
    <o-dialog v-model="isShow" title="新增桶" confirmText="保存" @confirm="confirm">
      <o-form ref="formRef" :model="model" :fieldList="fieldList">
        <template #quota>
          <div class="f-st-ct w-100%">
            <div class="m-r-16">
              <el-input-number v-model="model.quota" :precision="2" :min="0" />
            </div>
            <div>
              <o-radio v-model="model.quotaUnit" :options="QUOTA_UNIT" showType="button" />
            </div>
          </div>
          <o-icon name="warning" size="12" class="mr" />
          <div class="cl-45">新建桶配额下限为 0.5GB, 剩余可用容量为 {{ limitQuota }}</div>
        </template>
      </o-form>
    </o-dialog>
  </div>
</template>
