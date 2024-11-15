<script setup lang="ts">
import { ref, getCurrentInstance, onMounted, watch, computed } from 'vue'
const { proxy } = getCurrentInstance()
const props = defineProps({
  used: {
    type: String,
    // default: '17.50GB',
  },
  total: {
    type: String,
    required: true,
    // default: '1.0TB',
  },
  type: {
    type: String, // used
  },
})
const options = ref()

const seriesData = ref([])
const usedNum = ref(0)
const totalNum = ref(0)

const getValue = computed(() => {
  if (props.type === 'used') {
    let percent = ((usedNum.value / totalNum.value) * 100).toFixed(2) + '%'
    let num = `${proxy.formatBytes(props.used)} / ${proxy.formatBytes(props.total)}`
    let text = '总使用量 / 总可用量'
    return `${percent}\n\n${num}\n\n${text}`
  } else {
    let percent = ((usedNum.value / totalNum.value) * 100).toFixed(2) + '%'
    let num = `${props.used} / ${props.total}`
    let text = '总分配配额 / 租户总配额'
    return `${percent}\n\n${num}\n\n${text}`
  }
})

let initOptions = {
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
    show: false,
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
      radius: ['70%', '90%'], // 设置饼图的内外半径，内容显示在内部
      center: ['50%', '50%'], // 设置饼图的中心位置
      label: {
        backgroundColor: '#F6F8FC',
        borderColor: '#8C8D8E',
        position: 'inner', // 标签显示在扇形内部
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
      data: [],
    },
  ],
  graphic: {
    type: 'text',
    left: 'center',
    top: 'center',
    style: {
      text: getValue, // 自定义文本内容
      textAlign: 'center',
      fill: '#000', // 文字颜色
      fontSize: 12,
      fontWeight: 'bold', // 文字加粗
    },
  },
  // graphic: {
  //   type: 'html',
  //   left: 'center',
  //   top: 'center',
  //   style: {
  //     htmlContent: `<div style="color: #fff; font-size: 20px;">自定义 HTML 内容</div>`,
  //     width: 200,
  //     height: 100,
  //   },
  // },
}

watch(
  () => [props.used, props.total],
  ([usedNew, totalNew]) => {
    if (usedNew && totalNew) {
      usedNum.value = proxy.formatBytesConvert(usedNew)
      totalNum.value = proxy.formatBytesConvert(totalNew)
      console.log(`11  totalNum.value`, totalNum.value)
      initOptions.series[0].data = [usedNum.value, totalNum.value - usedNum.value]
      options.value = proxy.clone(initOptions)
    }
  },
  {
    deep: true,
    immediate: true,
  },
)
</script>

<template>
  <v-chart class="calc-height" :option="options" autoresize />
</template>

<style lang="scss" scoped>
.calc-height {
  height: calc(100% - 30px);
}
</style>
