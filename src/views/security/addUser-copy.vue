<script setup lang="ts">
import { ref, getCurrentInstance, computed, onMounted, watch } from 'vue'
import { omit } from 'lodash-es'
import JSEncrypt from 'jsencrypt'

import { encrypt } from '@/api/login.ts'
import { addUser, getBucketPermission, updateBucketPermission, putRoles } from '@/api/securityApi.ts'
import { ROLE_OPTIONS } from '@/assets/globalData.ts'

import GetBucketList from '@/hooks/getBucketList.ts'
let getBucketList = GetBucketList()
getBucketList.getBucketList()

import { useRouter, useRoute } from 'vue-router'
const router = useRouter()
const route = useRoute()

const roleValues = ref([])
const { proxy } = getCurrentInstance()

const userDetails = ref(proxy.getStorage('tenant-user-details') || {})
roleValues.value = userDetails.value.roles
const isEdit = ref(false)
if (proxy.notEmpty(userDetails.value)) {
  isEdit.value = true
}
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

const searchValue = ref('')

const sendPermissionData = ref({
  bucketPermission: {},
})
const data = ref([])
const permissionTableMap = {
  browse: 'PERMISSION_BUCKET_READ',
  read: 'PERMISSION_BUCKET_READ',
  write: 'PERMISSION_BUCKET_WRITE',
  delete: 'PERMISSION_BUCKET_DELETE',
  management: 'PERMISSION_BUCKET_MANAGEMENT',
}
const originData = ref([])

