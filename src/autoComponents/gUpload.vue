<script setup lang="ts">
import { ref, watch, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance()

// async function onChange(file) {
//   let fileId = file.name.replace('.task', '')
//   let hasId = props.tableData?.some((v) => v.id === fileId)
//   hasId && (await proxy.confirm(`确定要覆盖${fileId}吗?`))
//   const formData = new FormData()
//   formData.append('file', file.raw)
//   let res = await proxy.request({
//     url: '/task/public/import',
//     method: 'post',
//     data: formData,
//     headers: {
//       'Content-Type': 'multipart/form-data', // 虽然 Axios 会自动设置，但显式设置可以避免一些兼容性问题
//     },
//   })
//   emits('success')
// }
</script>

<template>
  <el-upload class="upload-demo d-ib" action="#" v-bind="$attrs" :auto-upload="false" :show-file-list="false">
    <template #trigger>
      <slot />
    </template>
  </el-upload>
</template>
