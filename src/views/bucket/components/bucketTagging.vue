<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance()
import { getTagging, saveTagging } from '@/api/bucket.ts'

const props = defineProps({
  bucketName: {
    type: String,
    required: true,
  },
})

const data = ref([])
const formRef = ref(null)
const form = ref({
  data: [],
})
const selections = ref([])
const selectionsIndex = ref([])
const deleteRow = (row, scope) => {
  form.value.data.splice(scope.$index, 1)
}
const columns = [
  {
    type: 'selection',
  },
  {
    label: '标签名',
    prop: 'label',
    useSlot: true,
  },
  {
    label: '标签值',
    prop: 'value',
    useSlot: true,
  },
  {
    key: 'operation',
    label: '操作',
    btns: [
      {
        content: '删除',
        handler: deleteRow,
      },
    ],
  },
]

const init = async () => {
  let res = await getTagging(props.bucketName)
  Object.entries(res).map(([key, value]) => {
    form.value.data.push({
      label: key,
      value,
    })
  })
}
init()

const deleteSelection = () => {
  const copyFormData = proxy.clone(form.value.data)
  form.value.data = copyFormData.filter((item, index) => !selectionsIndex.value.includes(index))
}
const add = () => {
  form.value.data.push({
    label: '',
    value: '',
  })
}
const save = async () => {
  await proxy.validForm(formRef)
  const sendObject = form.value.data.reduce((accumulator, current) => {
    accumulator[current.label] = current.value
    return accumulator
  }, {})
  await saveTagging(props.bucketName, sendObject)
  proxy.$toast('保存成功')
}

const getInnerRules = (index) => {
  let labelArr = []
  for (let i = 0; i < form.value.data.length; i++) {
    labelArr.push(form.value.data[i].label)
  }
  labelArr.splice(index, 1)

  for (let i = 0; i < form.value.data.length; i++) {
    if (labelArr.includes(form.value.data[index].label) && form.value.data[index].label) {
      return [
        {
          trigger: ['blur', 'change'],
          validator: (rule, value, callback) => {
            if (value === form.value.data[index].label) {
              return callback(new Error('标签名不能重复'))
            } else {
              callback()
            }
          },
        },
      ]
    }
  }
  return [proxy.validate('必填')]
}
const valueRules = [proxy.validate('必填')]
const selectionChange = (val, ...a) => {
  selections.value = val
  selectionsIndex.value = selections.value.map((item) => form.value.data.indexOf(item))
}
</script>

<template>
  <div>
    <o-title title="标签" />
    <div class="mb">
      <el-button-group size="small">
        <el-button type="primary" @click="add">添加</el-button>
        <el-button type="primary" @click="save">保存</el-button>
        <el-button type="primary" :disabled="selections.length === 0" @click="deleteSelection">删除选中</el-button>
      </el-button-group>
    </div>
    <el-form ref="formRef" :model="form" size="small">
      <o-table
        ref="tableRef"
        size="small"
        :columns="columns"
        :data="form.data"
        :showPage="false"
        :pageSize="50"
        @selection-change="selectionChange"
      >
        <template #label="{ scope, row }">
          <template v-if="scope.$index !== -1">
            <el-form-item label="" :prop="`data.${scope.$index}.label`" :rules="getInnerRules(scope.$index)">
              <o-input v-model="form.data[scope.$index].label" />
            </el-form-item>
          </template>
        </template>
        <template #value="{ scope, row }">
          <template v-if="scope.$index !== -1">
            <el-form-item label="" :prop="`data.${scope.$index}.value`" :rules="valueRules">
              <o-input v-model="form.data[scope.$index].value" />
            </el-form-item>
          </template>
        </template>
      </o-table>
    </el-form>
  </div>
</template>
