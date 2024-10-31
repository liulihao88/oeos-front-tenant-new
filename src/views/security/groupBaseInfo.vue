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
        <o-input v-model="form.groupname" />
      </el-form-item>
      <el-form-item label="描述" prop="description">
        <o-input v-model="form.description" />
      </el-form-item>
      <el-form-item label="所属角色" prop="roles">
        <o-checkbox v-model="form.roles" :options="proxy.ROLE_OPTIONS" />
      </el-form-item>
    </el-form>
  </div>
</template>
