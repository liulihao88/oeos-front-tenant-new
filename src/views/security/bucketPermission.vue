<script setup lang="ts">
import { ref, getCurrentInstance, watch, nextTick } from 'vue'
import { getBucketPermission, updateBucketPermission } from '@/api/securityApi.ts'

import GetBucketList from '@/hooks/getBucketList.ts'
let getBucketList = GetBucketList()
getBucketList.getBucketList()

const { proxy } = getCurrentInstance()

const props = defineProps({
  sendName: {
    type: String,
    required: true,
  },
})

const columns = [
  {
    label: '桶名',
    prop: 'name',
    width: 500,
  },
  {
    label: '浏览',
    prop: 'browse',
    useSlot: true,
  },
  {
    label: '读',
    prop: 'read',
    useSlot: true,
  },
  {
    label: '写',
    prop: 'write',
    useSlot: true,
  },
  {
    label: '删除',
    prop: 'delete',
    useSlot: true,
  },
  {
    label: '管理',
    prop: 'management',
    useSlot: true,
  },
]

const permissionBucketAdmin = ref()
const data = ref([])
const searchValue = ref('')
const permissionValues = ref([])
const originData = ref([])
const sendPermissionData = ref({
  bucketPermission: {},
})

watch(
  () => getBucketList.bucketOptions,
  (val) => {
    data.value = proxy.clone(val)
    originData.value = proxy.clone(val)
    getPermission()
  },
  {
    deep: true,
    immediate: true,
  },
)

async function getPermission() {
  let res = await getBucketPermission(props.sendName)

  Object.entries(res.bucketPermission).map(([k, v]) => {
    if (k === '*') {
      const cachePermissionValues = []
      v.forEach((val) => {
        if (val === 'PERMISSION_BUCKET_ADMIN') {
          permissionBucketAdmin.value = val
        } else {
          let filterPermission = proxy.PERMISSION_OPTIONS.map((item) => item.value).filter((item) => item === val)
          cachePermissionValues.push(...filterPermission)
        }
      })
      permissionValues.value = proxy.clone(cachePermissionValues)
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
    }
  })
}

const changeBucketText = () => {
  if (!searchValue.value) {
    data.value = proxy.clone(originData.value)
  }
  console.log(`86 originData.value`, originData.value)
  data.value = originData.value.filter((val) => {
    return val.name.indexOf(searchValue.value) !== -1
  })
  console.log(`61 data.value`, data.value)
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
  sendPermissionData.value.bucketPermission['*'] = permissionBucketAdmin.value
    ? [permissionBucketAdmin.value].concat(permissionValues.value)
    : permissionValues.value
  if (!permissionBucketAdmin.value) {
    proxy.log(`data`, data, '/cyrd/oeos-front-tenant-new/src/views/security/bucketPermission.vue')
    originData.value.forEach((v) => {
      handlePermissionDataItem(v, v.browse, 'PERMISSION_BUCKET_BROWSE')
      handlePermissionDataItem(v, v.read, 'PERMISSION_BUCKET_READ')
      handlePermissionDataItem(v, v.write, 'PERMISSION_BUCKET_WRITE')
      handlePermissionDataItem(v, v.delete, 'PERMISSION_BUCKET_DELETE')
      handlePermissionDataItem(v, v.management, 'PERMISSION_BUCKET_MANAGEMENT')
    })
  }

  return sendPermissionData.value
}

const checkboxChange = async () => {
  originData.value = originData.value.map((v) => {
    data.value.forEach((val) => {
      proxy.log(`data.value`, data.value, '/cyrd/oeos-front-tenant-new/src/views/security/bucketPermission.vue')
      if (val.name === v.name) {
        v = proxy.clone(val)
      }
    })
    return v
  })
  setTimeout(() => {
    proxy.log(`data`, data, '/cyrd/oeos-front-tenant-new/src/views/security/bucketPermission.vue')
    proxy.log(`originData`, originData, '/cyrd/oeos-front-tenant-new/src/views/security/bucketPermission.vue')
  }, 2000)
}

defineExpose({
  $getData: $getData,
})
</script>

<template>
  <div>
    <o-title title="桶操作权限" />
    <o-title title="桶管理权限" type="simple">
      <el-checkbox v-model="permissionBucketAdmin" class="ml" label="全部权限" true-value="PERMISSION_BUCKET_ADMIN" />
      <o-icon
        class="ml"
        name="warning"
        content="此权限拥有当前租户所有桶的所有权限
包括创建新桶权限以及[浏览/读取/写入/删除/管理]"
      />
    </o-title>
    <o-title title="所有桶权限" type="simple">
      <div class="ml">
        <o-checkbox
          v-model="permissionValues"
          :options="proxy.PERMISSION_OPTIONS"
          :disabled="!!permissionBucketAdmin"
        />
      </div>
    </o-title>
    <g-warning
      title=" 设置所有桶权限即所有（已创建及未来创建）的单桶都具备该权限，设置单个桶权限仅代表此桶具有该权限。"
    />

    <o-title title="单个桶权限" tb="8">
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
      ref="tableRef"
      :columns="columns"
      :data="data"
      :pageSize="30"
      height="calc(100vh - 600px)"
      class=""
      :showPage="false"
    >
      <template #browse="{ scope, row }">
        <el-checkbox
          v-model="row.browse"
          label=""
          :disabled="permissionValues.includes('PERMISSION_BUCKET_BROWSE') || !!permissionBucketAdmin"
          @change="checkboxChange"
        />
      </template>
      <template #read="{ scope, row }">
        <el-checkbox
          v-model="row.read"
          label=""
          :disabled="permissionValues.includes('PERMISSION_BUCKET_READ') || !!permissionBucketAdmin"
          @change="checkboxChange"
        />
      </template>
      <template #write="{ scope, row }">
        <el-checkbox
          v-model="row.write"
          label=""
          :disabled="permissionValues.includes('PERMISSION_BUCKET_WRITE') || !!permissionBucketAdmin"
          @change="checkboxChange"
        />
      </template>
      <template #delete="{ scope, row }">
        <el-checkbox
          v-model="row.delete"
          label=""
          :disabled="permissionValues.includes('PERMISSION_BUCKET_DELETE') || !!permissionBucketAdmin"
          @change="checkboxChange"
        />
      </template>
      <template #management="{ scope, row }">
        <el-checkbox
          v-model="row.management"
          label=""
          :disabled="permissionValues.includes('PERMISSION_BUCKET_MANAGEMENT') || !!permissionBucketAdmin"
          @change="checkboxChange"
        />
      </template>
    </o-table>
  </div>
</template>
