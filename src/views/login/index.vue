<script setup>
import Motion from './utils/motion'
import { useRouter, useRoute } from 'vue-router'
import { useNav } from '@/layout/hooks/useNav'
import { useLayout } from '@/layout/hooks/useLayout'
import { initRouter, getTopMenu } from '@/router/utils'
import { useRenderIcon } from '@/components/ReIcon/src/hooks'
import { ref, reactive, toRaw, onMounted, onBeforeUnmount, getCurrentInstance } from 'vue'
import { useDataThemeChange } from '@/layout/hooks/useDataThemeChange'
import LeftSide from '@/views/login/leftSide.vue'

import { getTenants, encrypt, login, getMenu, getFormat, getInitLogo, encryptionPassword } from '@/api/login.ts'
import useBucketList from '@/hooks/getBucketList.ts'
const bucketList = useBucketList()

import globalLogoSettings from '@/config/settings.ts'
import Lock from '@iconify-icons/ri/lock-fill'
import User from '@iconify-icons/ri/user-3-fill'

import useLogoSettings from '@/store/modules/logoSettings.ts'
const storeLogoSettings = useLogoSettings()

defineOptions({
  name: 'Login',
})
const { proxy } = getCurrentInstance()
const router = useRouter()
const route = useRoute()
const loading = ref(false)
const ruleFormRef = ref(null)
const tenantOptions = ref([])
const redirectUrl = ref()

redirectUrl.value = route.query.redirect || ''

const { initStorage } = useLayout()
initStorage()

const rules = {
  username: [proxy.validate()],
  password: [proxy.validate()],
  tenantId: [proxy.validate('请选择租户')],
}

const { dataTheme, overallStyle, dataThemeChange } = useDataThemeChange()
dataThemeChange(overallStyle.value)
const { title } = useNav()

const ruleForm = reactive({
  username: 'admin',
  tenantId: '',
  password: 'adminadmin',
})
async function init() {
  let optionsRes = await getTenants()
  tenantOptions.value = optionsRes
  if (proxy.$dev) {
    let nameIndex = tenantOptions.value.findIndex((v) => v.name === 'liu')
    ruleForm.tenantId = proxy.uuid(tenantOptions.value, 'value', { optionsIndex: nameIndex === -1 ? 0 : nameIndex })
  }
}
init()
const logoInit = async () => {
  storeLogoSettings.changeSettings(globalLogoSettings.nativeLogo.favariteIcon)
  let res = await getInitLogo()
  proxy.setStorage('tenant-logo-settings', res)
  storeLogoSettings.changeSettings(res)
}
logoInit()

// 匹配本地缓存的菜单route是否包含在服务器返回的路由中, 如果不包含, 取服务器返回路由的第一个
const _findSubMenu = (menuItems, pathToFind, sendArr = []) => {
  for (const menuItem of menuItems) {
    if (menuItem.path && !sendArr[1]) {
      sendArr[1] = menuItem.path
    }
    if (menuItem.path === pathToFind && pathToFind) {
      sendArr[0] = pathToFind
    } else {
      if (menuItem.children && menuItem.children.length > 0) {
        _findSubMenu(menuItem.children, pathToFind, sendArr)
      }
    }
  }
  return sendArr
}

const onLogin = async (formEl) => {
  await proxy.validForm(formEl)
  let genPwdList = await encryptionPassword(ruleForm.password)
  const loginParams = {
    username: ruleForm.username,
    password: genPwdList[0],
    sysdomain: ruleForm.tenantId,
  }
  let loginRes = await login(loginParams)
  let token = `${loginRes.tokenType} ${loginRes.token}`
  proxy.setStorage('tenant-token', token)

  let allSettledArr = [getFormat()].concat(
    loginRes.roles.length === 1 && loginRes.roles[0] == 'ROLE_ADMIN_MONITOR'
      ? []
      : [bucketList.update({ showError: false })],
  )

  Promise.allSettled(allSettledArr).then((res) => {
    if (res[0].status === 'fulfilled') {
      proxy.setStorage('tenant-time-rule', res[0].value)
    } else {
      proxy.setStorage('tenant-time-rule', {
        date: 'YYYY-MM-DD',
        time: 'HH:mm:ss',
        datetime: 'YYYY-MM-DD HH:mm:ss',
        uptime: 'DD 天 HH 时 mm 分 ss 秒',
        speed1s: 'MB/s',
      })
    }
  })
  return initRouter().then((routerRes) => {
    const tenantName = tenantOptions.value.find((v) => v.value === ruleForm.tenantId).name
    if (tenantName !== proxy.getStorage('tenant-sysdomain')?.tenantName) {
      redirectUrl.value = ''
    }
    proxy.setStorage('tenant-sysdomain', {
      tenantId: ruleForm.tenantId,
      tenantName: tenantName,
      loginName: ruleForm.username,
    })
    let matchedRouteArr = _findSubMenu(proxy.getStorage('tenant-async-routes'), redirectUrl.value)
    let jumpPath = matchedRouteArr[0] || matchedRouteArr[1]
    router.push(jumpPath).then(() => {
      proxy.$toast('登录成功')
    })
  })
}

/** 使用公共函数，避免`removeEventListener`失效 */
function onkeypress(event) {
  if (event.code === 'Enter') {
    onLogin(ruleFormRef.value)
  }
}
const customTenantLabel = (obj) => {
  return `${obj.name} - ${obj.value}`
}

onMounted(() => {
  window.document.addEventListener('keypress', onkeypress)
})

onBeforeUnmount(() => {
  window.document.removeEventListener('keypress', onkeypress)
})
</script>

<template>
  <div class="login-box">
    <LeftSide />
    <div class="login-container">
      <div class="login-box">
        <div class="login-form">
          <Motion :delay="100">
            <h4 class="sign-el">Sign in</h4>
          </Motion>
          <el-form ref="ruleFormRef" :model="ruleForm" :rules="rules" size="large">
            <Motion :delay="100">
              <el-form-item prop="tenantId">
                <o-select
                  v-model="ruleForm.tenantId"
                  :options="tenantOptions"
                  :customLabel="customTenantLabel"
                  width="100%"
                  placeholder="请选择租户"
                />
              </el-form-item>
            </Motion>
            <Motion :delay="100">
              <el-form-item prop="username">
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
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
:deep(.el-input-group__append, .el-input-group__prepend) {
  padding: 0;
}

.login-box {
  display: flex;

  @media screen and (width <= 1180px) {
    .login-container {
      grid-gap: 9rem;
    }

    .login-form {
      width: 290px;
    }

    .login-form h2 {
      margin: 8px 0;
      font-size: 2.4rem;
    }

    .img img {
      width: 360px;
    }

    .avatar {
      width: 280px;
      height: 80px;
    }
  }

  @media screen and (width <= 968px) {
    .wave {
      display: none;
    }

    .img {
      display: none;
    }

    .login-container {
      grid-template-columns: 1fr;
    }

    .login-box {
      justify-content: center;
    }
  }

  .login-container {
    display: grid;
    flex: 2;
    grid-gap: 18rem;
    max-width: 100%;
    height: 100vh;
    padding: 0 2rem;
  }

  .login-box {
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    text-align: center;
  }

  .login-form {
    width: 360px;
  }

  .sign-el {
    margin-bottom: 24px;
    font-size: 3.2rem;
    font-weight: 400 !important;
    color: #194bb9;
    text-align: left;
  }
}
</style>
