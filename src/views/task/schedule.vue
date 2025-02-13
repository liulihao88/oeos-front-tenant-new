<script setup lang="ts">
import { ref, getCurrentInstance, nextTick, onMounted } from 'vue'
import { getSchedules, deleteSchedule, saveSchedule, getScheduleDetail } from '@/api/taskApi.ts'
import ScheduleChart from '@/views/task/components/scheduleChart.vue'
import { isEqual } from 'lodash-es'

const { proxy } = getCurrentInstance()
const dateValue = ref({})
const isDelete = ref(false)
const taskName = ref('')
const tableRef = ref(null)
const testTime = ref(['11:28', '12:28'])
const isShow = ref(false)
const isEdit = ref(false)
const batchTime = ref([])
const selectWeeks = ref([])
const originWeeks = ref([
  {
    label: '星期一',
    dayOfWeek: 'MONDAY',
    dates: [],
  },
  {
    label: '星期二',
    dayOfWeek: 'TUESDAY',
    dates: [],
  },
  {
    label: '星期三',
    dayOfWeek: 'WEDNESDAY',
    dates: [],
  },
  {
    label: '星期四',
    dayOfWeek: 'THURSDAY',
    dates: [],
  },
  {
    label: '星期五',
    dayOfWeek: 'FRIDAY',
    dates: [],
  },
  {
    label: '星期六',
    dayOfWeek: 'SATURDAY',
    dates: [],
  },
  {
    label: '星期日',
    dayOfWeek: 'SUNDAY',
    dates: [],
  },
])
const weeks = ref([])
weeks.value = proxy.clone(originWeeks.value)
const copyWeeks = ref([])
copyWeeks.value = proxy.clone(originWeeks.value)

const searchValue = ref('')
const extractChinese = (str) => {
  const regex = /[\u4e00-\u9fa5]+/g
  const matches = str.match(regex)
  return matches ? matches.join('') : ''
}

const deleteRow = async (row) => {
  let res = await deleteSchedule(row.value)
  if (res?.data?.status === 200) {
    proxy.$toast('删除成功')
    init()
  } else {
    let errorMsg = res?.data?.message
    let errorDetails = res?.data?.details
    let showMsg = '接口出错'
    if (errorMsg) {
      showMsg = errorMsg
    }
    if (errorDetails) {
      showMsg = extractChinese(errorDetails) || errorMsg
    }
    proxy.$toast(showMsg, 'e')
  }
}
const editRow = async () => {
  isEdit.value = true
  isShow.value = true
  batchTime.value = []
  selectWeeks.value = []
  copyWeeks.value = proxy.clone(weeks.value)
}

const columns = [
  {
    label: '计划名称',
    prop: 'name',
  },
  {
    label: '操作',
    width: 110,
    prop: 'operation',
    btns: [
      {
        content: '删除',
        handler: deleteRow,
        comp: 'o-icon',
        reConfirm: !proxy.$dev,
        attrs: {
          name: 'delete',
          content: '删除',
          style: {
            margin: '0 8px',
          },
        },
      },
      {
        content: '编辑',
        handler: editRow,
        comp: 'o-icon',
        attrs: {
          name: 'edit',
          content: '编辑',
          style: {
            margin: '0 8px',
          },
        },
      },
    ],
  },
]

const data = ref([])
const originData = ref([])
const selectRow = ref({})

const searchHandler = () => {
  if (!searchValue.value) {
    data.value = proxy.clone(originData.value)
    restoreHighLight()
    return
  }
  data.value = originData.value.filter((item) => {
    return item.name.includes(searchValue.value)
  })
  restoreHighLight()
}

const init = async () => {
  let res = await getSchedules()
  originData.value = res
  searchHandler()
  _handleRowClick()
}
init()

async function restoreHighLight() {
  let matchRow = data.value.find((item) => {
    return item.value === selectRow.value.value
  })
  if (matchRow) {
    tableRef.value.$refs.tableRef.setCurrentRow(matchRow)
  }
}

const _handleRowClick = () => {
  let localTaskName = proxy.getStorage('tenant-task-name') || ''
  let clickIdx = 0
  if (data.value.length === 0) {
    reset()
    return
  }
  if (localTaskName) {
    let taskNameIdx = data.value.findIndex((item) => {
      return item.name === localTaskName
    })
    clickIdx = taskNameIdx === -1 ? 0 : taskNameIdx
  }
  tableRef.value.$refs.tableRef.setCurrentRow(data.value[clickIdx])
}

