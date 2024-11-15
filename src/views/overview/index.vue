<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance()
import { getWarningOptions, tenantEventQuery, getInfoOverview } from '@/api/overviewApi.ts'
import OverviewUsedPie from '@/views/overview/overviewUsedPie.vue'

const details = ref({})
const tenantDetails = ref({})

const init = async () => {
  let res = await getInfoOverview()
  details.value = res
  tenantDetails.value = res.tenant
}
init()
</script>

<template>
  <div>
    <el-row :gutter="16" class="m-b-16 h-300">
      <el-col :span="12">
        <div class="item-box">
          <o-title title="租户信息与状态" />
          <div class="t-l-box">
            <div class="t-l-box-left">
              <div class="item-card">
                <div>桶数量</div>
                <div>{{ details.tenant?.bucketCount }}</div>
              </div>
              <div class="item-card">
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
          <o-title title="租户信息与状态" />
          <div class="t-l-box">
            <div class="t-l-box-left">
              <div class="item-card">
                <div>总对象大小</div>
                <div v-if="details.object && details.object.objectSize">
                  {{ proxy.formatBytes(details.object.objectSize) }}
                </div>
              </div>
              <div class="item-card">
                <div>总空闲量</div>
                <div v-if="details.primarySpace && details.primarySpace.totalFreeCapacity">
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
        <div class="item-box">我是左边</div>
      </el-col>
      <el-col :span="12">
        <div class="item-box">我是右边</div>
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
</style>
