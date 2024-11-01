<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance()
const formRef = ref(null)
const props = defineProps({
  isEdit: {
    type: Boolean,
    default: false,
  },
})
const form = ref({
  status: 'on',
})
const originForm = ref(proxy.clone(form))

const roleInfos = `
  <div>
    <span class="mr cl-green">系统管理员: </span>
    <span>负责系统配置、系统维护等权限</span>
  </div>
  <div>
    <span class="mr cl-green">安全管理员: </span>
    <span>负责对用户、组设置桶权限</span>
  </div>
  <div>
    <span class="mr cl-green">监控管理员: </span>
    <span>仅限于系统监控</span>
  </div>
  <div>
    <span class="mr cl-green">数据管理员: </span>
    <span>仅限于数据管理</span>
  </div>
`

const open = (row) => {
  if (!props.isEdit) {
    if (proxy.$dev) {
      form.value = {
        status: 'on',
        groupname: proxy.uuid('andy'),
        description: proxy.uuid('description'),
      }
    } else {
      form.value = proxy.clone(originForm)
    }
  } else {
    form.value = proxy.clone(row)
    form.value.groupname = form.value.name
  }
}

const rules = {
  groupname: [proxy.validate('')],
}

defineExpose({
  form,
  open,
})
</script>

<template>
  <div>
    <g-title title="基本信息" />
    <el-form ref="formRef" :model="form" :rules="rules" label-width="auto">
      <el-form-item label="组名" prop="groupname">
        <o-input v-model="form.groupname" v-focus :disabled="isEdit" />
      </el-form-item>
      <el-form-item label="描述" prop="description">
        <o-input v-model="form.description" />
      </el-form-item>
      <el-form-item label="所属角色" prop="roles">
        <div class="f-st-ct w-100%">
          <div style="flex-wrap: nowrap">
            <o-checkbox v-model="form.roles" :options="proxy.ROLE_OPTIONS" />
          </div>
          <o-icon name="warning" raw-content :content="roleInfos" class="ml2" />
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>
