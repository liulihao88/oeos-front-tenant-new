<template>
  <div>
    <b-button
      v-if="currentValue_V.length <= 0 || currentValue_V === '请选择桶名称'"
      variant="outline-primary"
      class="custom-button file-common-btn"
      @click="clickFn"
    >
      <div class="f">
        <UploadOutlined />
        <span class="align-middle">上传文件</span>
      </div>
    </b-button>
    <a-upload
      v-else
      v-model:file-list="fileList"
      name="file"
      multiple
      :showUploadList="false"
      :headers="headers"
      :customRequest="customUpload"
    >
      <b-button variant="outline-primary" class="custom-button file-common-btn">
        <div class="f">
          <UploadOutlined />
          <span class="align-middle">上传文件</span>
        </div>
      </b-button>
    </a-upload>
  </div>
</template>

<script>
import axios from 'axios'
export default {
  props: ['params', 'currentValue'],
  data() {
    return {
      fileList: null,
      headers: null,
      currentValue_V: '',
    }
  },
  watch: {
    currentValue: {
      handler(newVal, oldVal) {
        this.currentValue_V = newVal ? newVal.text : ''
      },
      deep: true, // 是否深度监听
      immediate: true, // 是否在组件创建时立即执行回调函数
    },
  },
  methods: {
    setValue(val) {
      this.currentValue_V = val
    },
    clickFn() {
      this.$toast('请选择需要上传文件的桶', 'warn')
    },
    customUpload(info) {
      const formData = new FormData()
      const bucket = this.currentValue_V ? this.currentValue_V : this.$route.query['param']
      if (bucket === undefined || bucket === '请选择桶名称' || bucket === null) {
        return this.$toast('请选择需要上传文件的桶', 'warn')
      }
      let size = info.file.size
      if (size / 1024 / 1024 > 1024 * 5) {
        return this.$toast('只能上传小于等于5GB大小的文件', 'warn')
      }
      this.backFn(formData, info, bucket)
    },
    backFn(formData, info, bucket) {
      formData.append('file', info.file)
      formData.append('bucket', bucket)
      formData.append('key', window.route === undefined ? '/' : window.route)
      const accessToken = localStorage.getItem('oeos_tenant_token')
      const tokenType = localStorage.getItem('oeos_tenant_tokenType')
      const Authorization = `${tokenType} ${accessToken}`

      let fileName = info.file.name
      axios
        .put('/v1/admin/tenant/object/upload', formData, {
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            // 可以在这里更新用户界面以显示上传进度
            this.$notification.open({
              message: `${fileName}正在上传, 进度${percentCompleted}%`,
              key: fileName,
              duration: null,
            })
          },
          headers: {
            'Content-type': 'multipart/form-data',
            Authorization: Authorization,
          },
        })
        .then((res) => {
          if (res.data.status !== 200) {
            let errorMsg = `${fileName}上传失败`
            if (res.data.message) {
              errorMsg += `, ${res.data.message}`
            }
            this.$toast(errorMsg, 'error')
            return
          } else {
            this.$toast(`${fileName}上传成功`, 'success')
            this.$emit('updateData')
          }
        })
        .finally(() => {
          this.$notification.close(fileName)
        })
    },
  },
}
</script>
