<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance()
const model = ref({
  bucketName: '',
  quota: '',
  quotaType: 'hard',
  bucketNotification: true,
  versionEnabled: false,
  objectLockEnabled: false,
  bucketEncryptionEnabled: false,
})
const formRef = ref()

const fieldList = [
  {
    label: '桶名',
    prop: 'bucketName',
    placeholder: '请输入桶名, 限3-63个字符',
    rules: [
      {
        required: true,
      },
      {
        min: 3,
        message: '长度最少是3',
      },
      {
        max: 63,
        message: '长度最长是63',
      },
    ],
  },
  {
    label: '容量',
    prop: 'quota',
    default: '123',
    rules: [
      {
        required: true,
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
async function confirm() {
  await formRef.value.validate()
  proxy.log(`model`, model, '102行 bucket/newAddBucket.vue')
}
const isShow = ref(true)
</script>

<template>
  <div>
    <o-drawer v-model="isShow" title="新增桶" @confirm="confirm">
      <o-form ref="formRef" :model="model" :fieldList="fieldList" />
    </o-drawer>
  </div>
</template>
