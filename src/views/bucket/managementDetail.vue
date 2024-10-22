<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance()

import { getBucketTotal } from '@/api/bucket'

import { useRouter, useRoute } from 'vue-router'
const router = useRouter()
const tenantBucketDetails = ref(proxy.getStorage('tenant-bucket-details'))

const bucketName = ref(tenantBucketDetails.value.bucketName)
const versionStatus = ref(tenantBucketDetails.value.versionStatus)
console.log(`37 versionStatus`, versionStatus)
versionStatus.value = 'Enabled'

const data = ref([])
const isRadioShow = ref(false)
const isKnow = ref(true)
const radioCacheValue = ref()
const columns = [
  {
    label: '总容量',
    prop: 'total',
  },
  {
    label: '已用容量',
    prop: 'usage',
  },
  {
    label: '文件总数',
    prop: 'fileTotal',
  },
  {
    label: '创建时间',
    prop: 'createdDatetime',
  },
]

const init = async () => {
  let res = await Promise.all([getBucketTotal(bucketName.value)])
  console.log(`24 res`, res)

  data.value = [
    {
      total: res[0].quota + res[0].quotaUnit,
      usage: proxy.formatBytes(tenantBucketDetails.value.objectSize),
      fileTotal: 10,
      createdDatetime: tenantBucketDetails.value.createdDatetime,
    },
  ]
}
init()

const radioInput = (value) => {
  console.log(`26 value`, value)
  radioCacheValue.value = value
  isRadioShow.value = true
}
const radioConfirm = () => {
  if (!isKnow.value) {
    return proxy.$toast('请勾选"我了解更改存储桶版本控制的后果"', 'e')
  }
  isRadioShow.value = false
  versionStatus.value = radioCacheValue.value
}
const radioMap = {
  Disabled: '未启用',
  Suspended: '暂停',
  Enabled: '启用',
}
</script>

<template>
  <div>
    <o-title title="存储桶使用情况" />
    <o-table ref="tableRef" :showPage="false" :columns="columns" :data="data" />

    <o-title title="多版本控制" />

    <div class="f-st-ct">
      <div class="mr2">存储桶版本控制:</div>
      <el-radio-group :model-value="versionStatus" @change="radioInput">
        <el-radio value="Disabled">{{ radioMap.Disabled }}</el-radio>
        <el-radio value="Suspended">{{ radioMap.Suspended }}</el-radio>
        <el-radio value="Enabled">{{ radioMap.Enabled }}</el-radio>
      </el-radio-group>
    </div>

    <o-dialog ref="dialogRef" v-model="isRadioShow" title="存储桶版本控制" @confirm="radioConfirm">
      <o-title :title="`当前状态`">
        <div class="link ml">
          {{ radioMap[versionStatus] }}
        </div>
      </o-title>
      <div class="mtb">
        版本控制是将某一对象的多个变体保留在同一存储桶中的一种方法，能够保留、检索以及还原该存储桶中每个对象的每个版本。通过版本控制，您可以轻松地将意外的用户操作和应用程序故障中恢复存储对象。
      </div>

      <g-warning
        title=" 更改存储桶版本控制必读: <br>1、对象版本设置的现有生命周期规则仍然适用。<br>2、不会更改存储桶中的现有对象。<br> 3、若新增对象和现有对象同名，将替换现有对象。"
      />

      <el-checkbox v-model="isKnow">我已了解更改存储桶版本控制的后果。</el-checkbox>
    </o-dialog>
  </div>
</template>
