<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance()

const fileRef = ref(null)
const data = ref([])
const columns = [
  {
    label: '名字',
    prop: 'name',
  },
  {
    label: '上传进度',
    prop: 'permission',
  },
  {
    key: 'operation',
    label: '操作',
    btns: [
      {
        content: '编辑',
      },
    ],
  },
]

// setInterval(() => {
//   let obj = fileRef.value?.fileObj ?? {}
//   data.value = Object.keys(obj).map((key) => {
//     return {
//       name: key,
//       permission: obj[key].message,
//     }
//   })
// }, 1000)
</script>

<template>
  <div>
    <g-upload-file-dialog ref="fileRef" bucketName="bucket1">
      <el-button type="primary" icon="el-icon-upload">上传文件</el-button>
    </g-upload-file-dialog>
  </div>
</template>
