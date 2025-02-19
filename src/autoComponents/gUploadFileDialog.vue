<script setup lang="ts">
import { ref, getCurrentInstance, h, unref, computed } from 'vue'
import axios from 'axios'
import useBucketSettings from '@/store/modules/bucketSettings.ts'
const bucketSettings = useBucketSettings()
const { proxy } = getCurrentInstance()

const emits = defineEmits(['success'])

const props = defineProps({
  bucketName: {
    type: String,
    default: '',
  },
})

let fileList = ref({})
let cancelFileList = ref({})
fileList.value = proxy.getStorage('tenant-file-list') || {}
if (proxy.notEmpty(fileList.value)) {
  proxy.$mitt.emit('upload-file', { fileList: unref(fileList.value) })
}

const mergeFileList = computed(() => {
  let merged = proxy.clone(fileList.value)
  Object.keys(merged).forEach((key) => {
    merged[key] = {
      ...fileList.value[key],
      cancelFileList: cancelFileList.value[key],
    }
  })
  return merged
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

  const CancelToken = axios.CancelToken

  axios
    .put(import.meta.env.VITE_PROXY_API + '/v1/admin/tenant/object/upload', formData, {
      onUploadProgress: (progressEvent) => {
        const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        // 更新通知中的进度信息
        updateNotification(fileName, percentage)
        proxy.$mitt.emit('upload-file', { fileList: unref(mergeFileList.value), fileName })
      },
      headers: {
        'Content-type': 'multipart/form-data',
        Authorization: proxy.getStorage('tenant-token'),
      },
      cancelToken: new CancelToken(function executor(c) {
        cancelFileList.value[fileName] = {}
        cancelFileList.value[fileName].cancelToken = c
      }),
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
      console.log(`49 mergeFileList.value`, mergeFileList.value)
      proxy.setStorage('tenant-file-list', mergeFileList.value)
    })
    .catch(() => {
      fileList.value[fileName] = {
        message: `上传失败`,
        status: 'error',
        file: fileName,
      }
      proxy.setStorage('tenant-file-list', mergeFileList.value)
      proxy.$toast(`${fileName}上传失败`, 'e')
    })
    .finally(() => {
      proxy.$mitt.emit('upload-file', { fileList: unref(mergeFileList.value), fileName })
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
