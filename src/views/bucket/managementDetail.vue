<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance()

import { QUOTA_OPTIONS, QUOTA_UNIT } from '@/assets/globalData.ts'

import { getBucketTotal, editBucketTotal } from '@/api/bucket'

import { useRouter, useRoute } from 'vue-router'
const router = useRouter()
const tenantBucketDetails = ref(proxy.getStorage('tenant-bucket-details'))

const bucketName = ref(tenantBucketDetails.value.bucketName)
const versionStatus = ref(tenantBucketDetails.value.versionStatus)
console.log(`37 versionStatus`, versionStatus)

const data = ref([])
const isRadioShow = ref(false)
const isQuotaShow = ref(false)
const isKnow = ref(true)
const radioCacheValue = ref()
const validateNumber = (rule, value, callback) => {
  let getQuota = proxy.formatBytesConvert(value + quotaForm.value.quotaUnit)
  let minQuota = proxy.formatBytesConvert('0.5GB')
  if (getQuota < minQuota) {
    callback(new Error('请输入数字'))
  } else {
    callback()
  }
}
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
const quotaForm = ref({
  quota: tenantBucketDetails.value.quota,
  quotaUnit: tenantBucketDetails.value.quotaUnit,
  quotaType: tenantBucketDetails.value.quotaType,
})
const quotaRules = {
  quota: [
    {
      validator: validateNumber,
      trigger: ['change', 'blur'],
      message: '桶最小为0.5GB',
    },
  ],
}

const init = async () => {
  let res = await Promise.all([getBucketTotal(bucketName.value)])
  console.log(`24 res`, res)
  data.value = [
    {
      total: res[0]?.quota + res[0]?.quotaUnit,
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
const editQuota = () => {
  isQuotaShow.value = true
}
const quotaConfirm = async () => {
  await editBucketTotal(tenantBucketDetails.value.bucketName, quotaForm.value)
  proxy.$toast('保存成功')
  isQuotaShow.value = false
}
</script>

<template>
  <div>
    <o-title title="基本信息" l="-16" />
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

    <o-title title="属性" l="-16" />
    <o-title title="修改容量属性">
      <el-button type="primary" class="mlr" size="small" @click="editQuota">编辑</el-button>
      <div class="bold-400">
        当前容量:
        <span class="cl-red">
          {{ data[0]?.total }}
        </span>
      </div>
    </o-title>

    <o-title title="对象过期删除">
      <el-button type="primary" class="mlr" size="small" @click="editQuota">编辑</el-button>
      <div class="bold-400">
        过期时间:
        <span class="cl-red">未设置</span>
      </div>
      <div class="bold-400 ml2">
        是否启用:
        <span class="cl-red">未启用</span>
      </div>
    </o-title>

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

    <o-dialog ref="dialogRef" v-model="isQuotaShow" title="修改存储容量" @confirm="quotaConfirm">
      <el-form :model="quotaForm" :rules="quotaRules" label-width="auto">
        <el-form-item label="存储" prop="quota">
          <div class="f-st-ct">
            <el-input-number v-model="quotaForm.quota" class="mr2" />

            <o-radio v-model="quotaForm.quotaUnit" :options="QUOTA_UNIT" showType="button" />
          </div>
          <o-icon name="warning" size="12" class="ml2" content="新建桶容量下限为 0.5GB 、 0.1TB 或 0.1PB" />
        </el-form-item>
        <el-form-item label="类型" prop="">
          <o-select v-model="quotaForm.quotaType" :options="QUOTA_OPTIONS" :clearable="false" />
        </el-form-item>
      </el-form>
    </o-dialog>
  </div>
</template>
