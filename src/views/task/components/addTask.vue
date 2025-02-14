<script setup lang="ts">
import { ref, getCurrentInstance, watch, nextTick, computed, h } from 'vue'
import KeepTime from './keepTime.vue'
import HighSettings from '@/views/task/components/highSettings.vue'
import { pick, omit } from 'lodash'

import { getSchedules, getTargetStorageList, saveTask, taskDetails } from '@/api/taskApi.ts'
import OpenAllSwitch from '@/views/task/components/openAllSwitch.vue'
import { loading1 } from '@/utils/request.ts'

const FREEZE = 'FREEZE'
const ZERO_COPY_FREEZE = 'ZERO_COPY_FREEZE'
const UNFREEZE = 'UNFREEZE'
const DELETE = 'DELETE'

const emits = defineEmits(['success'])

const highSettingsRef = ref(null)
const formRef = ref(null)
const selectRef = ref(null)
const keepTimeRef = ref(null)

const { proxy } = getCurrentInstance()
const isTargetBucket = ref(false)
const isEdit = ref(false)
const targetOptions = ref([])
const isLimitNumber = ref(false)
const isShow = ref(false)
const originForm = ref({
  properties: {
    workScheduleExeOpportunity: 'IncludeExecute',
    maxUnfreezingQueueSize: 1,
    objectFilter: {
      expiredTimeExpress: '0y0m0d0h',
      keyPrefix: '',
    },
    includeBuckets: [],
  },
})
const form = ref({})
form.value = proxy.clone(originForm)
const rules = {
  name: [proxy.validate(), { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: ['blur', 'change'] }],
  action: [proxy.validate('请选择')],
  properties: {
    targetStorageId: [proxy.validate('请选择')],
  },
}
const planOptions = ref([])
const isView = ref(false)

const compTitle = computed(() => {
  if (isView.value) {
    return '查看桶任务'
  }
  return isEdit.value ? '编辑桶任务' : '新建桶任务'
})

const actionChange = async (value) => {
  if (!isEdit.value) {
    let { workSchedule, workScheduleExeOpportunity } = proxy.clone(form.value.properties)
    isTargetBucket.value = false
    form.value = proxy.clone(originForm)
    form.value.action = value
    await nextTick()
    let highForm = highSettingsRef.value.originForm
    highSave(highForm)
    form.value.properties.workSchedule = workSchedule
    form.value.properties.workScheduleExeOpportunity = workScheduleExeOpportunity
  }

  if (form.value.action === FREEZE || form.value.action === ZERO_COPY_FREEZE) {
    let res = await getTargetStorageList()
    targetOptions.value = res
  }
}

const open = async (row = '') => {
  if (row) {
    let res = await taskDetails(row.id)
    form.value = res
    if (row.enabled) {
      isView.value = true
    } else {
      isView.value = false
    }
    isEdit.value = true
    actionChange()
    isTargetBucket.value = !form.value.properties.includeBuckets ? true : false
    isShow.value = true
  } else {
    isEdit.value = false
    isView.value = false
    isTargetBucket.value = false
    form.value = proxy.clone(originForm)
    if (proxy.$dev) {
      form.value.name = proxy.uuid()
      form.value.action = FREEZE
      setTimeout(() => {
        selectRef.value.$refs.selectRef.$emit('change', form.value.action)
      }, 300)
    }
    isShow.value = true
    await nextTick()
    let highForm = highSettingsRef.value.originForm
    highSave(highForm)
  }
}

const save = async () => {
  if (isView.value === true) {
    return (isShow.value = false)
  }
  await proxy.validForm(formRef)
  if (form.value.action === FREEZE || form.value.action === ZERO_COPY_FREEZE) {
    if (!isTargetBucket.value && !form.value.properties.includeBuckets) {
      proxy.$toast('请选择桶', 'w')
      return
    }
  }
  const copyForm = proxy.clone(form)
  if (isTargetBucket.value) {
    copyForm.properties.includeBuckets = null
  }
  if (copyForm.action !== UNFREEZE) {
    copyForm.properties.objectFilter.expiredTimeExpress = keepTimeRef.value?.getValue?.()
  }
  // 处理冷冻任务
  if (copyForm.action === UNFREEZE) {
    if (!isLimitNumber.value) {
      copyForm.properties.maxUnfreezingQueueSize = -1
    }
  }
  // 根据不同的冷冻类型, 筛选出对应的要传给后端的属性值
  let sendForm = proxy.clone(copyForm)
  if (copyForm.action === FREEZE || copyForm.action === ZERO_COPY_FREEZE) {
    sendForm.properties = omit(copyForm.properties, ['maxUnfreezingQueueSize'])
  }
  if (copyForm.action === UNFREEZE) {
    sendForm.properties = pick(copyForm.properties, ['maxUnfreezingQueueSize'])
  }
  if (form.value.action === DELETE) {
    sendForm.properties = pick(copyForm.properties, [
      'objectFilter',
      'workSchedule',
      'workScheduleExeOpportunity',
      'includeBuckets',
    ])
  }
  await saveTask(sendForm)
  isShow.value = false
  emits('success')
}

