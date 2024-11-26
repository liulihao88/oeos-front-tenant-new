<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance()
import { getWarningOptions, tenantEventQuery, getInfoOverview } from '@/api/overviewApi.ts'
import { getLevels, getEventList } from '@/api/system.ts'

import OverviewUsedPie from '@/views/overview/overviewUsedPie.vue'
import OutServiceComp from '@/views/overview/outServiceComp.vue'

const details = ref({})
const eventData = ref([])
const tenantDetails = ref({})
const levelOptions = ref([])
const eventTotal = ref(0)

const data1 = ref([])
const columns1 = [
  {
    label: '服务ID',
    prop: 'id',
  },
  {
    label: '服务名称',
    prop: 'name',
  },
  {
    label: '服务状态',
    prop: 'serveStatus',
  },
  {
    label: '健康状态',
    prop: 'healthLevel',
  },
]
const columns2 = [
  {
    label: '存储池',
    prop: 'name',
  },
  {
    label: '对象总数量',
    prop: 'objectCount',
    width: 100,
  },
  {
    label: '对象总大小',
    prop: 'objectSize',
    width: 100,
    filter: (val) => proxy.formatBytes(val),
  },
  {
    label: '总体空间用量',
    useSlot: true,
    prop: 'usedSpace',
  },
]

// 根据id从小到大排列, 如 KS07, KS01 => KS01, KS07
const sortById = (source) => {
  if (!source.services) {
    return []
  }
  let copySource = proxy.clone(source.services)
  return copySource.sort((a, b) => {
    let aIdNum = Number(a.id.replace(/\D/g, ''))
    let bIdNum = Number(b.id.replace(/\D/g, ''))
    return aIdNum - bIdNum
  })
}

const init = async () => {
  let res = await getInfoOverview()
  details.value = res
  tenantDetails.value = res.tenant
  data1.value = sortById(res)
}
init()

const eventForm = ref({
  beginDatetime: '',
  endDatetime: '',
  levels: [],
  mark: null,
  pageNumber: 1,
  pageSize: 20,
})
const eventInit = async () => {
  let res = await getEventList(eventForm.value)
  eventData.value = res.details
  eventTotal.value = res.total
}
eventInit()

const getLevelOptions = async () => {
  let res = await getLevels()
  levelOptions.value = res
}
getLevelOptions()

const parseLevelType = (level) => {
  const map = {
    INFO: 'success',
    WARN: 'warning',
    ERROR: 'danger',
    FATAL: 'danger',
    DEBUG: 'primary',
  }
  return map[level]
}

const parseLevel = (level) => {
  let res = levelOptions.value.find((v) => v.value === level)?.name
  return res
}

const statusOptions = ref([
  { label: '标记确认', value: 'Awared' },
  { label: '确认解决', value: 'Solved' },
  { label: '取消解决', value: 'Ignored' },
])
const eventColumns = [
  {
    label: '事件信息',
    prop: 'message',
  },
  {
    label: '事件等级',
    prop: 'level',
    width: 100,
    useSlot: true,
  },
  {
    label: '服务',
    prop: 'appId',
    width: 100,
  },
  {
    label: '节点',
    prop: 'nodeId',
    width: 100,
  },
  {
    label: '发生时间',
    prop: 'datetime',
    width: proxy.TIME_WIDTH,
    filter: (val) => proxy.formatTimeByRule(val),
  },
]
const eventMore = () => {
  proxy.jump({ name: 'Event' })
}
</script>

