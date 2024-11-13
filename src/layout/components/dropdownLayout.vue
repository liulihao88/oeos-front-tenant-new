<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance()
import ModifyPassword from '@/layout/components/lay-sidebar/modifyPassword.vue'
import { useNav } from '@/layout/hooks/useNav'
import globalLogoSettings from '@/config/settings.ts'
import LogoutCircleRLine from '@iconify-icons/ri/logout-circle-r-line'
import useLogoSettings from '@/store/modules/logoSettings.ts'
const storeLogoSettings = useLogoSettings()
const modifyPasswordRef = ref(null)
const { logout } = useNav()
const modifyPasswordHandler = () => {
  modifyPasswordRef.value.open()
}
</script>

<template>
  <div>
    <el-dropdown trigger="click">
      <span class="el-dropdown-link navbar-bg-hover select-none">
        <!-- <img
          :src="
            storeLogoSettings.nativeLogo?.tenantManagementImage || globalLogoSettings.nativeLogo.tenantManagementImage
          "
          width="10px"
        /> -->
        <o-icon name="user" size="20" />
      </span>
      <template #dropdown>
        <el-dropdown-menu class="logout">
          <el-dropdown-item @click="modifyPasswordHandler">
            <o-icon name="edit" class="mr" />
            修改密码
          </el-dropdown-item>
          <el-dropdown-item @click="logout">
            <IconifyIconOffline :icon="LogoutCircleRLine" class="mr" />
            退出系统
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
    <ModifyPassword ref="modifyPasswordRef" />
  </div>
</template>
<style lang="scss" scoped>
.logout {
  width: 120px;

  ::v-deep(.el-dropdown-menu__item) {
    display: inline-flex;
    flex-wrap: wrap;
    min-width: 100%;
  }
}

.el-dropdown-link {
  display: flex;
  align-items: center;
  justify-content: space-around;
  height: 48px;
  padding: 10px;
  color: #000000d9;
  cursor: pointer;

  p {
    font-size: 14px;
  }

  img {
    width: 22px;
    height: 22px;
  }
}
</style>
