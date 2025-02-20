<script setup lang="ts">
import { ref, getCurrentInstance, h, unref, computed } from 'vue'
import axios from 'axios'
const { proxy } = getCurrentInstance()

const emits = defineEmits(['success'])

const props = defineProps({
  bucketName: {
    type: String,
    default: '',
  },
})
let fileList = ref({})

proxy.$mitt.on('file-change', (fileObj) => {
  onChange(fileObj)
})
proxy.$mitt.on('delete-files', (deleteFileNames) => {
  Object.keys(fileList.value).forEach((v) => {
    if (deleteFileNames.includes(v)) {
      delete fileList.value[v]
    }
  })

  proxy.setStorage('tenant-file-list', mergeFileList.value)
  proxy.$mitt.emit('upload-file', { fileList: unref(mergeFileList.value) })
})

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

const updateNotification = (fileName, percentage, emitObj) => {
  if (percentage === 100) {
    fileList.value[fileName] = {
      message: '上传完成',
      status: 'done',
      file: fileName,
      details: emitObj,
    }
    return
  }

  fileList.value[fileName] = {
    message: percentage,
    status: 'pending',
    file: fileName,
    details: emitObj,
  }
}

function onChange(emitObj) {
  const { fileName, formData } = emitObj
  const CancelToken = axios.CancelToken
  axios
    .put(import.meta.env.VITE_PROXY_API + '/v1/admin/tenant/object/upload', formData, {
      onUploadProgress: (progressEvent) => {
        const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        // 更新通知中的进度信息
        updateNotification(fileName, percentage, emitObj)
        proxy.setStorage('tenant-file-list', mergeFileList.value)
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
          details: emitObj,
        }
        proxy.$toast(`${fileName}上传完成`)
      } else {
        fileList.value[fileName] = {
          message: `上传失败, ${res.data.message}`,
          status: 'error',
          file: fileName,
          details: emitObj,
        }
        proxy.$toast(`${fileName}上传失败, ${res.data.message}`, 'e')
      }
      proxy.setStorage('tenant-file-list', mergeFileList.value)
    })
    .catch(() => {
      fileList.value[fileName] = {
        message: `上传失败`,
        status: 'error',
        file: fileName,
        details: emitObj,
      }
      proxy.setStorage('tenant-file-list', mergeFileList.value)
      proxy.$toast(`${fileName}上传失败`, 'e')
    })
    .finally(() => {
      proxy.$mitt.emit('upload-file', { fileList: unref(mergeFileList.value), fileName })
    })
}

defineExpose({
  fileList,
})
</script>
