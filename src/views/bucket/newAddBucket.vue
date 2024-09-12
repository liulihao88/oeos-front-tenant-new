<script setup lang="tsx">
import { ref, getCurrentInstance, h } from 'vue'
const { proxy } = getCurrentInstance()
import { saveBucket } from '@/api/bucket.js'
import { spawn } from 'child_process'

const model = ref({
  bucketName: '',
  quota: '',
  quotaUnit: 'GB',
  quotaType: 'hard',
  versionEnabled: false,
  objectLockEnabled: false,
  bucketEncryptionEnabled: false,
  bucketNotification: true,
})
const formRef = ref()
const emits = defineEmits(['success'])
const validateNumber = (rule, value, callback) => {
  let validFlag = /^[1-9]\d*(\.\d{1})?$/.test(value)
  if (!validFlag) {
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
    label: '容量',
    prop: 'quota',
    useSlot: true,

    rules: [
      {
        required: true,
      },
      {
        validator: validateNumber,
        trigger: ['change', 'blur'],
        message: '请输入数字, 且最多一位小数',
      },
    ],
  },
  {
    label: '类型',
    prop: 'quotaType',
    comp: 'o-select',

    attrs: {
      clearable: false,
      options: [
        { label: '软配额', value: 'soft' },
        { label: '硬配额', value: 'hard' },
      ],
    },
  },
  {
    label: '桶事件通知',
    prop: 'bucketNotification',
    comp: 'o-radio',
    attrs: {
      options: [
        { label: '启用', value: true },
        { label: '禁用', value: false },
      ],
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
  {
    label: '锁定',
    prop: 'objectLockEnabled',
    comp: 'o-radio',
    attrs: {
      options: [
        { label: '启用', value: true },
        { label: '禁用', value: false },
      ],
    },
  },
  {
    label: '加密',
    prop: 'bucketEncryptionEnabled',
    comp: 'o-radio',
    attrs: {
      options: [
        { label: '启用', value: true },
        { label: '禁用', value: false },
      ],
    },
  },
]

const unitOptions = [
  { label: 'GB', value: 'GB' },
  { label: 'TB', value: 'TB' },
  { label: 'PB', value: 'PB' },
]
async function confirm() {
  await formRef.value.validate()
  console.log(`16 model.value`, model.value)
  proxy.log(` model.value`, model.value, '113行 bucket/newAddBucket.vue')
  await saveBucket(model.value)
  isShow.value = false
  emits('success')
}
const isShow = ref(false)

function devTest() {
  if (proxy.$dev) {
    model.value.bucketName = proxy.uuid('bucketName')
    model.value.quota = proxy.random(1, 10)
  }
}
function open() {
  devTest()
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
          <div class="f-bt-ed w-100%">
            <div class="w-60%">
              <o-input v-model="model.quota" />
            </div>
            <div class="m-l-8">
              <o-radio v-model="model.quotaUnit" :options="unitOptions" showType="button" />
            </div>
          </div>
          <o-icon name="warning" size="12" />
          <div class="cl-45">新建桶容量下限为 0.5GB 、 0.1TB 或 0.1PB, 剩余空间为 1,012.00 GB</div>
        </template>
      </o-form>
    </o-dialog>
  </div>
</template>
