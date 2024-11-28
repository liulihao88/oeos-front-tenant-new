<script setup lang="ts">
import { ref, getCurrentInstance, computed } from 'vue'
const { proxy } = getCurrentInstance()
import { getTagging, saveTagging, getAnonymous, saveAnonymous } from '@/api/bucket.ts'

const props = defineProps({
  bucketName: {
    type: String,
    required: true,
  },
  isTag: {
    type: Boolean,
    default: true,
  },
})

const formRef = ref(null)
const form = ref({
  data: [],
})
const baseForm = ref({
  data: [],
})
const isShow = ref(false)
const selections = ref([])
const selectionsIndex = ref([])
const deleteRow = (row, scope) => {
  form.value.data.splice(scope.$index, 1)
}
const columnsBase = ref([
  {
    label: '标签名',
    prop: 'label',
  },
  {
    label: '标签值(可选)',
    prop: 'value',
  },
])

const columns = computed(() => {
  let finalColumns = []
  if (props.isTag) {
    finalColumns = [
      {
        type: 'selection',
      },
      {
        label: '标签名',
        prop: 'label',
        useSlot: true,
      },
      {
        label: '标签值(可选)',
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
            comp: 'o-icon',
            attrs: {
              name: 'delete',
              content: '删除',
            },
          },
        ],
      },
    ]
  } else {
    finalColumns = [
      {
        type: 'selection',
      },
      {
        label: '文件夹',
        prop: 'path',
        useSlot: true,
      },
      {
        label: '权限',
        prop: 'permission',
        width: 200,
        useSlot: true,
      },
      {
        key: 'operation',
        label: '操作',
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
  }
  return finalColumns
})

const permissionOptions = [
  { label: '只读', value: 'read' },
  { label: '只写', value: 'put' },
  { label: '读写', value: 'all' },
]

if (!props.isTag) {
  columnsBase.value = [
    {
      label: '文件夹',
      prop: 'path',
    },
    {
      label: '权限',
      prop: 'permission',
      filter: (val) => permissionOptions.find((v) => v.value === val).label,
    },
  ]
}

const init = async () => {
  let res = await (props.isTag ? getTagging : getAnonymous)(props.bucketName)
  form.value.data = []
  baseForm.value.data = []
  if (props.isTag) {
    Object.entries(res).map(([key, value]) => {
      form.value.data.push({
        label: key,
        value,
      })
      baseForm.value.data.push({
        label: key,
        value,
      })
    })
  } else {
    form.value.data = res
    baseForm.value.data = proxy.clone(res)
  }
}
init()

