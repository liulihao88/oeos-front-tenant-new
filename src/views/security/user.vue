<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance()
import { userStatistic, getUsers, deleteUser, enableUser, disableUser } from '@/api/securityApi.ts'
import { ROLE_OPTIONS } from '@/assets/globalData.ts'

const statusOptions = [
  { label: '启用', value: 'on' },
  { label: '未启用', value: 'off' },
]
const data = ref([])
const statisticData = ref({})
const form = ref({})
const countNameData = ref([
  {
    value: 'total',
    text: '用户总数',
    count: 0,
  },
  {
    value: 'on',
    text: '启用数',
    count: 0,
  },
  {
    value: 'off',
    text: '未启用数',
    count: 0,
  },
  {
    value: 'role_admin_monitor',
    text: '监控管理员',
    count: 0,
  },
  {
    value: 'role_admin_security',
    text: '安全管理员',
    count: 0,
  },
  {
    value: 'role_admin_system',
    text: '系统管理员',
    count: 0,
  },
  {
    value: 'role_admin_data',
    text: '数据管理员',
    count: 0,
  },
])

const columns = [
  {
    label: '用户名',
    prop: 'username',
  },
  {
    label: '用户全称',
    prop: 'fullName',
  },
  {
    label: '用户角色',
    prop: 'roles',
    filter: (val) => val.join(',') || '-',
  },
  {
    label: '描述',
    prop: 'description',
  },
  {
    label: '状态',
    prop: 'status',
    useSlot: true,
    width: 100,
  },
  {
    key: 'operation',
    label: '操作',
    width: 150,
    btns: [
      {
        content: '编辑',
        handler: editRow,
      },
      {
        content: '删除',
        handler: deleteRow,
      },
    ],
  },
]

function editRow(row) {}
async function deleteRow(row) {
  await deleteUser(row.username)
  proxy.$toast('删除成功')
  init()
}

const handleStatistic = () => {
  countNameData.value = countNameData.value.map((v) => {
    for (const key in statisticData.value) {
      if (key === v.value) {
        v.count = statisticData.value[key]
      }
    }
    return v
  })
}

async function init() {
  let res = await getUsers(form.value)
  data.value = res
}
const statisticInit = async () => {
  let res = await userStatistic()
  statisticData.value = res
  handleStatistic()
}
statisticInit()
init()

const addUser = () => {
  proxy.jump('/apps/security/user/addUser')
}
const switchChange = async (row) => {
  console.log(`92 row`, row)
  if (row.status === 'on') {
    await disableUser(row.username)
  } else if (row.status === 'off') {
    await enableUser(row.username)
  }
  proxy.$toast('操作成功')
  statisticInit()
  return true
}
</script>

<template>
  <div>
    <o-title title="数据统计" />
    <div class="header">
      <div v-for="(v, i) in countNameData" :key="i" class="item c-box">
        <div>{{ v.text }}</div>
        <div>{{ v.count }}</div>
      </div>
    </div>

    <o-title title="用户列表" />
    <div class="f-bt-ct mb2">
      <div>
        <o-input v-model="form.username" v-debounce="init" width="240" title="用户名" class="mr2" @clear="init" />
        <o-select v-model="form.role" :options="ROLE_OPTIONS" title="角色" class="mr" @change="init" />
        <o-select v-model="form.status" title="状态" :options="statusOptions" @change="init" />
      </div>
      <div class="w-100">
        <el-button type="primary" icon="el-icon-plus" @click="addUser">新增用户</el-button>
      </div>
    </div>
    <o-table ref="tableRef" :columns="columns" :data="data" :showPage="false">
      <template #status="{ scope, row }">
        <el-switch
          v-model="row.status"
          inline-prompt
          active-text="启用"
          inactive-text="未启用"
          active-value="on"
          inactive-value="off"
          :beforeChange="
            () => {
              return switchChange(row)
            }
          "
        />
      </template>
    </o-table>
  </div>
</template>

<style lang="scss" scoped>
.header {
  display: flex;
  margin-bottom: 16px;
}

.item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 8px;
}
</style>
