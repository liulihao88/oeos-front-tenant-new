<script setup lang="ts">
import { ref, getCurrentInstance, onMounted } from 'vue'
const { proxy } = getCurrentInstance()
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
// data.value = Object.entries(obj).map(([name, value]) => {
//   return { value: value, name: name }
// })
function formatter(params) {
  // let res = `${params.name} \n <span class="cl-blue">${params.value}</span>`
  // return res
  return '<span style="color: #ff0000;">' + params.value + '</span>'
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
    top: 'bottom',
    textStyle: {
      fontSize: 10, // 更改图例文本字体大小为 14px
    },
    left: 'center',
  },
  tooltip: {
    trigger: 'item',
    formatter: '{b}: {c}',
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
      name: '桶( free-bk )对象数量统计',
      type: 'pie',
      radius: '50%',
      label: {
        formatter: ' {b|{b}：}{c}  ',
        backgroundColor: '#F6F8FC',
        borderColor: '#8C8D8E',
        borderRadius: 4,
        textStyle: {
          fontSize: 12, // 更改标题字体大小为 20px
          color: '#e4393c',
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
      data: data.value,
    },
  ],
}
onMounted(() => {
  var myChart = proxy.$echarts.init(document.getElementById('main'))
  // 绘制图表
  myChart.setOption(options)
})
</script>

<template>
  <div>
    <div>test/321321.vue</div>
    <div id="main" class="w-500 h-400" />
  </div>
</template>