const handleCurrentChange = async (currentRow, oldCurrentRow) => {
  if (currentRow) {
    selectRow.value = currentRow
  }
  proxy.setStorage('tenant-task-name', currentRow?.name ?? '')
  if (proxy.notEmpty(currentRow)) {
    let res = await getScheduleDetail(currentRow.value)
    taskName.value = res.name
    const cloneWeeks = proxy.clone(originWeeks.value)
    copyWeeks.value = proxy.clone(originWeeks.value)
    weeks.value = proxy.clone(originWeeks.value)
    cloneWeeks.forEach((v, i) => {
      res.workPeriodsList.forEach((val, idx) => {
        if (val.dayOfWeek === v.dayOfWeek) {
          val.workPeriods = val.workPeriods.map((item, index) => {
            return {
              ...item,
              parseTimes:
                item.fromHH !== undefined || item.fromHH !== null
                  ? [
                      (item.fromHH + '').padStart(2, '0') + ':' + (item.fromMM + '').padStart(2, '0'),
                      (item.toHH + '').padStart(2, '0') + ':' + (item.toMM + '').padStart(2, '0'),
                    ]
                  : [],
            }
          })
          let cloneWorkPeriods = proxy.clone(val.workPeriods)
          copyWeeks.value[i].dates = cloneWorkPeriods
          weeks.value[i].dates = cloneWorkPeriods
        }
      })
    })
  }
}

const reset = () => {
  taskName.value = ''
  selectRow.value = {}
  isDelete.value = true
  nextTick(() => {
    isDelete.value = false
  })
  tableRef.value.$refs.tableRef.setCurrentRow(null)
}

const saveReq = async () => {
  let workPeriodsList = copyWeeks.value
    .filter((v) => {
      return v.dates.length > 0
    })
    .map((v) => {
      return {
        dayOfWeek: v.dayOfWeek,
        workPeriods: v.dates.map((val) => {
          return {
            fromHH: val.parseTimes[0].split(':')[0],
            fromMM: val.parseTimes[0].split(':')[1],
            toHH: val.parseTimes[1].split(':')[0],
            toMM: val.parseTimes[1].split(':')[1],
          }
        }),
      }
    })
  const sendData = {
    id: selectRow.value?.value,
    name: taskName.value,
    workPeriodsList: workPeriodsList,
  }
  proxy.setStorage('tenant-task-name', taskName.value)
  await saveSchedule(sendData)
  proxy.$toast('保存成功')
  weeks.value = proxy.clone(copyWeeks)
  init()
}
const batchClear = () => {
  batchTime.value = []
}
const batchAdd = () => {
  copyWeeks.value = copyWeeks.value.map((v) => {
    if (selectWeeks.value.length === 0 || selectWeeks.value.includes(v.dayOfWeek)) {
      let hasDates = v.dates.some((val) => {
        if (isEqual(val.parseTimes, batchTime.value)) {
          return true
        }
      })
      if (!hasDates) {
        v.dates.push({ parseTimes: batchTime.value })
      }
    }
    return v
  })
}
const batchDelete = () => {
  copyWeeks.value = copyWeeks.value.map((v) => {
    if (selectWeeks.value.length === 0 || selectWeeks.value.includes(v.dayOfWeek)) {
      v.dates = v.dates.filter((val) => {
        if (isEqual(val.parseTimes, batchTime.value)) {
          return false
        } else {
          return true
        }
      })
    }
    return v
  })
}
const isTimeValid = (startTime, endTime) => {
  return new Date(`2023-01-01T${startTime}`).getTime() < new Date(`2023-01-01T${endTime}`).getTime()
}
const isTimeOverlapping = (startTime, endTime, timeRangeList, idx) => {
  return timeRangeList.some((range, index) => {
    if (range.startTime === startTime && range.endTime === endTime && idx === index) {
      return false
    }
    if (range.startTime === startTime && range.endTime === endTime && idx !== index) {
      return true
    }
    return !(
      new Date(`2023-01-01T${endTime}`).getTime() <= new Date(`2023-01-01T${range.startTime}`).getTime() ||
      new Date(`2023-01-01T${startTime}`).getTime() >= new Date(`2023-01-01T${range.endTime}`).getTime()
    )
  })
}
const save = async () => {
  if (proxy.isEmpty(taskName.value)) {
    return proxy.$toast('计划名称不能为空', 'e')
  }

  let isTimeEmpty = true

  copyWeeks.value.forEach((v, i) => {
    let timeRangeList = []
    v.dates.forEach((val, idx) => {
      isTimeEmpty = false
      if (proxy.isEmpty(val.parseTimes)) {
        proxy.$toast(v.label + '第' + (idx + 1) + '个时间不能为空', 'e')
        throw new Error()
      }
      let startTime = val.parseTimes[0]
      let endTime = val.parseTimes[1]
      timeRangeList.push({
        startTime: startTime,
        endTime: endTime,
      })
    })
    console.log(`87 v.dates`, v.dates)
    v.dates.forEach((val, idx) => {
      let startTime = val.parseTimes[0]
      let endTime = val.parseTimes[1]
      if (startTime === endTime) {
        proxy.$toast(v.label + '第' + (idx + 1) + '个时间段开始时间与结束时间不能相同', 'e')
        throw new Error()
      }
      if (isTimeOverlapping(startTime, endTime, timeRangeList, idx)) {
        proxy.$toast(v.label + '第' + (idx + 1) + '个时间段与其他时间段不能重叠', 'e')
        throw new Error()
      }
    })
  })
  if (isTimeEmpty) {
    return proxy.$toast('时间不能为空', 'e')
  }
  await saveReq()
  isShow.value = false
}
const addTime = (v, i) => {
  copyWeeks.value[i].dates.push({ parseTimes: [] })
}
const deleteTime = (v, i, val = '', idx = '') => {
  isDelete.value = true
  if (idx !== '') {
    copyWeeks.value[i].dates.splice(idx, 1)
  } else {
    copyWeeks.value[i].dates = []
  }
  nextTick(() => {
    isDelete.value = false
  })
}

