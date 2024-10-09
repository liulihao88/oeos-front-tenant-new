<template>
  <div v-for="(item, index) in timeList" :key="index">
    1111111111
    <el-time-picker v-model="item.time" format="HH:mm:ss" is-range value-format="HH:mm:ss" placeholder="选择时间" />
  </div>
</template>

<script>
export default {
  data() {
    return {
      timeList: [
        { time: ['08:00:00', '09:00:01'] },
        { time: ['08:00:00', '09:00:02'] },
        // 更多时间对象...
      ],
    }
  },
}
</script>
