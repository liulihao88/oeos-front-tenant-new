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

const onChange = (file, files) => {
  const formData = new FormData()
  formData.append('file', file.raw)
  formData.append('bucket', props.bucketName)
  formData.append('key', bucketSettings.prefixKey || '/')

  let fileName = file.name

  proxy.$mitt.emit('file-change', {
    formData: formData,
    fileName: fileName,
    bucketName: props.bucketName,
    size: file.raw.size,
  })
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
