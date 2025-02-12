<script setup lang="ts">
import { ref, watch } from 'vue'
// https://zunnzunn.github.io/vue-ganttastic/introduction.html
import { GGanttChart, GGanttRow } from '@infectoone/vue-ganttastic'
import { isEmpty, notEmpty, clone } from 'oeos-components'

const props = defineProps({
  weeks: {
    type: Array,
    required: true,
  },
})

const colorMap = ['#e96560', '#5ccfa3', '#77d6fa', '#1b2a47', '#5ccfa3', '#f8bc45', '#f3953d']

const context = ref([])

watch(
  () => props.weeks,
  (val) => {
    if (isEmpty(val)) {
      return
    }
    const baseObj = {
      ganttBarConfig: {
        immobile: false,
        hasHandles: false,
        style: {
          fontSize: '12px',
        },
      },
    }
    context.value = val.map((v, i) => {
      let arr = []
      if (v.dates.length === 0) {
        let obj = {
          ...baseObj,
          label: v.label,
          beginDate: '',
          endDate: '',
        }
        obj.ganttBarConfig.style.background = 'unset'
        arr.push(obj)
      } else {
        v.dates.forEach((val) => {
          let obj = clone(baseObj)
          obj.label = v.label
          obj.beginDate = val?.parseTimes?.[0] ?? ''
          obj.endDate = val?.parseTimes?.[1] ?? ''
          obj.ganttBarConfig.label = obj.beginDate + '~' + obj.endDate
          obj.ganttBarConfig.style.background = colorMap[i]
          if (i === 3) {
            obj.ganttBarConfig.style.color = '#fff'
          }
          arr.push(obj)
        })
      }
      return arr
    })
  },
  {
    deep: true,
  },
)
</script>

<template>
  <g-gantt-chart
    chart-start="00:00"
    chart-end="23:59"
    precision="hour"
    date-format="HH:mm"
    :row-height="80"
    bar-start="beginDate"
    bar-end="endDate"
    grid
  >
    <template #upper-timeunit>
      <h1 />
    </template>
    <g-gantt-row
      v-for="(item, index) in context"
      :key="index"
      :bars="item"
      :label="item[0].label"
      highlight-on-hover
      :immobile="false"
      :hasHandles="false"
    >
      <template #bar-label="{ bar }">
        <o-tooltip :content="bar.ganttBarConfig.label">
          {{ bar.ganttBarConfig.label }}
        </o-tooltip>
      </template>
    </g-gantt-row>
  </g-gantt-chart>
</template>

<style lang="scss" scoped>
:deep(.g-timeaxis) {
  height: 40px;

  > .g-timeunits-container:first-child {
    display: none;
  }

  .g-timeunits-container {
    height: 100%;
  }
}

:deep(.g-gantt-row:last-child) {
  border-bottom: 2px solid #eaeaea;
}

:deep(.tooltip__text),
:deep(.el-tooltip__trigger),
:deep(.el-dropdown) {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  line-height: 100%;
  text-align: center;
}

:deep(.g-gantt-bar-label) {
  padding: 0;
}

:deep(.g-gantt-row-label) {
  height: 10%;
}
</style>
