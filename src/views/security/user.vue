<script setup lang="ts">
import { ref, getCurrentInstance, computed } from 'vue'
const { proxy } = getCurrentInstance()
import { userStatistic, addUser, getUsers, deleteUser, enableUser, disableUser } from '@/api/securityApi.ts'
import JSEncrypt from 'jsencrypt'

import { encrypt } from '@/api/login.ts'
import { omit } from 'lodash-es'
import { ROLE_OPTIONS } from '@/assets/globalData.ts'

const statusOptions = [
  { label: '启用', value: 'on' },
  { label: '未启用', value: 'off' },
]
const data = ref([])

const statisticData = ref({})
const form = ref({
  perPage: 10000,
})
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
    width: 120,
    handler: editRow,
  },
  {
    label: '用户全称',
    prop: 'fullName',
  },
  {
    label: '用户角色',
    prop: 'roles',
    useSlot: true,
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

const isShow = ref(false)
const dialogForm = ref({})
const formRef = ref(null)
const originForm = ref({})
const rules = computed(() => {
  return {
    username: [proxy.validate('custom', { message: '3-10位字符且只支持数字、英文', reg: /^[0-9a-zA-Z]{3,10}$/ })],
    fullName: [proxy.validate('length', { min: 3, max: 20 })],
    pwd: [
      proxy.validate('length', { min: 8, max: 40 }),
      proxy.validate('same', { value: dialogForm.value.confirmPwd }),
    ],
    confirmPwd: [
      proxy.validate('length', { min: 8, max: 40 }),
      proxy.validate('same', { value: dialogForm.value.pwd }),
    ],
  }
})

function editRow(row) {
  proxy.setStorage('tenant-user-details', row)
  proxy.jump(`/apps/security/user/addUser`)
}
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

const newAddUser = () => {
  dialogForm.value = proxy.clone(originForm)
  if (proxy.$dev) {
    dialogForm.value = {
      username: proxy.uuid('andy'),
      fullName: proxy.uuid('andyFull'),
      pwd: 'adminadmin',
      confirmPwd: 'adminadmin',
      description: proxy.uuid('description'),
    }
  }
  isShow.value = true
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
const confirm = async () => {
  await proxy.validForm(formRef)
  const sendForm = omit(dialogForm.value, ['pwd', 'confirmPwd'])
  let encRes = await encrypt(dialogForm.value.pwd)
  const encryptor = new JSEncrypt()
  const publickKey = encRes.communicationKey
  encryptor.setPublicKey(publickKey)
  const pwd = encryptor.encrypt(dialogForm.value.pwd)
  sendForm.password = pwd
  await addUser(sendForm)
  proxy.$toast('保存成功')
  isShow.value = false
  init()
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
        <el-button type="primary" icon="el-icon-plus" @click="newAddUser">新增用户</el-button>
      </div>
    </div>
    <o-table ref="tableRef" :columns="columns" :data="data" :showPage="false">
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
      <template #status="{ scope, row }">
        <el-switch
          v-model="row.status"
          inline-prompt
          class="switch-box"
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

    <o-dialog ref="dialogRef" v-model="isShow" title="新增用户" @confirm="confirm">
      <el-form ref="formRef" :model="dialogForm" :rules="rules" label-width="auto">
        <el-form-item label="名称" prop="username">
          <o-input v-model="dialogForm.username" v-focus placeholder="3-10位字符且只支持数字、英文" />
        </el-form-item>
        <el-form-item label="用户全称" prop="fullName">
          <o-input v-model="dialogForm.fullName" placeholder="1-20位字符" />
        </el-form-item>
        <el-form-item label="密码" prop="pwd">
          <o-input v-model="dialogForm.pwd" placeholder="8-40位字符组合、特殊字符可选" />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPwd">
          <o-input v-model="dialogForm.confirmPwd" placeholder="8-40位字符组合、特殊字符可选" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <o-input
            v-model="dialogForm.description"
            placeholder="请输入描述信息, 限制50个字符"
            type="textarea"
            :maxlength="50"
          />
        </el-form-item>
      </el-form>
    </o-dialog>
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

/* 设置 el-switch 的宽度 */
.switch-box :deep(.el-switch__core) {
  width: 60px; /* 你可以根据需要调整这个值 */
}
</style>
