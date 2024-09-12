<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
import axios from 'axios'
import { ElNotification } from 'element-plus'
const { proxy } = getCurrentInstance()
const props = defineProps({
  bucketName: {
    type: String,
    default: '',
  },
})
const onChange = (file, files) => {
  const formData = new FormData()
  formData.append('file', file.raw)
  formData.append('bucket', props.bucketName)
  formData.append('key', '/')
  const fileName = file.name
  let notificationInstance = null
  axios
    .put('api/v1/admin/tenant/object/upload', formData, {
      onUploadProgress: (progressEvent) => {
        console.log(`47 progressEvent`, progressEvent)
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        console.log(`84 percentCompleted`, percentCompleted)
        // 可以在这里更新用户界面以显示上传进度
        let message = `${fileName}正在上传, 进度${percentCompleted}%`
        if (notificationInstance) {
          notificationInstance.close()
          notificationInstance = ''
        } else {
          notificationInstance = ElNotification({
            message: message,
            duration: 0, // 设置为0，通知将不会自动关闭
          })
        }
      },
      headers: {
        'Content-type': 'multipart/form-data',
        Authorization: proxy.getStorage('tenant-token'),
      },
    })
    .then((res) => {
      if (res.data.status !== 200) {
        let errorMsg = `${fileName}上传失败`
        if (res.data.message) {
          errorMsg += `, ${res.data.message}`
        }
        proxy.$toast(errorMsg, 'error')
        return
      } else {
        proxy.$toast(`${fileName}上传成功`, 'success')
      }
    })
    .finally(() => {
      notificationInstance.close()
      notificationInstance = ''
    })
}

async function _genNotify(errorText) {
  const notificationCount = document.querySelectorAll('.el-notification').length
  if (notificationCount === 0) {
    ElNotification({
      message: '关闭所有通知',
      duration: 0,
      type: 'info',
      onClose: _closeAllNotify,
    })
    await sleep(0)
  }
  ElNotification({
    message: errorText,
    type: 'error',
    duration: 0,
  })
  function _closeAllNotify() {
    const notifications = document.querySelectorAll('.el-notification')
    notifications.forEach((notification) => {
      notification.querySelector('.el-notification__closeBtn').click() // 模拟点击关闭按钮
    })
  }
}
const beforeUpload = (file) => {
  let size = file.size
  if (size / 1024 / 1024 > 1024 * 5) {
    return proxy.$toast('只能上传小于等于5GB大小的文件', 'e')
  }
}
</script>

<template>
  <g-upload class="m-r-10" multiple :onChange="onChange" :before-upload="beforeUpload">
    <el-button type="primary" icon="el-icon-upload" @click="upload">上传文件</el-button>
  </g-upload>
</template>
