<script setup lang="ts">
import { ref, getCurrentInstance, h, unref } from 'vue'
import axios from 'axios'
import useBucketSettings from '@/store/modules/bucketSettings.ts'
const bucketSettings = useBucketSettings()
const { proxy } = getCurrentInstance()
const emits = defineEmits(['success'])
let fileList = ref({})
const props = defineProps({
  bucketName: {
    type: String,
    default: '',
  },
})

const updateNotification = (fileName, percentage) => {
  if (percentage === 100) {
    fileList.value[fileName] = {
      message: '上传完成',
      status: 'done',
      file: fileName,
    }
    return
  }

  fileList.value[fileName] = {
    message: percentage,
    status: 'pending',
    file: fileName,
  }
}

const onChange = (file, files) => {
  const formData = new FormData()
  formData.append('file', file.raw)
  formData.append('bucket', props.bucketName)
  formData.append('key', bucketSettings.prefixKey || '/')

  let fileName = file.name

  axios
    .put(import.meta.env.VITE_PROXY_API + '/v1/admin/tenant/object/upload', formData, {
      onUploadProgress: (progressEvent) => {
        const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        // 更新通知中的进度信息
        updateNotification(fileName, percentage)
        proxy.$mitt.emit('upload-file', { fileList: unref(fileList.value), fileName })
      },
      headers: {
        'Content-type': 'multipart/form-data',
        Authorization: proxy.getStorage('tenant-token'),
      },
    })
    .then((res) => {
      if (res.data.status === 200) {
        fileList.value[fileName] = {
          message: '上传完成',
          status: 'done',
          file: fileName,
        }
        proxy.$toast(`${fileName}上传完成`)
      } else {
        fileList.value[fileName] = {
          message: `上传失败, ${res.data.message}`,
          status: 'error',
          file: fileName,
        }
        proxy.$toast(`${fileName}上传失败, ${res.data.message}`, 'e')
      }
    })
    .catch(() => {
      fileList.value[fileName] = {
        message: `上传失败`,
        status: 'error',
        file: fileName,
      }
      proxy.$toast(`${fileName}上传失败`, 'e')
    })
    .finally(() => {
      proxy.$mitt.emit('upload-file', { fileList: unref(fileList.value), fileName })
    })
}

const beforeUpload = (file) => {
  let size = file.size
  if (size / 1024 / 1024 > 1024 * 5) {
    return proxy.$toast('只能上传小于等于5GB大小的文件', 'e')
  }
}

defineExpose({
  fileList,
})
</script>

<template>
  <g-upload class="m-r-10" multiple :onChange="onChange" :before-upload="beforeUpload">
    <slot />
  </g-upload>
</template>
