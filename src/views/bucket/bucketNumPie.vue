<script setup lang="ts">
import { ref, getCurrentInstance, onMounted, watch } from 'vue'
const { proxy } = getCurrentInstance()
const props = defineProps({
  data: {
    type: Array,
    default: () => [],
  },
})
const options = ref()
const isEmpty = ref(false)

const initOptions = {
  title: {
    text: '',
    textStyle: {
      color: 'blue', // 更改标题颜色为红色
      fontSize: 16, // 更改标题字体大小为 20px
    },
  },
  legend: {
    top: 'bottom',
    textStyle: {
      fontSize: 10, // 更改图例文本字体大小为 14px
    },
    left: 'center',
  },
  tooltip: {
    trigger: 'item',
    formatter: formatter,
  },
  toolbox: {
    show: true,
    feature: {
      mark: { show: true },
    },
  },
  series: [
    {
      type: 'pie',
      radius: '50%',
      startAngle: 180,
      endAngle: 360,
      label: {
        formatter: formatter,
        backgroundColor: '#F6F8FC',
        borderColor: '#8C8D8E',
        borderRadius: 4,
        textStyle: {
          fontSize: 12, // 更改标题字体大小为 20px
          color: '#e4393c',
          // color: 'yellow',
        },
        rich: {
          a: {
            color: '#6E7079',
            lineHeight: 22,
            fontSize: 10,
            align: 'center',
          },
          hr: {
            borderColor: '#8C8D8E',
            width: '100%',
            borderWidth: 1,
            height: 0,
          },
          b: {
            color: '#4C5058',
            fontSize: 12,
            fontWeight: 'bold',
            lineHeight: 33,
          },
        },
      },
      itemStyle: {
        borderRadius: 8,
      },
      data: props.data,
    },
  ],
}

watch(
  () => props.data,
  (val) => {
    isEmpty.value = val.every((v) => {
      return !v.value
    })
    initOptions.series[0].data = val
    options.value = proxy.clone(initOptions)
  },
  {
    deep: true,
    immediate: true,
  },
)
function formatter(params) {
  let res = `${params.name} \n <span class="cl-blue">${params.value}</span>`
  let { value, name } = params.data
  return `${name}: ${value}\n 占比: (${params.percent}%)`
}
</script>

<template>
  <template v-if="isEmpty">
    <o-empty class="h-100%" />
  </template>
  <template v-else>
    <v-chart class="calc-height" :option="options" autoresize />
  </template>
</template>

<style lang="scss" scoped>
.calc-height {
  height: calc(100% - 30px);
}
</style>
