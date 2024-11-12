<script setup lang="ts">
import { ref, getCurrentInstance, h } from 'vue'
import axios from 'axios'
import useBucketSettings from '@/store/modules/bucketSettings.ts'
const bucketSettings = useBucketSettings()
import { ElNotification, ElProgress } from 'element-plus'
const { proxy } = getCurrentInstance()
const emits = defineEmits(['success'])
const props = defineProps({
  bucketName: {
    type: String,
    default: '',
  },
})
const timer = ref(null)
let currentNotification = {}

const updateNotification = (message, fileName) => {
  if (message.includes(100)) {
    currentNotification[fileName]?.close()
    currentNotification[fileName + 'time'] = ''
    return
  }
  if (currentNotification[fileName] && !currentNotification[fileName + 'time']) {
    // 如果通知已存在，则关闭它
    currentNotification[fileName]?.close()
  }

  if (!currentNotification[fileName + 'time']) {
    // 创建新的通知
    currentNotification[fileName] = ElNotification({
      dangerouslyUseHTMLString: true,
      message: `<div>${message}</div>`,
      duration: 0, // 设置为0，通知将不会自动关闭
    })

    currentNotification[fileName + 'time'] = 100
    setTimeout(() => {
      currentNotification[fileName + 'time'] = ''
    }, 2000)
  }
}

const onChange = (file, files) => {
  const formData = new FormData()
  formData.append('file', file.raw)
  formData.append('bucket', props.bucketName)
  formData.append('key', bucketSettings.prefixKey || '/')

  const fileName = file.name

  axios
    .put(import.meta.env.VITE_PROXY_API + '/v1/admin/tenant/object/upload', formData, {
      onUploadProgress: (progressEvent) => {
        const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        // 更新通知中的进度信息
        updateNotification(`${fileName} 正在上传, 进度${percentage}%`, fileName)
      },
      headers: {
        'Content-type': 'multipart/form-data',
        Authorization: proxy.getStorage('tenant-token'),
      },
    })
    .then((res) => {
      if (res.data.status === 200) {
        proxy.$toast(`${fileName} 上传成功`)
        if (timer.value) {
          clearTimeout(timer.value)
        }
        timer.value = setTimeout(() => {
          emits('success')
        }, 3000)
      } else {
        proxy.$toast(`${fileName} 上传失败: ${res.data.message}`, 'e')
      }
    })
    .catch(() => {
      proxy.$toast(`${fileName} 上传失败`, 'e')
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
    <slot />
  </g-upload>
</template>
