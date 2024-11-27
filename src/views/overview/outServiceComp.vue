<script setup lang="ts">
import { ref, getCurrentInstance, computed } from 'vue'
const { proxy } = getCurrentInstance()

const props = defineProps({
  servicePoint: {
    type: Array,
    default: () => [],
    required: true,
  },
})

const itemList = computed(() => {
  return [
    {
      label: '服务名称',
      value: props.servicePoint?.[0]?.name,
      img: 'overview/group1',
    },
    {
      label: '服务状态',
      value: props.servicePoint?.[0]?.status,
      img: 'overview/group2',
    },
    {
      label: '服务端口',
      value: props.servicePoint?.[0]?.port,
      img: 'overview/group3',
    },
    {
      label: '节点数量',
      value: props.servicePoint?.[0]?.serveCount,
      img: 'overview/group4',
    },
  ]
})
</script>

<template>
  <div class="box">
    <o-title title="对外服务信息" type="simple">
      <template #icon>
        <g-img src="overview/overview-service" class="mr" />
      </template>
    </o-title>
    <div class="top">
      <div v-for="(v, i) in itemList" :key="i" class="top-item">
        <g-img :src="v.img" class="mr2" width="43" />
        <div>
          <div class="bold tc">{{ v.value }}</div>
          <div class="cl-45 tc">{{ v.label }}</div>
        </div>
      </div>
    </div>
    <div class="bottom">
      <div v-for="(v, i) in props.servicePoint?.[0]?.endpoints" :key="i" class="bottom-item">
        <div class="num-box">0{{ i + 1 }}</div>
        <div class="runtime-item-box">
          <div>
            <span class="cl-45 mr">启动时间:</span>
            <span>
              {{ proxy.formatTimeByRule(v.startTime) }}
            </span>
          </div>
          <div>
            <span class="cl-45 mr">运行时长:</span>
            <span>
              {{ proxy.formatTimeByRule(v.upTime, 'uptime') }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.box {
  margin-bottom: 16px;
}

.top {
  display: flex;
  align-items: center;
  justify-content: space-between;

  .top-item {
    display: flex;
  }
}

.bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 64px;
  margin-top: 16px;
  font-size: 12px;

  .bottom-item {
    display: flex;
    flex: 1;
    min-height: 63px;
    margin: 0 8px 0 0;
    background: #fff;
    border: 1px solid #d7e0f4;
    border-radius: 5px;

    .num-box {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 30px;
      background: #f2f6ff;
      border-radius: 5px 0 0 5px;
    }

    .runtime-item-box {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      width: 100%;
      padding: 4px;
    }
  }

  .bottom-item:last-child {
    margin: 0;
  }
}
</style>
