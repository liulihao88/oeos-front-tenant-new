<script setup lang="ts">
import { getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance()
const init = async () => {
  const params = {
    bucket: 'bucket0',
    // pageSize=30&pageNumber=1
  }
  let res = await proxy.request('http://localhost:8848/proxyApi/v1/admin/tenant/bucket/summary', { params: params })
}
init()
</script>

<template>
  <div />
</template>
