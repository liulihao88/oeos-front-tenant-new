<script setup lang="ts">
import { ref, getCurrentInstance, nextTick } from 'vue'
const { proxy } = getCurrentInstance()

import GetBucketList from '@/hooks/getBucketList.ts'

const isShow = ref(false)
const formRef = ref(null)

const emits = defineEmits(['success'])

let getBucketList = GetBucketList()
getBucketList.getBucketList()

const handleExpression = (cForm) => {
  let nowAdvanceExpression = proxy.getStorage('tenant-advance-expression') ?? []
  let findIndex = nowAdvanceExpression.findIndex((v) => {
    return v.queryName === cForm.queryName
  })
  if (findIndex > -1) {
    nowAdvanceExpression.splice(findIndex, 1)
  }
  nowAdvanceExpression.push(cForm)
  let last20Expression = nowAdvanceExpression.slice(-20)
  proxy.setStorage('tenant-advance-expression', last20Expression)
}

const confirm = async () => {
  await proxy.validForm(formRef) // , { message: '维度(域名)必填' }
  if (proxy.isEmpty(form.value.matchFields)) {
    return proxy.$toast('请至少添加一个搜索条件', 'e')
  }
  const copyForm = proxy.clone(form)
  copyForm.matchFields = copyForm.matchFields.map((v, idx) => {
    let { name, operator, values } = v
    if (v.type === 'time') {
      if (proxy.notEmpty(values)) {
        values = new Date(values).getTime()
      }
    }
    if (v.isInput || v.name.startsWith('location')) {
      name = `userMetadata.${name}`
    }

    let arrayValues = [values]
    // 对 / 进行转义
    arrayValues = arrayValues.map((val) => {
      if (typeof val === 'string') {
        val = val.replace(/\//g, '\\/')
      }
      return val
    })
    return {
      id: idx + 1,
      name,
      operator,
      values: arrayValues,
    }
  })
  copyForm.buckets = proxy.clone(form.value.buckets)
  isShow.value = false
  handleExpression(copyForm)
  emits('success', copyForm)
}
const selectRef = ref(null)
const form = ref({
  matchFields: [],
  querySentence: '',
})

const devTest = async () => {
  if (proxy.$dev) {
    form.value = {
      matchFields: [
        {
          name: 'objectKey',
          operator: 'contains',
          type: 'string',
          values: '',
        },
      ],
      buckets: [getBucketList.bucketOptions[0].value],
      queryName: proxy.uuid('queryName'),
      querySentence: '',
    }
  }
}

const rules = {
  queryName: [proxy.validate()],
  buckets: [proxy.validate('请选择')],
}
const nameOptions = [
  { label: '对象键', value: 'objectKey' },
  { label: '对象名称', value: 'objectName' },
  { label: '对象大小', value: 'contentLength' },
  { label: '写入时间', value: 'injectTime' },
  {
    label: '存储类型',
    value: 'storageID',
  },
  {
    label: '所在库名',
    value: 'location.lib',
  },
  {
    label: '所在盘匣',
    value: 'location.box',
  },
  {
    label: '所在槽位',
    value: 'location.slot',
  },
]
const operatorOptions = [
  { label: '匹配', value: 'eq' },
  { label: '短语匹配', value: 'phe' },
  { label: '包含', value: 'contains' },
  { label: '大于', value: 'gt' },
  { label: '小于', value: 'lt' },
  { label: '大于等于', value: 'gte' },
  { label: '小于等于', value: 'lte' },
]
const typeOptions = [
  { label: '字符串', value: 'string' },
  { label: '数字', value: 'number' },
  { label: '日期', value: 'time' },
]
const deleteRow = (row, scope) => {
  form.value.matchFields.splice(scope.$index, 1)
}
const columns = [
  {
    label: '维度(域名)',
    useSlot: true,
    prop: 'name',
    width: 300,
  },
  {
    label: '关系',
    useSlot: true,
    prop: 'operator',
  },
  {
    label: '类型',
    useSlot: true,
    prop: 'type',
  },
  {
    label: '值',
    useSlot: true,
    prop: 'values',
  },
  {
    label: '操作',
    prop: 'operator',
    width: 80,
    btns: [
      {
        content: '删除',
        handler: deleteRow,
        comp: 'o-icon',
        attrs: {
          name: 'delete',
          content: '删除',
        },
      },
    ],
  },
]
const addNew = () => {
  const obj = {
    name: 'objectKey',
    operator: 'contains',
    type: 'string',
    values: '',
  }
  form.value.matchFields.push(obj)
}
function getInnerRules(i) {
  return [proxy.validate('维度(域名)必填')]
}
const changeType = (type, row, scope, event) => {
  if (type === 'time') {
    row.values = new Date()
  } else {
    row.values = ''
  }
}
const changeName = (idx, isInput) => {
  form.value.matchFields[idx].isInput = !isInput
  if (form.value.matchFields[idx].isInput) {
    form.value.matchFields[idx].name = ''
  } else {
    form.value.matchFields[idx].name = 'objectKey'
  }
  formRef.value.clearValidate(`matchFields.${idx}.name`)
}
const open = () => {
  isShow.value = true

  devTest()
}

defineExpose({
  open,
})
</script>

<template>
  <div>
    <o-dialog ref="dialogRef" v-model="isShow" title="搜索表达式配置" width="60%" @confirm="confirm">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="auto">
        <el-form-item label="搜索表达式配置名称" prop="queryName">
          <o-input v-model.trim="form.queryName" v-focus />
        </el-form-item>
        <el-form-item label="存储桶名称" prop="buckets">
          <o-select
            ref="selectRef"
            v-model="form.buckets"
            :options="getBucketList.bucketOptions"
            multiple
            label="name"
            width="100%"
          />
        </el-form-item>
        <el-form-item label="搜索表达式( 支持：AND，OR，NOT，（，） )" prop="querySentence">
          <o-input v-model="form.querySentence" type="textarea" placeholder="示例: (1 AND 2) OR (3 AND 4)" />
        </el-form-item>
        <o-title title="自定义搜索条件" t="16px" b="16px">
          <template #right>
            <el-button type="primary" icon="el-icon-plus" size="small" class="" @click="addNew">新增</el-button>
          </template>
        </o-title>
        <o-table
          ref="tableRef"
          :columns="columns"
          :data="form.matchFields"
          :showPage="false"
          width="100%"
          class="w-100% table-box"
        >
          <template #name="{ scope, row }">
            <template v-if="scope.$index !== -1">
              <el-form-item
                :prop="`matchFields.${scope.$index}.name`"
                :rules="getInnerRules(scope.$index, 'name')"
                label-width="0"
              >
                <div class="f-st-ct w-100%">
                  <o-tooltip
                    :content="form.matchFields[scope.$index].isInput ? '转换为下拉框模式' : '转换为自定义模式'"
                  >
                    <o-icon
                      :name="form.matchFields[scope.$index].isInput ? 'edit' : 'caret-bottom'"
                      class="w-40"
                      @click="changeName(scope.$index, form.matchFields[scope.$index].isInput)"
                    />
                  </o-tooltip>

                  <o-input
                    v-if="form.matchFields[scope.$index].isInput"
                    v-model.trim="form.matchFields[scope.$index].name"
                    width="90%"
                    class="f-1"
                  />
                  <o-select
                    v-else
                    v-model="form.matchFields[scope.$index].name"
                    :options="nameOptions"
                    :clearable="false"
                    width="90%"
                    class="f-1"
                  />
                </div>
              </el-form-item>
            </template>
          </template>
          <template #operator="{ scope, row }">
            <template v-if="scope.$index !== -1">
              <o-select
                v-model="form.matchFields[scope.$index].operator"
                :options="operatorOptions"
                :clearable="false"
                width="90%"
              />
            </template>
          </template>
          <template #type="{ scope, row }">
            <template v-if="scope.$index !== -1">
              <o-select
                v-model="form.matchFields[scope.$index].type"
                :options="typeOptions"
                width="90%"
                :clearable="false"
                @change="(event) => changeType(form.matchFields[scope.$index].type, row, scope, event)"
              />
            </template>
          </template>
          <template #values="{ scope, row }">
            <template v-if="scope.$index !== -1">
              <template v-if="form.matchFields[scope.$index].type === 'time'">
                <el-date-picker v-model="form.matchFields[scope.$index].values" type="datetime" style="width: 95%" />
              </template>
              <template v-else>
                <o-input v-model.trim="form.matchFields[scope.$index].values" width="90%" />
              </template>
            </template>
          </template>
        </o-table>
      </el-form>
    </o-dialog>
  </div>
</template>

<style lang="scss" scoped>
.table-box :deep(.el-form-item) {
  margin-bottom: 0;
}
</style>
