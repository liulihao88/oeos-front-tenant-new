<script setup lang="ts">
import { ref, getCurrentInstance, nextTick, onMounted } from 'vue'
import {
  getGroupList,
  getGroupDetails,
  addNewGroupApi,
  deleteGroupApi,
  getGroupMember,
  getGroupMemberPermission,
  putGroupMemberPermission,
} from '@/api/securityApi.ts'
import GroupBaseInfo from '@/views/security/groupBaseInfo.vue'
import GroupMemberData from '@/views/security/groupMemberData.vue'
import BucketPermission from '@/views/security/bucketPermission.vue'

const { proxy } = getCurrentInstance()

const tableRef = ref(null)
const bucketPermissionRef = ref(null)
const groupBaseInfoRef = ref(null)
const groupBaseInfoEditRef = ref(null)
const groupMemberDataRef = ref(null)
const originData = ref([])
const searchValue = ref()
const isShow = ref(false)
const groupDetails = ref({})
const selectedRows = ref({})

const data = ref([])
const columns = [
  {
    label: '组名',
    prop: 'name',
  },
  {
    key: 'operation',
    label: '操作',
    width: 60,
    btns: [
      {
        content: '删除',
        handler: deleteRow,
      },
    ],
  },
]

async function deleteRow(row) {
  await deleteGroupApi(row.name)
  proxy.$toast('删除成功')
  init()
}

const searchHandler = () => {
  if (!searchValue.value) {
    data.value = proxy.clone(originData.value)
    return
  }
  data.value = originData.value.filter((item) => {
    return item.name.includes(searchValue.value)
  })
}

const _handleRowClick = () => {
  let localTaskName = proxy.getStorage('tenant-group-name') || ''
  let clickIdx = 0
  if (data.value.length === 0) {
    // newAdd()
    return
  }
  if (localTaskName) {
    let taskNameIdx = data.value.findIndex((item) => {
      return item.name === localTaskName
    })
    clickIdx = taskNameIdx === -1 ? 0 : taskNameIdx
  }
  tableRef.value.$refs.tableRef.setCurrentRow(data.value[clickIdx])
}
const init = async () => {
  let res = await getGroupList()
  data.value = res.map((v) => {
    return {
      name: v,
    }
  })
  originData.value = proxy.clone(data.value)
  searchHandler()
  _handleRowClick()
}
init()

const newAdd = async () => {
  isShow.value = true
  await nextTick()
  groupBaseInfoRef.value.open()
}
const handleCurrentChange = async (currentRow, oldCurrentRow) => {
  if (proxy.notEmpty(currentRow)) {
    proxy.setStorage('tenant-group-name', currentRow?.name ?? '')
    selectedRows.value = currentRow
    let res = await getGroupDetails(currentRow.name)
    groupDetails.value = res
    groupBaseInfoEditRef.value.open(res)
    groupMemberDataRef.value.init(currentRow.name)
    bucketPermissionRef.value.getPermission()
  }
}
const confirm = async () => {
  await proxy.validForm(groupBaseInfoRef.value.$refs.formRef)
  await addNewGroupApi(groupBaseInfoRef.value.form)
  proxy.$toast('新增成功')
  isShow.value = false
  proxy.setStorage('tenant-group-name', groupBaseInfoRef.value.form.groupname)
  init()
}

const saveAll = async () => {
  await proxy.validForm(groupBaseInfoEditRef.value.$refs.formRef)
  await addNewGroupApi(groupBaseInfoEditRef.value.form)
  let permissionData = await bucketPermissionRef.value.$getData()
  await putGroupMemberPermission(selectedRows.value.name, permissionData)
  proxy.$toast('保存成功')
}
</script>

<template>
  <div class="task-container">
    <div class="l">
      <div class="f-st-ct m-tb-16">
        <o-input
          v-model.trim="searchValue"
          v-debounce.200="searchHandler"
          title="组名"
          placeholder="请输入组名"
          size="small"
          @clear="searchHandler"
        />
        <el-button type="primary" class="ml" icon="el-icon-plus" size="small" @click="newAdd">新增组</el-button>
      </div>
      <div>
        <o-table
          ref="tableRef"
          :columns="columns"
          :data="data"
          :showPage="false"
          highlight-current-row
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
    <div class="r">
      <div v-if="originData.length === 0" class="h-100%">
        <o-empty content="暂无数据" class="h-100%" />
      </div>
      <div v-else>
        <o-title title="组基本信息" b="8">
          <el-button type="primary" class="ml" @click="saveAll">全部保存</el-button>
        </o-title>
        <GroupBaseInfo ref="groupBaseInfoEditRef" isEdit />

        <GroupMemberData ref="groupMemberDataRef" />
        <BucketPermission
          ref="bucketPermissionRef"
          :sendName="selectedRows.name"
          :src="getGroupMemberPermission"
          tableHeight="calc(100vh - 680px)"
        />
      </div>
    </div>

    <o-dialog ref="dialogRef" v-model="isShow" title="新增组" width="700px" @confirm="confirm">
      <GroupBaseInfo ref="groupBaseInfoRef" />
    </o-dialog>
  </div>
</template>

<style scoped lang="scss">
.task-container {
  display: flex;

  .l {
    position: absolute;
    z-index: 99;
    width: 280px;
    height: 100%;
    height: calc(100vh - 124px);
    padding: 8px;
    margin-right: 20px;
    overflow: auto;
    background-color: #fff;
    border-right: 1px solid #eee;
  }

  .r {
    flex: 1;
    padding: 8px;
    margin-left: 300px;
    background: #fff;

    .r-top {
      display: flex;
      align-items: center;
      margin-bottom: 16px;
    }

    .r-content {
      display: flex;
      flex: 1;
      justify-content: space-between;
      height: 100%;
      overflow: auto;
      background-color: #fff;

      .item {
        flex: 1;
        height: 100%;
        padding: 8px;
        overflow: auto;
        border-left: 1px solid #eee;
      }

      .item:last-child {
        border-right: 0;
      }
    }
  }
}
</style>
