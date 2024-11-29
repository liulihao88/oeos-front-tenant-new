<script setup lang="ts">
import { ref, getCurrentInstance, watch, nextTick } from 'vue'
import { getBucketPermission, updateBucketPermission } from '@/api/securityApi.ts'

import GetBucketList from '@/hooks/getBucketList.ts'
let getBucketList = GetBucketList()
getBucketList.getBucketList()

const { proxy } = getCurrentInstance()
const toggleTable = ref(true)

const props = defineProps({
  type: {
    type: String,
    default: '', // group
  },
  sendName: {
    type: String,
    required: true,
  },
  src: {
    type: Function,
    required: true,
  },
  tableHeight: {
    type: String,
    default: 'calc(100vh - 600px)',
  },
})

const permissionInfos = `
  <div>
    <span class="mr cl-green tr w-30 d-ib">浏览:</span>
    <span>列出桶对象或对象版本, 列出未完成的分片</span>
  </div>
  <div>
    <span class="mr cl-green tr w-30 d-ib">读:</span>
    <span>读取对象数据或对象版本数据, 列出未完成的分片</span>
  </div>
  <div>
    <span class="mr cl-green tr w-30 d-ib">写:</span>
    <span>上传对象, 或通过分片上传设置对象元数据或Tag等</span>
  </div>
  <div>
    <span class="mr cl-green tr w-30 d-ib">删除:</span>
    <span>删除当前对象或某个版本, 删除元数据或Tag等</span>
  </div>
  <div>
    <span class="mr cl-green tr w-30 d-ib">管理:</span>
    <span>浏览桶对象, 删除，配置桶权限</span>
  </div>
  `

const columns = [
  {
    label: '桶名',
    prop: 'name',
    useSlot: true,
  },
  {
    label: '浏览',
    prop: 'browse',
    useSlot: true,
    width: 150,
  },
  {
    label: '读',
    prop: 'read',
    useSlot: true,
    width: 150,
  },
  {
    label: '写',
    prop: 'write',
    useSlot: true,
    width: 150,
  },
  {
    label: '删除',
    prop: 'delete',
    useSlot: true,
    width: 150,
  },
  {
    label: '管理',
    prop: 'management',
    useSlot: true,
    width: 150,
  },
]

const permissionBucketAdmin = ref()
const data = ref([])
const searchValue = ref('')
const baseData = ref([])
const permissionValues = ref([])
const originData = ref([])
const sendPermissionData = ref({
  bucketPermission: {},
})

watch(
  () => getBucketList.bucketOptions,
  (val) => {
    data.value = proxy.clone(val)
    baseData.value = proxy.clone(val)
    originData.value = proxy.clone(val)
    getPermission()
  },
  {
    deep: true,
    immediate: true,
  },
)

const changeBucketText = async () => {
  toggleTable.value = false
  if (!searchValue.value) {
    data.value = proxy.clone(originData.value)
  } else {
    data.value = originData.value.filter((val) => {
      return val.name.indexOf(searchValue.value) !== -1
    })
  }
  await nextTick()
  toggleTable.value = true
}

const handlePermissionDataItem = (item, rowIsTrue, type) => {
  if (!permissionValues.value.includes(type)) {
    if (rowIsTrue) {
      if (!sendPermissionData.value.bucketPermission[item.name]) {
        sendPermissionData.value.bucketPermission[item.name] = [type]
      } else {
        if (!sendPermissionData.value.bucketPermission[item.name].includes(type)) {
          sendPermissionData.value.bucketPermission[item.name].push(type)
        }
      }
    }
  }
}

const $getData = async () => {
  sendPermissionData.value.bucketPermission = {}
  sendPermissionData.value.bucketPermission['*'] = permissionBucketAdmin.value
    ? [permissionBucketAdmin.value]
    : permissionValues.value
  if (!permissionBucketAdmin.value) {
    originData.value.forEach((v) => {
      if (!permissionValues.value.includes('PERMISSION_BUCKET_BROWSE')) {
        handlePermissionDataItem(v, v.browse, 'PERMISSION_BUCKET_BROWSE')
      }
      if (!permissionValues.value.includes('PERMISSION_BUCKET_READ')) {
        handlePermissionDataItem(v, v.read, 'PERMISSION_BUCKET_READ')
      }
      if (!permissionValues.value.includes('PERMISSION_BUCKET_WRITE')) {
        handlePermissionDataItem(v, v.write, 'PERMISSION_BUCKET_WRITE')
      }
      if (!permissionValues.value.includes('PERMISSION_BUCKET_DELETE')) {
        handlePermissionDataItem(v, v.delete, 'PERMISSION_BUCKET_DELETE')
      }
      if (!permissionValues.value.includes('PERMISSION_BUCKET_MANAGEMENT')) {
        handlePermissionDataItem(v, v.management, 'PERMISSION_BUCKET_MANAGEMENT')
      }
    })
  }

  return sendPermissionData.value
}

const checkboxChange = async () => {
  originData.value = originData.value.map((v) => {
    data.value.forEach((val) => {
      if (val.name === v.name) {
        v = proxy.clone(val)
      }
    })
    return v
  })
}

