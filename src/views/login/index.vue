<script setup lang="ts">
import Motion from './utils/motion'
import { useRouter, useRoute } from 'vue-router'
import { message } from '@/utils/message'
import { loginRules } from './utils/rule'
import { useNav } from '@/layout/hooks/useNav'
import type { FormInstance } from 'element-plus'
import { useLayout } from '@/layout/hooks/useLayout'
import { useUserStoreHook } from '@/store/modules/user'
import { initRouter, getTopMenu } from '@/router/utils'
import { bg, avatar, illustration } from './utils/static'
import { useRenderIcon } from '@/components/ReIcon/src/hooks'
import JSEncrypt from 'jsencrypt'
import { ref, reactive, toRaw, onMounted, onBeforeUnmount, getCurrentInstance } from 'vue'
import { useDataThemeChange } from '@/layout/hooks/useDataThemeChange'

import dayIcon from '@/assets/svg/day.svg?component'
import darkIcon from '@/assets/svg/dark.svg?component'
import Lock from '@iconify-icons/ri/lock-fill'
import User from '@iconify-icons/ri/user-3-fill'
import { getTenants, encrypt, login, getMenu } from '@/api/login.js'

defineOptions({
  name: 'Login',
})
const { proxy } = getCurrentInstance()
const router = useRouter()
const route = useRoute()
const loading = ref(false)
const ruleFormRef = ref<FormInstance>()
const selectValue = ref()
const tenantOptions = ref([])
const redirectUrl = ref()
redirectUrl.value = route.query.redirect || ''

const { initStorage } = useLayout()
initStorage()

const { dataTheme, overallStyle, dataThemeChange } = useDataThemeChange()
dataThemeChange(overallStyle.value)
const { title } = useNav()

const ruleForm = reactive({
  username: 'admin',
  // password: 'admin123',
  password: 'adminadmin',
})
async function init() {
  let optionsRes = await getTenants()
  tenantOptions.value = optionsRes
  if (proxy.$dev) {
    selectValue.value = proxy.uuid(tenantOptions.value, 'value', { optionsIndex: 0 })
  }
  proxy.$toast('成功')
}
init()

// 匹配本地缓存的菜单route是否包含在服务器返回的路由中, 如果不包含, 取服务器返回路由的第一个
const _findSubMenu = (menuItems, linkToFind, sendArr = []) => {
  for (const menuItem of menuItems) {
    if (menuItem.visable && menuItem.visable === true) {
      if (menuItem.link && !sendArr[1]) {
        sendArr[1] = menuItem.link
      }
      if (menuItem.link === linkToFind && linkToFind) {
        sendArr[0] = linkToFind
      } else {
        if (menuItem.submenu && menuItem.submenu.length > 0) {
          _findSubMenu(menuItem.submenu, linkToFind, sendArr)
        }
      }
    }
  }
  return sendArr
}

const onLogin = async (formEl) => {
  await proxy.validForm(formEl)
  let encRes = await encrypt(ruleForm.password)
  const encryptor = new JSEncrypt()
  const publickKey = encRes.communicationKey
  encryptor.setPublicKey(publickKey)
  const pwd = encryptor.encrypt(ruleForm.password)
  console.log(`77 pwd`, pwd)
  const loginParams = {
    username: ruleForm.username,
    password: pwd,
    sysdomain: selectValue.value,
  }
  console.log(`69 loginParams`, loginParams)
  let loginRes = await login(loginParams)
  let token = `${loginRes.tokenType} ${loginRes.token}`
  proxy.setStorage('token', token)
  let menuRes = await getMenu()
  console.log(`37 menuRes`, menuRes)
  let matchedRouteArr = _findSubMenu(menuRes, redirectUrl.value)
  console.log(`85 matchedRouteArr`, matchedRouteArr)
  return initRouter().then(() => {
    let jumpPath = matchedRouteArr[0] || matchedRouteArr[1]
    router.push(jumpPath).then(() => {
      message('登录成功11', { type: 'success' })
    })
  })
  // router.push('/welcome' || matchedRouteArr[0] || matchedRouteArr[1]).then(() => {
  //   proxy.$toast('登录成功')
  // })
}

const onLogin2 = () => {
  let token = `测试登录`
  proxy.setStorage('token', token)
  return initRouter().then(() => {
    console.log(`97 redirectUrl.value`, redirectUrl.value)
    router.push(redirectUrl.value || '/test/t2').then(() => {
      message('登录成功', { type: 'success' })
    })
  })
}

/** 使用公共函数，避免`removeEventListener`失效 */
function onkeypress({ code }: KeyboardEvent) {
  if (code === 'Enter') {
    onLogin(ruleFormRef.value)
  }
}

onMounted(() => {
  window.document.addEventListener('keypress', onkeypress)
})

onBeforeUnmount(() => {
  window.document.removeEventListener('keypress', onkeypress)
})
</script>

<template>
  <div class="select-none">
    <img :src="bg" class="wave" />
    <div class="flex-c absolute right-5 top-3">
      <!-- 主题 -->
      <el-switch
        v-model="dataTheme"
        inline-prompt
        :active-icon="dayIcon"
        :inactive-icon="darkIcon"
        @change="dataThemeChange"
      />
    </div>
    <div class="login-container">
      <div class="img">
        <component :is="toRaw(illustration)" />
      </div>

      <div class="login-box">
        <div class="login-form">
          <avatar class="avatar" />
          <Motion>
            <h2 class="outline-none">{{ title }}</h2>
          </Motion>

          <el-form ref="ruleFormRef" :model="ruleForm" :rules="loginRules" size="large">
            <Motion :delay="100">
              <el-form-item
                :rules="[
                  {
                    required: true,
                    message: '请输入账号',
                    trigger: 'blur',
                  },
                ]"
                prop="username"
              >
                <o-select
                  v-model="selectValue"
                  :options="tenantOptions"
                  label="name"
                  width="100%"
                  placeholder="请选择租户"
                />
              </el-form-item>
            </Motion>
            <Motion :delay="100">
              <el-form-item
                :rules="[
                  {
                    required: true,
                    message: '请输入账号',
                    trigger: 'blur',
                  },
                ]"
                prop="username"
              >
                <el-input v-model="ruleForm.username" clearable placeholder="账号" :prefix-icon="useRenderIcon(User)" />
              </el-form-item>
            </Motion>

            <Motion :delay="150">
              <el-form-item prop="password">
                <el-input
                  v-model="ruleForm.password"
                  clearable
                  show-password
                  placeholder="密码"
                  :prefix-icon="useRenderIcon(Lock)"
                />
              </el-form-item>
            </Motion>

            <Motion :delay="250">
              <el-button
                class="w-full mt-4"
                size="default"
                type="primary"
                :loading="loading"
                @click="onLogin(ruleFormRef)"
              >
                登录
              </el-button>
            </Motion>
            <Motion :delay="250">
              <el-button
                class="w-full mt-4"
                size="default"
                type="primary"
                :loading="loading"
                @click="onLogin2(ruleFormRef)"
              >
                本地登录
              </el-button>
            </Motion>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('@/style/login.css');
</style>

<style lang="scss" scoped>
:deep(.el-input-group__append, .el-input-group__prepend) {
  padding: 0;
}
</style>
