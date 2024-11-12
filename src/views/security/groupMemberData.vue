<script setup lang="ts">
import { ref, getCurrentInstance, nextTick, computed } from 'vue'
import { removeMember, getGroupMember, getUsers, addGroupMember } from '@/api/securityApi.ts'

const { proxy } = getCurrentInstance()
const groupName = ref()
const isShow = ref(false)
const searchValue = ref()

const multipleSelection = ref([])
const data = ref([])
const data2 = ref([])
const tableRef2 = ref(null)
const columns2 = [
  {
    type: 'selection',
  },
  {
    label: '用户名',
    prop: 'username',
  },
]
const columns = [
  {
    label: '用户名',
    prop: 'username',
    width: 150,
  },
  {
    label: '用户全称',
    prop: 'fullName',
  },
  {
    label: '角色',
    prop: 'roles',
    useSlot: true,
    width: 360,
  },
  {
    label: '状态',
    prop: 'status',
    width: 100,
    filter: (val) => {
      return val === 'on' ? '启用' : val === 'off' ? '未启用' : '-'
    },
  },
  {
    label: '描述',
    prop: 'description',
  },
  {
    key: 'operation',
    label: '操作',
    width: 100,
    btns: [
      {
        content: '移除',
        handler: remove,
      },
    ],
  },
]

const usernameSelection = computed(() => {
  return multipleSelection.value.map((v) => v.username)
})

const init = async (sendGroupName) => {
  groupName.value = sendGroupName
  let res = await getGroupMember(sendGroupName)
  data.value = res
}
const getUsersInit = async () => {
  let sendParams = {
    perPage: 10000,
    page: 1,
  }
  let res = await getUsers(sendParams)
  data2.value = res
}
getUsersInit()

const handleRemoveUser = async () => {
  // 获取差集
  const dataUsername = data.value.map((v) => v.username)
  let difference = dataUsername.filter((v) => !usernameSelection.value.includes(v))
  console.log(`38 difference`, difference)
  if (proxy.notEmpty(difference)) {
    await remove(difference)
  }
}
async function remove(row) {
  let removeData = []
  if (Array.isArray(row)) {
    removeData = row
  } else {
    removeData = [row.username]
  }
  console.log(`73 removeData`, removeData)
  await removeMember(groupName.value, removeData)
  proxy.$toast('移除成功')
  init(groupName.value)
}
const addMember = async () => {
  isShow.value = true
  await nextTick()
  let existRow = data2.value.filter((v) => {
    return data.value.findIndex((val) => val.username === v.username) > -1
  })
  console.log(`56 existRow`, existRow)
  existRow.forEach((row) => {
    console.log(`37 row`, row)
    console.log(`51 tableRef2.value.$refs.tableRef`, tableRef2.value.$refs.tableRef)
    console.log(
      `25 tableRef2.value.$refs.tableRef.toggleRowSelection`,
      tableRef2.value.$refs.tableRef.toggleRowSelection,
    )
    tableRef2.value.$refs.tableRef.toggleRowSelection(row, true)
  })
}
const search = () => {}

const handleSelectionChange = (val) => {
  multipleSelection.value = val
}

const confirm = async () => {
  await addGroupMember(groupName.value, usernameSelection.value)
  proxy.$toast('新增成功')
  isShow.value = false
  await handleRemoveUser()
  init(groupName.value)
}

defineExpose({
  init,
})
</script>

<template>
  <div>
    <o-title title="组用户管理" b="8">
      <el-button type="primary" icon="el-cion-plus" class="ml" @click="addMember">添加用户</el-button>
    </o-title>
    <o-table ref="tableRef" :columns="columns" :data="data" :showPage="false" height="170px">
      <template #roles="{ scope, row }">
        <template v-if="proxy.isEmpty(row.roles)">-</template>
        <template v-else>
          <div class="f w-100%" style="flex-wrap: nowrap">
            <el-tag v-for="(v, i) in row.roles" :key="i" class="mr">
              {{ proxy.ROLE_OPTIONS.find((item) => item.value === v)?.label }}
            </el-tag>
          </div>
        </template>
      </template>
    </o-table>

    <o-dialog ref="dialogRef" v-model="isShow" title="添加用户" @confirm="confirm">
      <o-input v-model="searchValue" v-debounce.300="search" placeholder="查询" class="mb" />

      <o-table ref="tableRef2" :columns="columns2" :data="data2" @selection-change="handleSelectionChange" />
    </o-dialog>
  </div>
</template>
