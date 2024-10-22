<script setup lang="ts">
import { ref, getCurrentInstance, computed } from 'vue'
const { proxy } = getCurrentInstance()
import { saveTask } from '@/api/taskApi.ts'

const FREEZE = 'FREEZE'
const formRef = ref(null)
const isShow = ref(false)
const originForm = ref({
  KeepRawKey: false,
  rawKeyPrefix: 'BucketID',
  packageSizeThreshold: 1073741824,
  singleSizeRange: [104857600, 1073741824],
  fragmentSizeThreshold: 524288000,
  workerCount: 2,
  action: FREEZE,
  threadOfTransmission: 3,
  InjectSelftMeta: false,
  directTransmission: true,
  VerifyFreezeContent: true,
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
  if (!form.value.KeepRawKey) {
    await proxy.confirm('', {
      dangerouslyUseHTMLString: true,
      message:
        '<div class="">对于光存储开启保持原始对象名称后，对象将作为独立文件在光存储介质直接存储。</div><div class="cl-red">注意：当桶内文件大小普遍较小（<100MB）或过大（>5GB）时不推荐打开此功能！您确定开启此功能吗</div>',
      appendTo: '#highSettingsForm',
    })
    return true
  } else {
    return true
  }
}

const confirm = async () => {
  await proxy.validForm(formRef)
  console.log(`13 form.value.singleSizeRange`, form.value.singleSizeRange)
  proxy.log(`form.value`, form.value, '/cyrd/oeos-front-tenant-new/src/views/task/components/highSettings.vue')
  if (form.value.singleSizeRange[0] >= form.value.singleSizeRange[1]) {
    return proxy.$toast('独立存储区间第一个值要小于第二个值')
  }
  isShow.value = false
  emits('save', form.value)
}

defineExpose({
  open,
})
</script>

<template>
  <o-dialog ref="dialogRef" v-model="isShow" title="高级配置[数据冷冻配置]" confirmText="保存" @confirm="confirm">
    <el-form id="highSettingsForm" ref="formRef" :model="form" :rules="rules" label-width="auto">
      <el-form-item label="保持原始对象" prop="">
        <el-switch v-model="form.KeepRawKey" :before-change="beforeChange" />
        <o-icon
          class="ml"
          name="warning"
          color="#DCDEE0"
          content="对于光存储开启保持原始对象名称后，对象将作为独立文件在光存储介质直接存储。
注意：当桶内文件大小普遍较小（<100MB）或过大（>5GB）时不推荐打开此功能！"
        />
      </el-form-item>

      <el-form-item label="对象名前缀" prop="">
        <o-radio v-model="form.rawKeyPrefix" :options="prefixOptions" :disabled="!form.KeepRawKey" />
        <o-icon
          class="ml"
          color="#DCDEE0"
          name="warning"
          content="在原始对象名前添加前缀（父目录）可防止多个桶内出现重名文件情况下的冷冻失败"
        />
      </el-form-item>
      <el-form-item label="聚合存储上限" prop="packageSizeThreshold">
        <gBtoMb
          v-model="form.packageSizeThreshold"
          :disabled="form.KeepRawKey"
          content="对于小于[单个打包范围最小大小]的文件其内容将合并物理存储；此值标定包体体积上限；建议1G~2G"
        />
      </el-form-item>
      <el-form-item label="独立存储区间" prop="singleSizeRange">
        <div class="f-st-ct w-93%">
          <gBtoMb v-model="form.singleSizeRange[0]" :disabled="form.KeepRawKey" class="mr" />
          <gBtoMb
            v-model="form.singleSizeRange[1]"
            :disabled="form.KeepRawKey"
            content="介于此大小范围的文件将独立冷冻存储不进行合并或分片处理"
          />
        </div>
      </el-form-item>

      <el-form-item label="分片存储大小" prop="fragmentSizeThreshold">
        <gBtoMb
          v-model="form.fragmentSizeThreshold"
          :disabled="form.KeepRawKey"
          content="超过[独立存储]上限的文件数据将被分片存储；建议1G~5G"
        />
      </el-form-item>
      <el-form-item label="工作线程数量" prop="workerCount">
        <o-input v-model="form.workerCount" v-number :min="1" content="通过多线程提升处理性能" />
      </el-form-item>
      <el-form-item label="数据传输线程" prop="threadOfTransmission">
        <o-input
          v-model="form.threadOfTransmission"
          v-number
          :min="1"
          content="单个工作线程内的传输线程"
          :disabled="form.KeepRawKey"
        />
      </el-form-item>

      <el-form-item label="开启元数据注入" prop="InjectSelftMeta">
        <el-switch v-model="form.InjectSelftMeta" class="mr" :disabled="form.KeepRawKey" />
        <o-icon name="warning" color="#DCDEE0" content="此功能可通过冷冻后的数据独立恢复原始文件；但会降低冷冻性能。" />
      </el-form-item>
      <el-form-item label="开启数据传输加速" prop="directTransmission">
        <el-switch v-model="form.directTransmission" class="mr" />
        <o-icon name="warning" color="#DCDEE0" content="直接传输数据避免使用缓冲区" />
      </el-form-item>
      <el-form-item label="开启数据传输校验" prop="VerifyFreezeContent">
        <el-switch v-model="form.VerifyFreezeContent" class="mr" />
        <o-icon
          name="warning"
          color="#DCDEE0"
          content="当提交冷冻数据至存储系统时,校验提交内容正确性避免数据传输错误；会小幅影响性能。"
        />
      </el-form-item>
      <el-form-item label=" 开启自适应分片大小" prop="dynamicFragmentSize">
        <el-switch v-model="form.dynamicFragmentSize" :disabled="form.KeepRawKey" class="mr" />
        <o-icon name="warning" color="#DCDEE0" content="根据系统分片自动调整大小提升处理性能" />
      </el-form-item>
    </el-form>
  </o-dialog>
</template>
