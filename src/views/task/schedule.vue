<script setup lang="ts">
import { ref, getCurrentInstance, nextTick, onMounted } from 'vue'
import { getSchedules, deleteSchedule, saveSchedule, getScheduleDetail } from '@/api/taskApi.ts'

const { proxy } = getCurrentInstance()
const dateValue = ref({})
const isDelete = ref(false)
const taskName = ref('')
const tableRef = ref(null)
const testTime = ref(['11:28', '12:28'])
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
      showMsg = extractChinese(errorDetails)
    }
    proxy.$toast(showMsg, 'e')
  }
}

const columns = [
  {
    label: '任务名称',
    prop: 'name',
  },
  {
    label: '操作',
    width: 100,
    key: 'operation',
    btns: [{ content: '删除', handler: deleteRow }],
  },
]

const data = ref([])
const originData = ref([])
const selectedRows = ref([])

const searchHandler = () => {
  if (!searchValue.value) {
    data.value = proxy.clone(originData.value)
    return
  }
  data.value = originData.value.filter((item) => {
    return item.name.includes(searchValue.value)
  })
}

const init = async () => {
  let res = await getSchedules()
  originData.value = res
  searchHandler()
  _handleRowClick()
}
init()

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
  selectedRows.value = currentRow
  proxy.setStorage('tenant-task-name', currentRow?.name ?? '')
  if (proxy.notEmpty(currentRow)) {
    let res = await getScheduleDetail(currentRow.value)
    taskName.value = res.name
    const cloneWeeks = proxy.clone(originWeeks.value)
    weeks.value = proxy.clone(originWeeks.value)
    cloneWeeks.forEach((v, i) => {
      res.workPeriodsList.forEach((val, idx) => {
        if (val.dayOfWeek === v.dayOfWeek) {
          val.workPeriods = val.workPeriods.map((item, index) => {
            return {
              ...item,
              parseTimes: item.fromHH ? [item.fromHH + ':' + item.fromMM, item.toHH + ':' + item.toMM] : [],
            }
          })
          weeks.value[i].dates = val.workPeriods
        }
      })
    })
  }
}

const reset = () => {
  taskName.value = ''
  weeks.value = proxy.clone(originWeeks.value)
  isDelete.value = true
  nextTick(() => {
    isDelete.value = false
  })
  tableRef.value.$refs.tableRef.setCurrentRow(null)
}

const saveReq = async () => {
  let workPeriodsList = weeks.value
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
    id: selectedRows.value?.value,
    name: taskName.value,
    workPeriodsList: workPeriodsList,
  }
  proxy.setStorage('tenant-task-name', taskName.value)
  await saveSchedule(sendData)
  proxy.$toast('保存成功')
  init()
}
const isTimeValid = (startTime, endTime) => {
  return new Date(`2023-01-01T${startTime}`).getTime() < new Date(`2023-01-01T${endTime}`).getTime()
}
const isTimeOverlapping = (startTime, endTime, timeRangeList) => {
  return timeRangeList.some((range) => {
    if (range.startTime === startTime && range.endTime === endTime) {
      return false
    }
    return !(
      new Date(`2023-01-01T${endTime}`).getTime() <= new Date(`2023-01-01T${range.startTime}`).getTime() ||
      new Date(`2023-01-01T${startTime}`).getTime() >= new Date(`2023-01-01T${range.endTime}`).getTime()
    )
  })
}
const save = async () => {
  if (proxy.isEmpty(taskName.value)) {
    return proxy.$toast('任务名称不能为空', 'e')
  }

  let isTimeEmpty = true
  weeks.value.forEach((v, i) => {
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
    v.dates.forEach((val, idx) => {
      let startTime = val.parseTimes[0]
      let endTime = val.parseTimes[1]
      if (isTimeOverlapping(startTime, endTime, timeRangeList)) {
        proxy.$toast(v.label + '第' + (idx + 1) + '个时间段与其他时间段不能重叠', 'e')
        throw new Error()
      }
    })
  })
  if (isTimeEmpty) {
    return proxy.$toast('时间不能为空', 'e')
  }
  await saveReq()
}
const addTime = (v, i) => {
  weeks.value[i].dates.push({ parseTimes: [] })
}
const deleteTime = (v, i, val = '', idx = '') => {
  isDelete.value = true
  if (idx !== '') {
    weeks.value[i].dates.splice(idx, 1)
  } else {
    weeks.value[i].dates = []
  }
  nextTick(() => {
    isDelete.value = false
  })
}
</script>

<template>
  <div class="task-container">
    <div class="l">
      <div class="f-st-ct m-tb-16">
        <o-input
          v-model.trim="searchValue"
          v-throttle.300="searchHandler"
          placeholder="请输入"
          @clear="searchHandler"
        />
        <el-button size="small" type="primary" class="m-l-16" @click="reset">新建</el-button>
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
      <div class="r-top">
        <o-input v-model="taskName" addon-before="任务名" width="300" />
        <el-button v-throttle="save" size="small" type="primary" class="m-l-16">保存</el-button>
      </div>
      <div class="r-content">
        <div v-for="(v, i) in weeks" :key="i" class="item">
          <div class="f-bt">
            <span>
              {{ v.label }}
            </span>
            <el-button size="small" class="ml2" @click="deleteTime(v, i)">
              <o-icon name="delete" />
            </el-button>
            <el-button type="primary" size="small" class="ml2" @click="addTime(v, i)">
              <o-icon name="plus" />
            </el-button>
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
              <o-icon class="cp ml fs-12" name="circle-close" @click="deleteTime(v, i, val, idx)" />
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.task-container {
  display: flex;
  // height: calc(100vh - 324px);

  .l {
    position: absolute;
    width: 280px;
    height: calc(100vh - 144px);
    // height: 100%;
    padding: 8px;
    margin-right: 20px;
    overflow: auto;
    background-color: #fff;
    border-right: 1px solid #eee;
  }

  .r {
    flex: 1;
    height: calc(100vh - 144px);
    margin-left: 300px;

    .r-top {
      display: flex;
      align-items: center;
      margin-top: 8px;
      margin-bottom: 16px;
    }

    .r-content {
      display: flex;
      flex: 1;
      justify-content: space-between;
      height: 100%;
      overflow: auto;
      background-color: #fff;

      .item {
        flex: 1;
        padding: 8px;
        border-left: 1px solid #eee;
      }

      .item:last-child {
        border-right: 0;
      }
    }
  }
}
</style>
