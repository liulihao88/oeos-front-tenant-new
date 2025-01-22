<script setup lang="ts">
import { ref, getCurrentInstance, computed, h } from 'vue'
const { proxy } = getCurrentInstance()
import { saveTask } from '@/api/taskApi.ts'
import GWarning from '@/autoComponents/gWarning.vue'

const props = defineProps({
  isView: {
    type: Boolean,
  },
})

const formRef = ref(null)
const isShow = ref(false)
const originForm = ref({
  keepRawKey: false,
  rawKeyPrefix: 'BucketID',
  packageSizeThreshold: 1073741824,
  singleSizeRange: [104857600, 1073741824],
  fragmentSizeThreshold: 1073741824,
  workerCount: 2,
  threadOfTransmission: 3,
  injectSelftMeta: false,
  directTransmission: true,
  verifyFreezeContent: true,
  dynamicFragmentSize: true,
})
const emits = defineEmits(['save'])
const form = ref({})
const rules = {
  packageSizeThreshold: [proxy.validate()],
  singleSizeRange: [proxy.validate()],
  fragmentSizeThreshold: [proxy.validate()],
  workerCount: [proxy.validate()],
  threadOfTransmission: [proxy.validate()],
}
const open = (row = '') => {
  if (proxy.isEmpty(row)) {
    form.value = proxy.clone(originForm)
  } else {
    form.value = proxy.clone(row)
  }
  isShow.value = true
}
const prefixOptions = [
  { label: '桶ID', value: 'BucketID' },
  { label: '桶名称', value: 'BucketName' },
  { label: '无前缀', value: 'None' },
]

const devTest = () => {
  open()
}

const beforeChange = async () => {
  if (!form.value.keepRawKey) {
    await proxy.confirm('', {
      dangerouslyUseHTMLString: true,
      customStyle: {
        maxWidth: '600px',
      },
      message: h(GWarning, {
        content:
          '对于光存储开启保持原始对象名称后，对象将作为独立文件在光存储介质直接存储。<br>注意：当桶内文件大小普遍较小（<100MB）或过大（>5GB）时不推荐打开此功能！您确定开启此功能吗?',
      }),
      showCancelButton: true,
      appendTo: '#highSettingsForm',
      cancelButtonText: '取消',
    })
    return true
  } else {
    return true
  }
}

const confirm = async () => {
  if (props.isView === true) {
    return (isShow.value = false)
  }
  await proxy.validForm(formRef)
  if (form.value.singleSizeRange[0] >= form.value.singleSizeRange[1]) {
    return proxy.$toast('独立存储区间第一个值要小于第二个值', 'e')
  }
  isShow.value = false
  emits('save', form.value)
}

defineExpose({
  open,
  originForm,
  isShow,
})
</script>

<template>
  <o-dialog
    ref="dialogRef"
    v-model="isShow"
    title="高级配置[数据冷冻配置]"
    confirmText="保存"
    width="1040"
    @confirm="confirm"
  >
    <el-form
      id="highSettingsForm"
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="auto"
      :disabled="props.isView"
    >
      <el-form-item label="保持原始对象" prop="">
        <div class="f-st-tp">
          <el-switch v-model="form.keepRawKey" :before-change="beforeChange" />
          <g-warning
            type="icon"
            class="t--2 po-r"
            content="对于光存储开启保持原始对象名称后，对象将作为独立文件在光存储介质直接存储。<br>
            注意：当桶内文件大小普遍较小（<100MB）或过大（>5GB）时不推荐打开此功能！"
          />
        </div>
      </el-form-item>

      <el-form-item label="对象名前缀" prop="">
        <o-radio v-model="form.rawKeyPrefix" :options="prefixOptions" :disabled="!form.keepRawKey" />
        <g-warning type="icon" content="在原始对象名前添加前缀（父目录）可防止多个桶内出现重名文件情况下的冷冻失败" />
      </el-form-item>
      <el-form-item label="聚合存储上限" prop="packageSizeThreshold">
        <gBtoMb v-model="form.packageSizeThreshold" :disabled="form.keepRawKey" />
        <g-warning
          type="icon"
          content="对于小于[单个打包范围最小大小]的文件其内容将合并物理存储；此值标定包体体积上限；建议1G~2G"
        />
      </el-form-item>
      <el-form-item label="独立存储区间" prop="singleSizeRange">
        <div class="f-st-ct w-93%">
          <gBtoMb v-model="form.singleSizeRange[0]" :disabled="form.keepRawKey" />
          <div class="mlr">-</div>
          <gBtoMb v-model="form.singleSizeRange[1]" :disabled="form.keepRawKey" />
          <div class="">
            <g-warning type="icon" content="介于此大小范围的文件将独立冷冻存储不进行合并或分片处理" />
          </div>
        </div>
      </el-form-item>

      <el-form-item label="分片存储大小" prop="fragmentSizeThreshold">
        <gBtoMb v-model="form.fragmentSizeThreshold" :disabled="form.keepRawKey" />
        <div class="">
          <g-warning type="icon" content="超过[独立存储]上限的文件数据将被分片存储；建议1G~5G" />
        </div>
      </el-form-item>
      <el-form-item label="工作线程数量" prop="workerCount">
        <o-radio v-model="form.workerCount" :options="[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]" type="simple" />
        <div>
          <g-warning type="icon" content="通过多线程提升处理性能" class="" />
        </div>
      </el-form-item>
      <el-form-item label="数据传输线程" prop="threadOfTransmission">
        <o-radio
          v-model="form.threadOfTransmission"
          :options="[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]"
          type="simple"
          :disabled="form.keepRawKey"
        />
        <div>
          <g-warning type="icon" content="单个工作线程内的传输线程" class="" />
        </div>
      </el-form-item>

      <el-form-item label="开启元数据注入" prop="injectSelftMeta">
        <el-switch v-model="form.injectSelftMeta" :disabled="form.keepRawKey" />
        <div>
          <g-warning type="icon" content="此功能可通过冷冻后的数据独立恢复原始文件；但会降低冷冻性能。" />
        </div>
      </el-form-item>
      <el-form-item label="开启数据传输加速" prop="directTransmission">
        <el-switch v-model="form.directTransmission" />
        <div>
          <g-warning type="icon" content="直接传输数据避免使用缓冲区" />
        </div>
      </el-form-item>
      <el-form-item label="开启数据传输校验" prop="verifyFreezeContent">
        <el-switch v-model="form.verifyFreezeContent" />
        <div>
          <g-warning
            type="icon"
            content="当提交冷冻数据至存储系统时,校验提交内容正确性避免数据传输错误；会小幅影响性能。"
          />
        </div>
      </el-form-item>
      <el-form-item label=" 开启自适应分片大小" prop="dynamicFragmentSize">
        <el-switch v-model="form.dynamicFragmentSize" :disabled="form.keepRawKey" />
        <div class="">
          <g-warning type="icon" content="根据系统分片自动调整大小提升处理性能" />
        </div>
      </el-form-item>
    </el-form>
  </o-dialog>
</template>

<style lang="scss" scoped>
#highSettingsForm .icon-box {
  // padding-top: 4px;
  // padding-bottom: 4px;
}
</style>