const newAdd = () => {
  reset()
  isEdit.value = false
  isShow.value = true
  batchTime.value = []
  selectWeeks.value = []
  copyWeeks.value = proxy.clone(originWeeks.value)
}
</script>

<template>
  <div class="task-container">
    <div class="l">
      <div class="f-st-ct m-tb-16">
        <o-input
          v-model.trim="searchValue"
          v-throttle.300="searchHandler"
          title="计划名称"
          placeholder="请输入"
          @clear="searchHandler"
        />
        <el-button type="primary" class="m-l-16" @click="newAdd">新建</el-button>
      </div>
      <div>
        <o-table
          ref="tableRef"
          :columns="columns"
          :data="data"
          :showPage="false"
          highlight-current-row
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
    <div class="r">
      <ScheduleChart :weeks="weeks" />
    </div>

    <o-dialog
      ref="dialogRef"
      v-model="isShow"
      :title="isEdit ? '编辑任务计划' : '新建任务计划'"
      width="1400"
      @confirm="save"
    >
      <div class="r" style="display: flex; flex-direction: column; height: 100%; margin-left: 0">
        <div class="r-top">
          <o-input v-model.trim="taskName" v-focus title="计划名称" width="300" class="mr" />

          <div class="batch-box">
            <o-comp-title title="批量操作" />
            <el-time-picker
              v-model="batchTime"
              is-range
              format="HH:mm"
              value-format="HH:mm"
              style="width: 140px"
              @clear="batchClear"
            />
            <el-button
              type="primary"
              :disabled="batchTime.length === 0"
              class="m-l-10"
              icon="el-icon-plus"
              @click="batchAdd"
            >
              添加
            </el-button>
            <el-button :disabled="batchTime.length === 0" icon="el-icon-delete" class="m-r-10" @click="batchDelete">
              删除
            </el-button>

            <o-select
              v-model="selectWeeks"
              width="400"
              :options="originWeeks"
              value="dayOfWeek"
              multiple
              collapse-tags
              collapse-tags-tooltip
              :max-collapse-tags="3"
            />
          </div>
        </div>
        <div class="r-content">
          <div v-for="(v, i) in copyWeeks" :key="i" class="item">
            <div class="f-bt">
              <span>
                {{ v.label }}
              </span>
              <o-tooltip content="清空当前列">
                <el-button size="small" class="ml2" @click="deleteTime(v, i)">
                  <o-icon name="delete" />
                </el-button>
              </o-tooltip>
              <o-tooltip content="添加">
                <el-button type="primary" size="small" class="ml2" @click="addTime(v, i)">
                  <o-icon name="plus" />
                </el-button>
              </o-tooltip>
            </div>

            <template v-if="!isDelete">
              <div v-for="(val, idx) in v.dates" :key="idx" class="f-st-ct m-tb-8">
                <el-time-picker
                  v-model="val.parseTimes"
                  is-range
                  format="HH:mm"
                  value-format="HH:mm"
                  style="width: 140px"
                />
                <o-svg name="eraser" size="16" class="cp ml fs-12" @click="deleteTime(v, i, val, idx)" />
              </div>
            </template>
          </div>
        </div>
      </div>
    </o-dialog>
  </div>
</template>

<style scoped lang="scss">
.task-container {
  display: flex;

  .l {
    position: absolute;
    z-index: 1;
    width: 280px;
    height: 100%;
    height: calc(100vh - 124px);
    padding: 8px;
    margin-right: 20px;
    overflow: auto;
    background-color: #fff;
    border-right: 1px solid #eee;
  }

  .r {
    flex: 1;
    min-width: calc(100vw - 1000px);
    height: calc(100%);
    // min-height: 500px;
    margin-left: 300px;
    overflow-x: auto;
    background: #fff;

    .r-top {
      display: flex;
      align-items: center;
      margin-bottom: 16px;
    }

    .r-content {
      display: flex;
      flex: 1;
      justify-content: space-between;
      height: 100%;
      // min-height: 500px;
      overflow: auto;
      background-color: #fff;

      .item {
        flex: 1;
        min-width: 180px;
        height: 100%;
        min-height: 500px;
        padding: 8px;
        overflow: auto;
        border-left: 1px solid #eee;
      }

      .item:last-child {
        border-right: 0;
      }
    }
  }
}

.batch-box {
  display: flex;
  align-items: center;

  :deep(.el-input__wrapper) {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }
}
</style>
