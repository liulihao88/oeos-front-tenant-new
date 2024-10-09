<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
import SearchConfigComp from '@/views/spaceScan/components/searchConfigComp.vue'

const { proxy } = getCurrentInstance()
const searchConfigCompRef = ref(null)

const open = () => {
  console.log('open')
  searchConfigCompRef.value.open()
}
</script>

<template>
  <div>
    <div
      v-tippy="{
        content: '点击展开',
        hideOnClick: 'toggle',
        placement: 'right',
      }"
    >
      test/t1.vue
    </div>
    <el-button type="primary" @click="open">测11试06</el-button>
    <SearchConfigComp ref="searchConfigCompRef" />
  </div>
</template>
