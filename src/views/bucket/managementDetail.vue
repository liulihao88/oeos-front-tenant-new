<script setup lang="ts">
import { ref, getCurrentInstance, computed } from 'vue'
const { proxy } = getCurrentInstance()

import { QUOTA_OPTIONS, QUOTA_UNIT } from '@/assets/globalData.ts'

import {
  getBucketTotal,
  editBucketTotal,
  retentionAutodelete,
  getRetentionAutodelete,
  setVersion,
  getVersion,
} from '@/api/bucket'
import { getLimitCeiling } from '@/api/system.ts'
import BucketTagging from '@/views/bucket/components/bucketTagging.vue'
import KeepTime from '@/views/task/components/keepTime.vue'

import { useRouter, useRoute } from 'vue-router'
const router = useRouter()
const tenantBucketDetails = ref(proxy.getStorage('tenant-bucket-details'))

const bucketName = ref(tenantBucketDetails.value.bucketName)
const versionStatus = ref(tenantBucketDetails.value.versionStatus)
const retentionAutoObj = ref({})
const dateForm = ref({})
const originDateForm = ref({})
const dateFormRef = ref(null)
const isShowDate = ref(false)
const limitQuota = ref(0)

const data = ref([])
const isRadioShow = ref(false)
const isQuotaShow = ref(false)
const isKnow = ref(false)
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
    label: '配额',
    prop: 'total',
  },
  {
    label: '已用容量',
    prop: 'usage',
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

const dateRules = computed(() => {
  // let res = {
  //   expireAfterDays: dateForm.value.enable ? [proxy.validate()] : [],
  // }
  // return res
  return []
})
const rules = {
  name: [proxy.validate()],
}

const init = async () => {
  let res = await Promise.all([getBucketTotal(bucketName.value)])

  data.value = [
    {
      total: res[0]?.quota.toFixed(2) + res[0]?.quotaUnit,
      usage: proxy.formatBytes(tenantBucketDetails.value.objectSize),
      createdDatetime: tenantBucketDetails.value.createdDatetime,
    },
  ]
}
init()
async function getRetentionAutodeleteInit() {
  let res = await getRetentionAutodelete(bucketName.value)
  dateForm.value = res
  originDateForm.value = res
  retentionAutoObj.value = proxy.clone(res)
  if (dateForm.value.expireAfterDays === undefined || dateForm.value.expireAfterDays === null) {
    dateForm.value.expireAfterDays = 7
  }
}

getRetentionAutodeleteInit()

async function getLimitCeilingInit() {
  let res = await getLimitCeiling()
  limitQuota.value = proxy.formatBytes(res)
}

const radioInput = (value) => {
  radioCacheValue.value = value
  isKnow.value = false
  isRadioShow.value = true
}
const radioConfirm = async () => {
  if (!isKnow.value) {
    return proxy.$toast('请勾选"我已了解更改存储桶版本控制的后果。"', 'e')
  }
  const sendData = {
    mfaDeleteEnabled: null,
    status: radioCacheValue.value,
  }
  await setVersion(bucketName.value, sendData)
  let res = await getVersion(bucketName.value)
  tenantBucketDetails.value.versionStatus = res.status
  proxy.setStorage('tenant-bucket-details', tenantBucketDetails.value)
  isRadioShow.value = false
  versionStatus.value = radioCacheValue.value
}
const radioMap = {
  Disabled: '未启用',
  Suspended: '暂停',
  Enabled: '启用',
}
const editQuota = () => {
  getLimitCeilingInit()
  isQuotaShow.value = true
}
const quotaConfirm = async () => {
  await editBucketTotal(tenantBucketDetails.value.bucketName, quotaForm.value)
  proxy.$toast('保存成功')
  isQuotaShow.value = false
  let mergeDetails = Object.assign(tenantBucketDetails.value, quotaForm.value)
  data.value[0].total = quotaForm.value.quota
  proxy.setStorage('tenant-bucket-details', mergeDetails)
}
const dateConfirm = async () => {
  await proxy.validForm(dateFormRef)
  await retentionAutodelete(bucketName.value, dateForm.value)
  getRetentionAutodeleteInit()
  isShowDate.value = false
}
const editDate = () => {
  isShowDate.value = true
  dateForm.value = Object.assign({}, originDateForm.value)
}
const goBack = () => {
  proxy.jump({
    name: 'Management',
  })
}
</script>

<template>
  <div>
    <o-title title="基本信息" t="0" b="8">
      <el-button class="ml" icon="el-icon-back" @click="goBack">返回</el-button>
      <!-- <o-icon name="back" class="ml"></o-icon> -->
    </o-title>
    <div class="c-box w-100% p-lr-32 p-tb-16">
      <div class="mb2">
        <span class="cl-45">存储桶名称:</span>
        <span class="bold ml">{{ bucketName }}</span>
        <span class="cl-45 ml6">存储桶ID:</span>
        <span class="bold ml">{{ tenantBucketDetails.bucketID }}</span>
      </div>
      <div class="f-ar-ct">
        <div class="top-item f-1">
          <img :src="proxy.formatImg('bucket/base1')" alt="" class="mr2" width="57" />
          <div class="f-bt-ct f-c">
            <span class="bold">{{ data?.[0]?.total }}</span>
            <span class="cl-45">配额</span>
          </div>
        </div>
        <div class="top-item f-1">
          <img :src="proxy.formatImg('bucket/base2')" alt="" class="mr2" width="57" />
          <div class="f-bt-ct f-c">
            <span class="bold">{{ data?.[0]?.usage }}</span>
            <span class="cl-45">已用容量</span>
          </div>
        </div>
        <div class="top-item f-1">
          <img :src="proxy.formatImg('bucket/base3')" alt="" class="mr2" width="57" />
          <div class="f-bt-ct f-c">
            <span class="bold">{{ proxy.formatThousands(tenantBucketDetails.objectCount) }}</span>
            <span class="cl-45">文件总数</span>
          </div>
        </div>
        <div class="top-item f-1">
          <img :src="proxy.formatImg('bucket/base4')" alt="" class="mr2" width="57" />
          <div class="f-bt-ct f-c">
            <span class="bold">{{ data?.[0]?.createdDatetime }}</span>
            <span class="cl-45">创建时间</span>
          </div>
        </div>
      </div>
    </div>

    <o-title title="属性设置" t="8" b="8" />

    <el-row :gutter="8" class="row-height">
      <el-col :span="12" class="h-100%">
        <div class="c-box h-33%">
          <o-title class="mr2" title="存储桶版本控制:" type="simple">
            <template #icon>
              <g-img src="bucket/control" class="mr" />
            </template>
            <el-radio-group :model-value="versionStatus" class="ml2" @change="radioInput">
              <el-radio value="Disabled" disabled>{{ radioMap.Disabled }}</el-radio>
              <el-radio value="Suspended">{{ radioMap.Suspended }}</el-radio>
              <el-radio value="Enabled">{{ radioMap.Enabled }}</el-radio>
            </el-radio-group>
          </o-title>

          <g-dif-warning class="mtb2" type="version" />
        </div>

        <div class="c-box mt h-33%">
          <o-title title="存储桶配额" type="simple">
            <template #icon>
              <g-img src="bucket/quota" class="mr" />
            </template>
          </o-title>
          <g-warning
            class="mt"
            content="用户可按需更改存储桶配额类型以及配额大小，但存储桶配额不可小于存储桶已使用容量。"
          />

          <div class="mtb2 f-st-ct">
            <div class="f-1">
              <span class="mr">当前存储桶配额:</span>
              <span class="cl-blue">{{ quotaForm.quota.toFixed(2) }} {{ quotaForm.quotaUnit }}</span>
            </div>
            <div class="f-1">
              <span class="mr">配额类型:</span>
              <span class="cl-blue">{{ QUOTA_OPTIONS.find((v) => v.value === quotaForm.quotaType).label }}</span>
            </div>
          </div>
          <div class="f-ed-ct">
            <el-button type="primary" class="f-ed-ct tr" @click="editQuota">编辑</el-button>
          </div>
        </div>

        <div class="c-box mt h-33%">
          <o-title title="对象定时删除" type="simple">
            <template #icon>
              <g-img src="bucket/delete" class="mr" />
            </template>
          </o-title>
          <g-warning
            class="mt"
            content="对象定时删除策略允许用户管理存储桶中对象的生命周期，可以在特定时间后自动删除存储桶内对象。"
          />

          <div class="mtb2 f-st-ct">
            <div class="f-1">
              <span class="mr">当前状态:</span>
              <span class="cl-blue">{{ retentionAutoObj.enable ? '启用' : '未启用' }}</span>
            </div>
            <div class="f-1">
              <span class="mr">对象保留时长:</span>
              <span class="cl-blue">
                {{ retentionAutoObj.expireAfterDays ? retentionAutoObj.expireAfterDays + '天' : '未设置' }}
              </span>
            </div>
          </div>
          <div class="f-ed-ct">
            <el-button type="primary" @click="editDate">编辑</el-button>
          </div>
        </div>
      </el-col>
      <el-col :span="12" class="h-100%">
        <div class="c-box mb h-50% o-a">
          <BucketTagging :bucketName="bucketName" />
        </div>
        <div class="c-box h-50% o-a">
          <BucketTagging :bucketName="bucketName" :isTag="false" />
        </div>
      </el-col>
    </el-row>

    <o-dialog ref="dialogRef" v-model="isRadioShow" title="存储桶版本控制" @confirm="radioConfirm">
      <o-title :title="`当前状态`">
        <div class="link ml">
          {{ radioMap[versionStatus] }}
        </div>
      </o-title>
      <!-- <div class="mtb">
        版本控制是将某一对象的多个变体保留在同一存储桶中的一种方法，能够保留、检索以及还原该存储桶中每个对象的每个版本。通过版本控制，您可以轻松地将意外的用户操作和应用程序故障中恢复存储对象。
      </div> -->

      <g-warning
        class="mtb2"
        content=" 更改存储桶版本控制必读: <br>1、对象版本设置的现有生命周期规则仍然适用。<br>2、不会更改存储桶中的现有对象。<br> 3、若新增对象和现有对象同名，将替换现有对象。"
      />

      <el-checkbox v-model="isKnow">我已了解更改存储桶版本控制的后果。</el-checkbox>
    </o-dialog>

    <o-dialog ref="dialogRef" v-model="isQuotaShow" title="修改配额" width="800" @confirm="quotaConfirm">
      <el-form :model="quotaForm" :rules="quotaRules" label-width="auto" class="mb2">
        <el-form-item label="存储桶配额" prop="quota">
          <div class="w-100%">
            <div class="f-st-ct">
              <el-input-number v-model="quotaForm.quota" class="mr2" :precision="2" />
              <o-radio v-model="quotaForm.quotaUnit" :options="QUOTA_UNIT" showType="button" />
            </div>
            <div class="mt2 w-100%">
              <g-warning :content="`新建桶配额下限为 0.5GB, 剩余可用容量为 ${limitQuota}`" />
            </div>
          </div>
        </el-form-item>

        <el-form-item label="配额类型" prop="">
          <o-select v-model="quotaForm.quotaType" :options="QUOTA_OPTIONS" :clearable="false" />
          <g-dif-warning type="quota" class="mt2 w-100%" />
        </el-form-item>
      </el-form>
    </o-dialog>

    <o-dialog ref="dialogRef" v-model="isShowDate" title="对象定时删除" @confirm="dateConfirm">
      <el-form ref="dateFormRef" :model="dateForm" :rules="dateRules">
        <el-form-item label="是否开启" prop="enable">
          <el-switch v-model="dateForm.enable" />
        </el-form-item>
        <el-form-item label="过期时间" prop="expireAfterDays">
          <KeepTime v-model="dateForm.expireAfterDays" type="default" />
        </el-form-item>
      </el-form>
    </o-dialog>
  </div>
</template>

<style lang="scss" scoped>
.top-item {
  display: flex;
}

.row-height {
  height: calc(100vh - 348px);
}
</style>
