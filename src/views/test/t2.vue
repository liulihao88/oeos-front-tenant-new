<script setup lang="ts">
import { ref, getCurrentInstance, onMounted } from 'vue'
const { proxy } = getCurrentInstance()
import * as echarts from 'echarts'

// [
//         { value: 40, name: 'rose 1' },
//         { value: 38, name: 'rose 2' },
//         { value: 32, name: 'rose 3' },
//         { value: 30, name: 'rose 4' },
//         { value: 28, name: 'rose 5' },
//         { value: 26, name: 'rose 6' },
//         { value: 22, name: 'rose 7' },
//         { value: 18, name: 'rose 8' },
//       ]
let obj = {
  '<1024B': 15,
  '1K-1MB': 10143,
  '1MB-10MB': 5966,
  '10MB-50MB': 0,
  '50MB-100MB': 0,
  '100MB-500MB': 0,
  '500MB-1GB': 0,
  '1GB-5GB': 0,
  '>5GB': 0,
}

const data = ref([])
data.value = Object.entries(obj).map(([name, value]) => {
  return { value: value, name: name }
})
proxy.log(`data`, data, '30行 test/t2.vue')
function formatter(item) {
  let res = `${item.name} \n ${item.value}`
  return res
}
const options = {
  title: {
    text: '桶( free-bk )对象数量统计',
    textStyle: {
      color: 'blue', // 更改标题颜色为红色
      fontSize: 16, // 更改标题字体大小为 20px
    },
  },
  legend: {
    orient: 'vertical',
    left: 'left',
  },
  toolbox: {
    show: true,
    feature: {
      mark: { show: true },
      dataView: { show: true, readOnly: false },
    },
  },
  series: [
    {
      name: 'Nightingale Chart',
      type: 'pie',
      radius: '50%',
      label: {
        formatter: formatter,
        textStyle: {
          fontSize: 12, // 更改标题字体大小为 20px
        },
      },
      itemStyle: {
        borderRadius: 8,
      },
      data: data.value,
    },
  ],
}
onMounted(() => {
  var myChart = proxy.$echarts.init(document.getElementById('main'))
  console.log(`38 myChart`, myChart)
  // 绘制图表
  myChart.setOption(options)
})
</script>

<template>
  <div>
    <div>test/t211113211111.vue</div>
    <div id="main" class="w-500 h-400" />
  </div>
</template>