const columns = [
  {
    label: '桶名',
    prop: 'name',
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
const permissionValues = ref([])
const form = ref({})
form.value = proxy.clone(userDetails.value)
const formRef = ref(null)
const rules = computed(() => {
  return {
    username: [proxy.validate('custom', { message: '3-10位字符且只支持数字、英文', reg: /^[0-9a-zA-Z]{3,10}$/ })],
    fullName: [proxy.validate('length', { min: 3, max: 20 })],
    pwd: [
      proxy.validate('length', { min: 8, max: 40, required: isEdit.value ? false : true }),
      proxy.validate('same', { value: form.value.confirmPwd, required: isEdit.value ? false : true }),
    ],
    confirmPwd: [
      proxy.validate('length', { min: 8, max: 40, required: isEdit.value ? false : true }),
      proxy.validate('same', { value: form.value.pwd, required: isEdit.value ? false : true }),
    ],
  }
})

watch(
  () => getBucketList.bucketOptions,
  (val) => {
    data.value = proxy.clone(val)
    originData.value = proxy.clone(val)
    if (isEdit.value) {
      getPermission()
    }
  },
  {
    deep: true,
    immediate: true,
  },
)

watch(
  data,
  (dataValue) => {
    originData.value = originData.value.map((v) => {
      dataValue.forEach((val) => {
        if (val.name === v.name) {
          v = proxy.clone(val)
        }
      })
      return v
    })
  },
  {
    deep: true,
    immediate: true,
  },
)

const changeBucketText = () => {
  if (!searchValue.value) {
    data.value = proxy.clone(originData.value)
  }
  data.value = originData.value.filter((val) => {
    return val.name.indexOf(searchValue.value) !== -1
  })
}

async function getPermission() {
  let res = await getBucketPermission(userDetails.value.username)

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

const handlePermissionData = async () => {
  sendPermissionData.value.bucketPermission['*'] = permissionBucketAdmin.value
    ? [permissionBucketAdmin.value].concat(permissionValues.value)
    : permissionValues.value
  if (!permissionBucketAdmin.value) {
    originData.value.forEach((v) => {
      handlePermissionDataItem(v, v.browse, 'PERMISSION_BUCKET_BROWSE')
      handlePermissionDataItem(v, v.read, 'PERMISSION_BUCKET_READ')
      handlePermissionDataItem(v, v.write, 'PERMISSION_BUCKET_WRITE')
      handlePermissionDataItem(v, v.delete, 'PERMISSION_BUCKET_DELETE')
      handlePermissionDataItem(v, v.management, 'PERMISSION_BUCKET_MANAGEMENT')
    })
  }

  await updateBucketPermission(userDetails.value.username, sendPermissionData.value)
}

const save = async () => {
  await proxy.validForm(formRef)
  const sendForm = omit(form.value, ['pwd', 'confirmPwd'])
  if (form.value.pwd) {
    let encRes = await encrypt(form.value.pwd)
    const encryptor = new JSEncrypt()
    const publickKey = encRes.communicationKey
    encryptor.setPublicKey(publickKey)
    const pwd = encryptor.encrypt(form.value.pwd)
    sendForm.password = pwd
  } else {
    sendForm.password = ''
  }

  await addUser(sendForm)
  proxy.$toast('保存成功')
  if (isEdit.value) {
    await putRoles(userDetails.value.username, roleValues.value)
    await handlePermissionData()
  }
  proxy.jump('/apps/security/user')
}

const devTest = () => {
  if (proxy.$dev && !isEdit.value) {
    form.value = {
      username: 'andy' + proxy.uuid(),
      fullName: 'andy' + proxy.uuid(),
      pwd: 'adminadmin',
      confirmPwd: 'adminadmin',
      description: 'description' + proxy.uuid(),
    }
  }
}
devTest()
</script>

<template>
  <div class="">
    <o-title :title="isEdit ? '用户编辑' : '用户新增'">
      <el-button type="primary" class="ml2" @click="save">保存</el-button>
      <el-button class="ml2" @click="proxy.jump('/apps/security/user')">取消</el-button>
    </o-title>
    <o-title title="基本信息" type="simple" />
    <el-form ref="formRef" :model="form" :rules="rules" label-width="auto" inline>
      <el-form-item label="名称" prop="username">
        <o-input v-model="form.username" :disabled="isEdit" placeholder="3-10位字符且只支持数字、英文" />
      </el-form-item>
      <el-form-item label="用户全称" prop="fullName">
        <o-input v-model="form.fullName" placeholder="1-20位字符" />
      </el-form-item>
      <el-form-item label="密码" prop="pwd">
        <o-input v-model="form.pwd" placeholder="8-40位字符组合、特殊字符可选" />
      </el-form-item>
      <el-form-item label="确认密码" prop="confirmPwd">
        <o-input v-model="form.confirmPwd" placeholder="8-40位字符组合、特殊字符可选" />
      </el-form-item>
      <el-form-item label="描述" prop="description">
        <o-input
          v-model="form.description"
          placeholder="请输入描述信息, 限制50个字符"
          type="textarea"
          :maxlength="50"
        />
      </el-form-item>
    </el-form>

    <template v-if="isEdit">
      <o-title title="用户角色" />
      <o-title title="所属角色" type="simple">
        <div class="ml fw-400">修改角色权限保存后, 5分钟后生效</div>
      </o-title>
      <div class="f-st-ct">
        <o-checkbox v-model="roleValues" :options="ROLE_OPTIONS" />
        <o-icon name="warning" raw-content :content="roleInfos" class="ml2" />
      </div>

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
          />
        </template>
        <template #read="{ scope, row }">
          <el-checkbox
            v-model="row.read"
            label=""
            :disabled="permissionValues.includes('PERMISSION_BUCKET_READ') || !!permissionBucketAdmin"
          />
        </template>
        <template #write="{ scope, row }">
          <el-checkbox
            v-model="row.write"
            label=""
            :disabled="permissionValues.includes('PERMISSION_BUCKET_WRITE') || !!permissionBucketAdmin"
          />
        </template>
        <template #delete="{ scope, row }">
          <el-checkbox
            v-model="row.delete"
            label=""
            :disabled="permissionValues.includes('PERMISSION_BUCKET_DELETE') || !!permissionBucketAdmin"
          />
        </template>
        <template #management="{ scope, row }">
          <el-checkbox
            v-model="row.management"
            label=""
            :disabled="permissionValues.includes('PERMISSION_BUCKET_MANAGEMENT') || !!permissionBucketAdmin"
          />
        </template>
      </o-table>
    </template>
  </div>
</template>