const highSettings = () => {
  if (form.value.id || form.value.properties) {
    highSettingsRef.value.open(form.value.properties)
  } else {
    highSettingsRef.value.open()
  }
}
const highSave = (highForm) => {
  form.value = {
    ...form.value,
    properties: {
      ...form.value.properties,
      ...highForm,
    },
  }
}

const initSchedule = async () => {
  let res = await getSchedules()
  planOptions.value = res
}
initSchedule()

defineExpose({
  open,
})
</script>

<template>
  <div>
    <o-dialog
      v-model="isShow"
      :title="compTitle"
      width="60%"
      confirmText="完成"
      cancelText="高级配置"
      :enableConfirm="highSettingsRef && !highSettingsRef.isShow"
      :showCancel="form.action === FREEZE || form.action === ZERO_COPY_FREEZE"
      :cancelAttrs="{
        type: 'primary',
      }"
      :confirmAttrs="{
        loading: loading1,
      }"
      @confirm="save"
      @cancel="highSettings"
    >
      <el-form id="taskForm" ref="formRef" :model="form" :rules="rules" label-width="150" :disabled="isView">
        <o-title title="基本信息" />
        <el-form-item label="任务名称" prop="name">
          <o-input v-model="form.name" min="3" max="20" />
        </el-form-item>
        <el-form-item label="任务类型" prop="action">
          <o-select
            ref="selectRef"
            v-model="form.action"
            :options="proxy.TASK_TYPE_OPTIONS"
            :disabled="isEdit"
            :clearable="false"
            @change="actionChange"
          />
        </el-form-item>

        <el-divider v-if="form.action" />
        <div v-show="form.action !== UNFREEZE && form.action">
          <el-form-item label="数据保留时长" prop="">
            <KeepTime ref="keepTimeRef" :value="form.properties?.objectFilter?.expiredTimeExpress" :isView="isView" />
          </el-form-item>
          <el-form-item label="任务计划" prop="">
            <div class="f-st-ct">
              <o-select
                v-model="form.properties.workSchedule"
                :options="planOptions"
                width="200"
                label="name"
                class="mr"
                :disabled="isView"
              />
              <el-radio-group v-if="form.properties.workSchedule" v-model="form.properties.workScheduleExeOpportunity">
                <el-radio value="IncludeExecute">计划内执行</el-radio>
                <el-radio value="ExcludeExecute">计划外执行</el-radio>
              </el-radio-group>
            </div>
          </el-form-item>
        </div>
        <template v-if="form.action === UNFREEZE">
          <el-form-item label="数据解冻配置" prop="">
            <div>
              <span class="mr">限制解冻队列数量</span>
              <el-switch v-model="isLimitNumber" />
            </div>
            <div v-if="isLimitNumber" class="f-st-ct mlr2">
              <span class="mr">最大解冻队列数量</span>
              <el-input-number v-model="form.properties.maxUnfreezingQueueSize" v-number :min="1" width="100" />
            </div>
          </el-form-item>
        </template>

        <!-- </template> -->
        <template v-if="form.action === FREEZE || form.action === ZERO_COPY_FREEZE">
          <el-divider />
          <o-title title="数据空间配置: " />
          <el-form-item label="选择目标存储" prop="properties.targetStorageId">
            <o-select
              v-model="form.properties.targetStorageId"
              :options="targetOptions"
              label="name"
              :disabled="isView"
            />
          </el-form-item>
          <el-form-item label="处理目标桶" prop="" required>
            <div class="f-st-ct w-100%">
              <OpenAllSwitch v-model="isTargetBucket" />

              <g-bucket2
                v-if="!isTargetBucket"
                ref="bucketRef"
                v-model="form.properties.includeBuckets"
                :disabled="isTargetBucket || isView"
                :clearable="true"
                multiple
                width="100%"
              />
              <g-bucket2
                v-if="isTargetBucket"
                ref="bucketRef2"
                v-model="form.properties.excludeBuckets"
                :disabled="!isTargetBucket || isView"
                title="作用例外桶"
                width="100%"
                :clearable="true"
                multiple
              />
            </div>
          </el-form-item>
        </template>

        <template v-if="form.action === DELETE">
          <el-form-item label="处理目标桶" prop="">
            <div class="f-st-ct w-100%">
              <g-bucket2
                v-if="!isTargetBucket"
                ref="bucketRef"
                v-model="form.properties.includeBuckets"
                :clearable="true"
                width="100%"
                multiple
              />
            </div>
          </el-form-item>
        </template>
      </el-form>

      <HighSettings ref="highSettingsRef" :isView="isView" @save="highSave" />
    </o-dialog>
  </div>
</template>

<style lang="scss" scoped>
:deep(.el-form-item__content) {
  line-height: unset;
}
</style>
