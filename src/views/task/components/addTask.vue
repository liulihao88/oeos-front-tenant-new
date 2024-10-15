<script setup lang="ts">
import { ref, getCurrentInstance, watch } from 'vue'
import KeepTime from './keepTime.vue'

import { getSchedules } from '@/api/taskApi.ts'

const { proxy } = getCurrentInstance()
const taskOptions = [
  { label: '数据冷冻', value: 'FREEZE' },
  { label: '数据解冻', value: 'UNFREEZE' },
  { label: '数据过期', value: 3 },
]
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
  name: [proxy.validate('between', { min: 3, max: 20 })],
  action: [proxy.validate('请选择')],
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

const next = () => {
  console.log("  {label: '数据冷冻', value: 1},")
}
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
</script>

<template>
  <div>
    <o-dialog v-model="isShow" title="桶任务" width="80%">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="auto">
        <o-title title="基本信息" />
        <el-form-item label="任务名称" prop="name">
          <o-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="任务类型" prop="action">
          <o-select v-model="form.action" :options="taskOptions" />
        </el-form-item>
        <hr class="m-tb-16" />
        <el-form-item label="数据保留时长" prop="">
          <KeepTime v-model="form.properties.objectFilter.expiredTimeExpress" />
        </el-form-item>
        <template v-if="action === 'UNFREEZE'">
          <el-form-item label="数据解冻配置" prop="">
            <div>
              <span>限制解冻队列数量</span>
              <el-switch v-model="isLimitNumber" />
            </div>
            <div>
              <span>最大解冻队列数量</span>
              <o-input v-model="form.properties.MAX_UNFREEZING_QUEUE_SIZE" v-number :min="1" />
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
        <o-title title="数据空间配置: " />
      </el-form>

      <template #footer>
        <el-button type="" @click="prev">上一步</el-button>
        <el-button type="primary" @click="highSettings">高级配置</el-button>
        <el-button type="primary" @click="next">下一步</el-button>
      </template>
    </o-dialog>
  </div>
</template>
