<script setup lang="ts">
import { ref, getCurrentInstance, watch } from 'vue'
import KeepTime from './keepTime.vue'

import { getSchedules, getTargetStorageList } from '@/api/taskApi.ts'

const FREEZE = 'FREEZE'
const UNFREEZE = 'UNFREEZE'

const formRef = ref(null)

const { proxy } = getCurrentInstance()
const taskOptions = [
  { label: '数据冷冻', value: FREEZE },
  { label: '数据解冻', value: UNFREEZE },
  { label: '数据过期', value: 3 },
]
const isTargetBucket = ref(false)
const targetOptions = ref([])
const isLimitNumber = ref(false)
const isShow = ref(true)
const form = ref({
  properties: {
    workSchedule: 'IncludeExecute',
    objectFilter: {
      expiredTimeExpress: '0y0m0d0h',
      keyPrefix: '',
    },
  },
})
const rules = {
  name: [proxy.validate(), { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: ['blur', 'change'] }],
  action: [proxy.validate('请选择')],
  properties: {
    targetStorageId: [proxy.validate('请选择')],
  },
}
const planOptions = ref([])

watch(
  isLimitNumber,
  (val) => {
    if (!val) {
      form.value.properties.MAX_UNFREEZING_QUEUE_SIZE = -1
    }
  },
  {
    deep: true,
    immediate: true,
  },
)

const save = async () => {
  await proxy.validForm(formRef)
}
const getTargetBucketValue = async () => {}
const prev = () => {
  console.log("  {label: '数据冷冻', value: 1},")
}
const highSettings = () => {
  console.log('highSettings')
}

const initSchedule = async () => {
  let res = await getSchedules()
  planOptions.value = res
}
initSchedule()
const actionChange = async (value) => {
  if (value === FREEZE) {
    let res = await getTargetStorageList()
    targetOptions.value = res
  }
}
</script>

<template>
  <div>
    <o-dialog v-model="isShow" title="桶任务" width="80%">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="auto">
        <o-title title="基本信息" />
        <el-form-item label="任务名称" prop="name">
          <o-input v-model="form.name" min="3" max="20" />
        </el-form-item>
        <el-form-item label="任务类型" prop="action">
          <o-select v-model="form.action" :options="taskOptions" @change="actionChange" />
        </el-form-item>
        <hr class="m-tb-16" />
        <el-form-item label="数据保留时长" prop="">
          <KeepTime v-model="form.properties.objectFilter.expiredTimeExpress" />
        </el-form-item>
        <template v-if="form.action === UNFREEZE">
          <el-form-item label="数据解冻配置" prop="">
            <div>
              <span class="mr">限制解冻队列数量</span>
              <el-switch v-model="isLimitNumber" />
            </div>
            <div v-if="isLimitNumber" class="f mlr2">
              <span class="mr">最大解冻队列数量</span>
              <el-input-number v-model="form.properties.MAX_UNFREEZING_QUEUE_SIZE" v-number :min="1" width="100" />
            </div>
          </el-form-item>
        </template>
        <el-form-item label="任务计划" prop="">
          <div class="f-st-ct">
            <o-select
              v-model="form.properties.workScheduleExeOpportunity"
              :options="planOptions"
              width="200"
              label="name"
              class="mr"
            />
            <el-radio-group v-if="form.properties.workScheduleExeOpportunity" v-model="form.properties.workSchedule">
              <el-radio value="IncludeExecute">计划内执行</el-radio>
              <el-radio value="ExcludeExecute">计划外执行</el-radio>
            </el-radio-group>
          </div>
        </el-form-item>
        <!-- </template> -->
        <template v-if="form.action === FREEZE">
          <hr class="m-bt-16" />
          <o-title title="数据空间配置: " />
          <el-form-item label="选择目标存储" prop="properties.targetStorageId">
            <o-select v-model="form.properties.targetStorageId" :options="targetOptions" label="name" />
          </el-form-item>
          <el-form-item label="处理目标桶" prop="">
            <el-switch v-model="isTargetBucket" inline-prompt active-text="所有桶" inactive-text="所有桶" class="mr" />
            <g-bucket2
              v-if="!isTargetBucket"
              ref="bucketRef"
              v-model="form.properties.includeBuckets"
              :disabled="isTargetBucket"
              :clearable="true"
              multiple
              class="ml"
            />
            <g-bucket2
              v-if="isTargetBucket"
              ref="bucketRef2"
              v-model="form.properties.excludeBuckes"
              :disabled="!isTargetBucket"
              title="作用例外桶"
              width="300"
              :clearable="true"
              multiple
            />
          </el-form-item>
        </template>
      </el-form>

      <template #footer>
        <el-button type="" @click="prev">上一步</el-button>
        <el-button v-if="form.action === FREEZE" type="primary" @click="highSettings">高级配置</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </template>
    </o-dialog>
  </div>
</template>