const deleteSelection = () => {
  const copyFormData = proxy.clone(form.value.data)
  form.value.data = copyFormData.filter((item, index) => !selectionsIndex.value.includes(index))
}
const open = async () => {
  await init()
  isShow.value = true
}
const add = () => {
  if (form.value.data.length >= 50) {
    return proxy.$toast('标签最多添加50个', 'e')
  }
  if (props.isTag) {
    form.value.data.push({
      label: proxy.$dev ? proxy.uuid() : '',
      value: '',
    })
  } else {
    form.value.data.push({
      path: proxy.$dev ? '/' + proxy.uuid() : '',
      permission: permissionOptions[0].value,
      effect: 'allow',
    })
  }
}
const save = async () => {
  await proxy.validForm(formRef)
  let sendObject
  if (props.isTag) {
    sendObject = form.value.data.reduce((accumulator, current) => {
      accumulator[current.label] = current.value
      return accumulator
    }, {})
  } else {
    sendObject = form.value.data
  }

  await (props.isTag ? saveTagging : saveAnonymous)(props.bucketName, sendObject)
  proxy.$toast('保存成功')
  await init()
  isShow.value = false
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

const pathValidator = (rule, value, callback) => {
  let regex = /^\/([a-zA-Z0-9_\-.]*(\/|$))*[a-zA-Z0-9_\-.*]*$/
  if (regex.test(value)) {
    callback()
  } else {
    callback(new Error("格式为: '/路径' 或者 '/文件', 如/a/*, /a/*.txt"))
  }
}

const getPathRules = (index) => {
  let labelArr = []
  for (let i = 0; i < form.value.data.length; i++) {
    labelArr.push(form.value.data[i].path)
  }
  labelArr.splice(index, 1)

  for (let i = 0; i < form.value.data.length; i++) {
    if (labelArr.includes(form.value.data[index].path) && form.value.data[index].path) {
      return [
        {
          trigger: ['blur', 'change'],
          validator: (rule, value, callback) => {
            if (value === form.value.data[index].path) {
              return callback(new Error('标签名不能重复'))
            } else {
              callback()
            }
          },
        },
      ]
    }
  }
  if (props.isTag) {
    return [proxy.validate('必填')]
  } else {
    return [
      proxy.validate('必填'),
      {
        trigger: ['change', 'blur'],
        validator: pathValidator,
      },
    ]
  }
}
// const valueRules = [proxy.validate('必填')]
const selectionChange = (val, ...a) => {
  selections.value = val
  selectionsIndex.value = selections.value.map((item) => form.value.data.indexOf(item))
}

defineExpose({
  open,
})
</script>

<template>
  <div>
    <o-title :title="isTag ? '标签' : '匿名访问'" b="8" type="simple">
      <template #icon>
        <g-img class="mr" :src="isTag ? 'bucket/tag' : 'bucket/secret'" />
      </template>
      <template #right>
        <el-button type="primary" @click="open">
          更多
          <o-icon name="arrow-right" size="12" />
        </el-button>
      </template>
    </o-title>
    <o-table
      ref="tableRef"
      :columns="columnsBase"
      :data="baseForm.data"
      :showPage="false"
      :pageSize="50"
      @selection-change="selectionChange"
    />
    <o-dialog
      ref="dialogRef"
      v-model="isShow"
      :title="isTag ? '更新标签' : '更新匿名访问'"
      confirmText="保存"
      fullscreen
      @confirm="save"
    >
      <o-title :title="isTag ? '标签' : '匿名访问'" b="8">
        <el-button type="primary" class="ml2" @click="add">添加</el-button>
        <el-button type="primary" :disabled="selections.length === 0" @click="deleteSelection">删除选中</el-button>
      </o-title>
      <el-form ref="formRef" :model="form">
        <o-table
          ref="tableRef"
          :columns="columns"
          :data="form.data"
          :showPage="false"
          :pageSize="50"
          height="calc(100vh - 170px)"
          @selection-change="selectionChange"
        >
          <template #label="{ scope, row }">
            <template v-if="scope.$index !== -1">
              <el-form-item label="" :prop="`data.${scope.$index}.label`" :rules="getInnerRules(scope.$index)">
                <o-input v-model="form.data[scope.$index].label" placeholder="请输入标签名" />
              </el-form-item>
            </template>
          </template>
          <template #value="{ scope, row }">
            <template v-if="scope.$index !== -1">
              <el-form-item label="" :prop="`data.${scope.$index}.value`">
                <o-input v-model="form.data[scope.$index].value" placeholder="请输入标签值" />
              </el-form-item>
            </template>
          </template>

          <template #path="{ scope, row }">
            <template v-if="scope.$index !== -1">
              <el-form-item label="" :prop="`data.${scope.$index}.path`" :rules="getPathRules(scope.$index)">
                <o-input v-model="form.data[scope.$index].path" placeholder="请输入路径名, 如/a/*, /a/*.txt" />
              </el-form-item>
            </template>
          </template>
          <template #permission="{ scope, row }">
            <template v-if="scope.$index !== -1">
              <el-form-item label="" :prop="`data.${scope.$index}.permission`">
                <o-select
                  v-model="form.data[scope.$index].permission"
                  width="100%"
                  :options="permissionOptions"
                  :clearable="false"
                />
              </el-form-item>
            </template>
          </template>
        </o-table>
      </el-form>
    </o-dialog>
  </div>
</template>