<template>
  <div class="box">
    <el-row :gutter="16" class="m-b-16 h-300">
      <el-col :span="12">
        <div class="item-box">
          <o-title title="租户信息与状态" type="simple">
            <template #icon>
              <g-img :src="proxy.formatImg('overview/overview-tenant')" class="mr" />
            </template>
          </o-title>
          <div class="t-l-box">
            <div class="t-l-box-left">
              <div class="item-card" style="background: '#f2f6ff'">
                <div>桶数量</div>
                <div>{{ details.tenant?.bucketCount }}</div>
              </div>
              <div class="item-card" style="background: '#fef6e9'">
                <div>桶任务数量</div>
                <div>{{ details.tenant?.tenantCount }}</div>
              </div>
              <div class="item-card">
                <div>健康模式</div>
                <div>{{ details.health?.healthLevel }}</div>
              </div>
              <div class="item-card">
                <div>工作模式</div>
                <div>{{ details.workmode }}</div>
              </div>
            </div>
            <OverviewUsedPie :used="tenantDetails.allocateQuota" :total="tenantDetails.tenantQuota" class="pie-box" />
          </div>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="item-box">
          <o-title title="租户信息与状态" type="simple">
            <template #icon>
              <g-img :src="proxy.formatImg('overview/overview-space')" class="mr" />
            </template>
          </o-title>
          <div class="t-l-box">
            <div class="t-l-box-left">
              <div class="item-card">
                <div>总对象大小</div>
                <div v-if="details.object">
                  {{ proxy.formatBytes(details.object.objectSize) }}
                </div>
              </div>
              <div class="item-card">
                <div>总空闲量</div>
                <div v-if="details.primarySpace">
                  {{ proxy.formatBytes(details.primarySpace?.totalFreeCapacity) }}
                </div>
              </div>
              <div class="item-card">
                <div>对象总数量</div>
                <div>{{ details.object?.objectCount }}</div>
              </div>
              <div class="item-card">
                <div>空间剩余度</div>
                <div>{{ details.primarySpace?.capacityUsageLevel }}</div>
              </div>
            </div>
            <OverviewUsedPie
              class="pie-box"
              type="used"
              :used="tenantDetails.usedSpace"
              :total="tenantDetails.totalSpace"
            />
          </div>
        </div>
      </el-col>
    </el-row>
    <el-row :gutter="16" class="bottom-height">
      <el-col :span="12" class="h-100%">
        <div class="item-box o-a">
          <OutServiceComp :servicePoint="details.servicePoint" />
          <o-title title="租户关键服务状态" />
          <o-table ref="tableRef" :columns="columns1" :data="data1" :showPage="false" />
          <o-title title="存储信息" />
          <o-table ref="tableRef" :columns="columns2" :data="details.spaces" :showPage="false">
            <template #usedSpace="{ row, scope }">
              <template v-if="scope.$index !== -1">
                <g-capacity-progress class="w-100%" :total="row.totalSpace" :used="row.usedSpace" :row="row">
                  {{ proxy.formatBytes(row.usedSpace) }} / {{ proxy.formatBytes(row.totalSpace) }}
                </g-capacity-progress>
              </template>
            </template>
          </o-table>
        </div>
      </el-col>
      <el-col :span="12" class="h-100%">
        <div class="item-box h-100% o-a">
          <o-title title="租户事件列表" b="8" type="simple">
            <template #icon>
              <g-img :src="proxy.formatImg('overview/overview-event')" class="mr" />
            </template>
            <span class="ml">(共{{ eventTotal }}条)</span>
            <template #right>
              <el-button type="primary" @click="eventMore">
                <div class="f-st-ct">
                  <div>更多</div>
                  <o-icon name="arrow-right" color="#fff" size="12" />
                </div>
              </el-button>
            </template>
          </o-title>
          <o-table ref="tableRef" :columns="eventColumns" :data="eventData" :showPage="false">
            <template #level="{ scope, row }">
              <el-tag :type="parseLevelType(row.level)" effect="dark">
                {{ parseLevel(row.level) }}
              </el-tag>
            </template>
          </o-table>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<style lang="scss" scoped>
.bottom-height {
  height: calc(100% - 320px);
}

.item-box {
  height: 100%;
  padding: 8px;
  background-color: #fff;
}

.t-l-box {
  display: flex;
  height: calc(100% - 30px);

  .t-l-box-left {
    display: flex;
    flex: 1;
    flex-wrap: wrap;
    width: 100%;
    height: 100%;
  }

  .pie-box {
    width: 300px;
  }

  .item-card {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    width: calc(50% - 16px);
    padding: 8px;
    margin: 8px;
    text-align: center;
    background: var(--green);
    border: 1px solid #eee;
    border-radius: 1px;

    &:hover {
      box-shadow: 0 4px 24px 0 rgb(34 41 47 / 10%);
    }
  }
}

.box {
  :deep(.el-row) {
    min-width: 1200px;
  }
}
</style>