async function getPermission() {
  let res = await props.src(props.sendName)
  data.value = proxy.clone(baseData.value)
  originData.value = proxy.clone(baseData.value)

  if (proxy.isEmpty(res.bucketPermission)) {
    permissionValues.value = []
    permissionBucketAdmin.value = false
    return
  }
  Object.entries(res.bucketPermission).map(([k, v]) => {
    if (!res.bucketPermission.hasOwnProperty('*')) {
      permissionValues.value = []
      permissionBucketAdmin.value = false
    }
    if (k === '*') {
      permissionBucketAdmin.value = v.find((v) => v === 'PERMISSION_BUCKET_ADMIN') ?? false
      permissionValues.value = v.filter((v) => v !== 'PERMISSION_BUCKET_ADMIN')
    } else {
      data.value = data.value.map((val) => {
        if (val.name === k) {
          if (v.includes('PERMISSION_BUCKET_BROWSE')) {
            val.browse = true
          }
          if (v.includes('PERMISSION_BUCKET_READ')) {
            val.read = true
          }
          if (v.includes('PERMISSION_BUCKET_WRITE')) {
            val.write = true
          }
          if (v.includes('PERMISSION_BUCKET_DELETE')) {
            val.delete = true
          }
          if (v.includes('PERMISSION_BUCKET_MANAGEMENT')) {
            val.management = true
          }
        }
        return val
      })
      originData.value = proxy.clone(data.value)
    }
  })
  changeBucketText()
}

defineExpose({
  $getData: $getData,
  getPermission: getPermission,
})
</script>

<template>
  <div>
    <o-title title="桶管理权限" tb="8">
      <el-checkbox v-model="permissionBucketAdmin" class="ml" label="全部权限" true-value="PERMISSION_BUCKET_ADMIN" />

      <g-warning
        type="icon"
        class="ml"
        content="此权限拥有当前租户所有桶的所有权限 包括创建新桶权限以及[浏览/读取/写入/删除/管理]"
      />
    </o-title>
    <div :class="{ 'c-box': props.type !== 'group' }">
      <o-title title="所有桶权限" type="simple">
        <g-warning
          style="width: calc(100% - 100px)"
          class="ml"
          content=" 设置所有
          桶权限即所有（已创建及未来创建）的单桶都具备该权限，设置单个桶权限仅代表此桶具有该权限。"
        />
      </o-title>
      <div class="ml f-st-ct">
        <o-checkbox
          v-model="permissionValues"
          :options="proxy.PERMISSION_OPTIONS"
          :disabled="!!permissionBucketAdmin"
        />
        <o-icon name="warning" raw-content :content="permissionInfos" class="ml2" />
      </div>

      <o-title title="单个桶权限" tb="8" type="simple">
        <span class="fw-400 ml2">共 {{ originData.length }} 个桶</span>
        <o-input
          v-model.trim="searchValue"
          v-debounce.200="changeBucketText"
          class="ml"
          placeholder="桶列表"
          title=" 筛选桶"
          width="250"
          @clear="changeBucketText"
        />
      </o-title>
      <o-table
        v-if="toggleTable"
        ref="tableRef"
        :columns="columns"
        :data="data"
        :pageSize="30"
        :height="props.tableHeight"
        class=""
        :showPage="false"
      >
        <template #name="{ scope, row }">
          {{ row.name }}
          <el-tag v-if="row.browse" class="mr">浏览</el-tag>
          <el-tag v-if="row.read" class="mr">读</el-tag>
          <el-tag v-if="row.write" class="mr">写</el-tag>
          <el-tag v-if="row.delete" class="mr">删除</el-tag>
          <el-tag v-if="row.management" class="mr">管理</el-tag>
        </template>
        <template #browse="{ scope, row }">
          <div class="tc">
            <el-checkbox
              v-model="row.browse"
              label=""
              :disabled="permissionValues.includes('PERMISSION_BUCKET_BROWSE') || !!permissionBucketAdmin"
              @change="checkboxChange"
            />
          </div>
        </template>
        <template #read="{ scope, row }">
          <div class="tc">
            <el-checkbox
              v-model="row.read"
              label=""
              :disabled="permissionValues.includes('PERMISSION_BUCKET_READ') || !!permissionBucketAdmin"
              @change="checkboxChange"
            />
          </div>
        </template>
        <template #write="{ scope, row }">
          <div class="tc">
            <el-checkbox
              v-model="row.write"
              label=""
              :disabled="permissionValues.includes('PERMISSION_BUCKET_WRITE') || !!permissionBucketAdmin"
              @change="checkboxChange"
            />
          </div>
        </template>
        <template #delete="{ scope, row }">
          <div class="tc">
            <el-checkbox
              v-model="row.delete"
              label=""
              :disabled="permissionValues.includes('PERMISSION_BUCKET_DELETE') || !!permissionBucketAdmin"
              @change="checkboxChange"
            />
          </div>
        </template>
        <template #management="{ scope, row }">
          <div class="tc">
            <el-checkbox
              v-model="row.management"
              label=""
              :disabled="permissionValues.includes('PERMISSION_BUCKET_MANAGEMENT') || !!permissionBucketAdmin"
              @change="checkboxChange"
            />
          </div>
        </template>
      </o-table>
    </div>
  </div>
</template>
