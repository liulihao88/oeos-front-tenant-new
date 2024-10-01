<template>
  <b-row class="table-box-p">
    <b-col cols="12" class="table-main">
      <a-table
        v-b-heightControl
        :columns="columns"
        :data-source="tableALLData_V"
        :locale="tablenodata"
        :pagination="false"
      >
        <template v-slot:includeBucketNames="text, record, index">
          <div v-if="record.includeBucketNames">
            <span v-if="record.includeBucketNames.length <= 30">
              {{ record.includeBucketNames }}
            </span>
            <div v-else>
              <b-button
                v-b-popover.hover.html="`<div>${record.includeBucketNames.replaceAll('\n', '<br>')}</div>`"
                class="objectKey-el"
                variant="Secondary"
              >
                <span v-if="/.*[\u4e00-\u9fa5]+.*$/.test(record.includeBucketNames)">
                  {{ countBucketNameShowFn(record.includeBucketNames, 25, 20) }}
                </span>
                <span v-else>
                  {{ countBucketNameShowFn(record.includeBucketNames, 30, 25) }}
                </span>
              </b-button>
            </div>
          </div>
          <span v-else>所有桶</span>
        </template>
        <template v-slot:excludeBucketNames="text, record, index">
          <div v-if="record.excludeBucketNames">
            <span v-if="record.excludeBucketNames.length <= 30">
              {{ record.excludeBucketNames }}
            </span>
            <div v-else>
              <b-button
                v-b-popover.hover.html="`<div>${record.excludeBucketNames.replaceAll('\n', '<br>')}</div>`"
                class="objectKey-el"
                variant="Secondary"
              >
                <span v-if="/.*[\u4e00-\u9fa5]+.*$/.test(record.excludeBucketNames)">
                  {{ countBucketNameShowFn(record.excludeBucketNames, 25, 20) }}
                </span>
                <span v-else>
                  {{ countBucketNameShowFn(record.excludeBucketNames, 30, 25) }}
                </span>
              </b-button>
            </div>
          </div>
          <div v-else>-</div>
        </template>
        <template v-slot:taskContent="text, record, index">
          <div class="task-content">
            <span v-if="record.taskContent.length < 40">
              {{ record.taskContent ? record.taskContent : '-' }}
            </span>
            <b-button
              v-else
              v-b-popover.hover.html="
                `<div class='${record.taskContent.length > 40 ? 'sp-el-full' : ''}'>${record.taskContent.replaceAll(
                  '\n',
                  '<br>',
                )}</div>`
              "
              variant="Secondary"
            >
              {{ record.taskContent.substring(0, 30) + '...' }}
            </b-button>
          </div>
        </template>
        <template v-slot:contentLength="text, record, index">
          <div>
            {{ record.contentLength >= 0 ? countQuota(record.contentLength) : '-' }}
          </div>
        </template>
        <template v-slot:action="text, record, index">
          <div>
            {{ record.action }}
          </div>
        </template>
        <template v-slot:injectTime="text, record, index">
          <span>
            {{ record.injectTime ? $g.parseTime(record.injectTime) : '-' }}
          </span>
        </template>
        <template v-slot:saveDay="text, record, index">
          <span>{{ record.saveDay ? record.saveDay : '-' }}</span>
        </template>
        <template v-slot:keyPrefix="text, record, index">
          <span>{{ record.keyPrefix ? record.keyPrefix : '-' }}</span>
        </template>
        <template v-slot:preview="text, record, index">
          <div class="opreation-box">
            <!-- <ButtonTable
                        :record="record"
                        @clickSwichFn = "clickSwichFn"
                        @checkboxFn="checkboxFn"
                        @clickFn = "btnClickFn" ref = "swichEl"/> -->

            <div class="table-operation-btn-box">
              <div class="content-btn-box">
                <div class="switch-box btn-item">
                  <div v-if="record.enabled" class="mask-el" @click="clickSwichFn(record)" />
                  <Swich
                    ref="SwichEl"
                    :record="record"
                    :disabled="record.isON_Off"
                    class="swich-el btn-item"
                    @checkboxFn="checkboxFn"
                  />
                </div>
                <span
                  v-if="record.enabled"
                  v-b-toggle.sidebar-bucket
                  class="btn-item btn-item-2 line-el hover-el"
                  @click="btnClickFn('look', record)"
                >
                  查看
                </span>
                <span
                  v-else
                  v-b-toggle.sidebar-bucket
                  class="btn-item btn-item-2 line-el hover-el"
                  @click="btnClickFn('edit', record)"
                >
                  编辑
                </span>
                <span v-if="!record.enabled" class="btn-item hover-el" @click="btnClickFn('del', record)">删除</span>
                <span v-else class="btn-item false-el readonly-el">删除</span>
              </div>
            </div>
          </div>
          <!-- <div v-else><span class="btn-item"  @click="delItemFn(record)" >删除</span></div>  -->
        </template>
      </a-table>
    </b-col>
    <b-col cols="12" class="page-num-box">
      <PaginationTem
        :currentPage="currentPage"
        :totalRows="totalNum ? totalNum : 0"
        :perPage="perPage"
        :pageOptions="pageOptions"
        :listTotal="totalNum ? totalNum : 0"
        @paginationSelect="paginationSelect"
        @currentPageSelect="currentPageSelect"
      />
    </b-col>
  </b-row>
</template>

<script>
import Ripple from 'vue-ripple-directive'
import { VBTooltip, VBPopover } from 'bootstrap-vue'
import { VBToggle } from 'bootstrap-vue'

import apiBucketMigeration from '@/mixins/API/apiBucketMigeration'
//表格操作事件
const columns = [
  {
    title: '名称',
    dataIndex: 'name',
    key: '0',
    width: '12%',
    scopedSlots: { customRender: 'name' },
  },
  {
    title: '任务类型',
    dataIndex: 'action',
    key: '1',
    scopedSlots: { customRender: 'action' },
    width: '12%',
  },
  {
    title: '包含桶名',
    dataIndex: 'includeBucketNames',
    key: '2',
    width: '14%',
    scopedSlots: { customRender: 'includeBucketNames' },
  },
  {
    title: '例外桶名',
    dataIndex: 'excludeBucketNames',
    key: '3',
    scopedSlots: { customRender: 'excludeBucketNames' },
  },
  //   {
  //     title: 'key前缀',
  //     dataIndex: 'keyPrefix',
  //     key: '3',
  //     scopedSlots: { customRender: 'keyPrefix' },
  //   },
  {
    title: '保留期',
    dataIndex: 'saveDay',
    key: '4',
    width: '10%',
    scopedSlots: { customRender: 'saveDay' },
  },
  {
    title: '任务内容',
    dataIndex: 'taskContent',
    key: '5',
    scopedSlots: { customRender: 'taskContent' },
    width: '14%',
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: '6',
    width: '12%',
    scopedSlots: { customRender: 'createTime' },
  },
  {
    title: '操作',
    dataIndex: 'preview',
    width: '14%',
    key: '7',
    scopedSlots: { customRender: 'preview' },
  },
]

export default {
  components: {},
  directives: {
    'b-popover': VBPopover,
    'b-tooltip': VBTooltip,
    Ripple,
    'b-toggle': VBToggle,
    'b-heightControl': (el) => {
      el.style.height = 'calc(100vh - 320px)'
    },
  },
  mixins: [apiBucketMigeration],
  props: ['tableALLData', 'serverList', 'nodeList', 'totalNum', 'logLevelList'],
  data() {
    return {
      isMing: false,
      testSrc: '',
      canvasList: [],
      isShow: true,
      list: [
        {
          msrc: '',
          src: '',
          w: 15000,
          h: '900',
        },
      ],
      options: {
        getThumbBoundsFn(index) {},
      },
      tableALLData_V: [],
      perPage: 30,
      pageOptions: [10, 20, 30, 50, 80, 100],
      totalRows: 0,
      currentPage: 1,
      sortBy: '',
      sortDesc: false,
      sortDirection: 'asc',
      filter: null,
      filterOn: [],
      infoModal: {
        id: 'info-modal',
        title: '',
        content: '',
      },
      recodeArr: [],
      tipsStrV: '数据正在加速赶来，请稍后~',
      isOprate: false,
      imgShow: false,
      currentItem: null,
      imgUrl: '',
      imgTips: '',
      columns,
      expandedRowKeys: [],
      tablenodata: {
        mEmptyText: '数据正在加速赶来，请稍后~',
      },
      pagination: {
        total: 200,
        current: 1,
        pageSize: 20,
        currentKey: 'page',
        pageSizeKey: 'results',
      },
      scrollHeight: 400,
      selectedRowKeys: [],
      selectType: 'part',
      recodeSelectRowKeys: [],
    }
  },
  computed: {},
  watch: {
    tableALLData: {
      handler(val) {
        if (val) {
          if (val.length <= 0) {
            this.tablenodata.mEmptyText = '暂无数据'
            this.tableALLData_V = []
            return false
          } else {
            this.currentPageSelect(1)
          }
        }
      },
      deep: true,
      immediate: true,
    },
    tableALLData_V: {
      handler(val) {
        return val
      },
      deep: true,
      immediate: true,
    },
  },
  created() {
    if (this.tableALLData_V.length <= 0) {
      this.tablenodata.mEmptyText = '暂无数据'
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.setUpWidthType()
    })
  },
  methods: {
    countArrToNameFn(arr) {
      let strName = '-'
      if (arr && arr.length > 0) {
        strName = ''
        arr.map((item, index) => {
          if (index != 0) {
            strName += '、' + item
          } else {
            strName += item
          }
        })
      }
      return strName
    },
    countBucketNameShowFn(name, num1, num2) {
      console.log(name, '???countBucketNameShowFncountBucketNameShowFn')
      return name.length > num1 ? name.substring(0, num2) + '...' : name
    },
    btnClickFn(item, record) {
      this.$store.commit('bucketData/setBucketIsLook', false)
      if (item == 'edit' || item == 'look') {
        if (item == 'look') {
          this.$store.commit('bucketData/setBucketIsLook', true)
        }
        this.editItemFn(record)
      } else {
        this.delItemFn(record)
      }
    },
    editItemFn(record) {
      //   if (record.enabled) {
      //     this.$toast('正在启用中，不能修改！', 'warn')
      //     return false
      //   }
      this.API_objecthandleTaskInfo(
        record.key,
        (res) => {
          let newData = JSON.parse(JSON.stringify(record))
          newData.setData = res.details
          if (!newData.includeBuckets) {
            newData.includeBuckets = newData.setData.properties.includeBuckets
          }
          this.$emit('getEditData', res.details) //不传值也可，不在这里赋值
          this.$store.commit('bucketData/taskEditItemData', newData)
        },
        () => {
          this.$emit('getEditData', null)
          this.$store.commit('bucketData/taskEditItemData', null)
        },
      )
    },
    delItemFn(record) {
      this.$swal({
        title: '提示',
        text: '确定删除此任务吗？',
        icon: 'warning', //success
        showCancelButton: true,
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-outline-danger ml-1',
        },
        buttonsStyling: false,
      }).then((result) => {
        if (result.value) {
          this.API_deleteMeigrate(record.key, (res) => {
            this.$toast('操作成功！', 'success')
            this.$emit('initFn')
          })
        }
      })
    },
    switchCommon(record, val) {
      this.API_enableMeigrate(
        { id: record.key, enabled: val },
        (res) => {
          // this.$refs.swichEl.init('success', val)
          record.enabled = val
          this.$toast('操作成功！', 'success')
          this.$emit('initFn')
        },
        () => {
          //this.$refs.swichEl.init('error')
        },
      )
    },
    clickSwichFn(record) {
      this.$swal({
        title: '提示',
        text: '确定关闭此任务吗？',
        icon: 'warning', //success
        showCancelButton: true,
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-outline-danger ml-1',
        },
        buttonsStyling: false,
      }).then((result) => {
        if (result.value) {
          this.switchCommon(record, false)
        }
      })
    },
    checkboxFn(val, record) {
      this.switchCommon(record, val)
    },
    disabledType() {},
    delFn() {},
    countData(arr) {
      this.tableALLData_V = JSON.parse(JSON.stringify(arr))
      this.setUpWidthType()
    },
    //控制表格的容量列宽度
    setUpWidthType() {
      let tableP = document.querySelector('.oct-table-box')
      if (tableP) {
        let table = tableP.querySelector('.b-table')
        let _t = table.getElementsByTagName('thead')
        let arr = _t[0].children[0].children
        arr[0].style.width = '45%'
        arr[5].style.width = '10%'
      }
    },
    paginationSelect(num) {
      this.perPage = num
      let arr = this.tableALLData.slice(0, num)
      this.countData(arr)
      //this.$emit('setUpPageobjType', num, 'size') //后端未支持分页
    },
    currentPageSelect(num) {
      this.currentPage = num
      if (this.selectType == 'part') {
        //分页需要初始化选择项
        let isHave = false
        this.selectedRowKeys = []
        this.recodeSelectRowKeys.forEach((item) => {
          if (item.page == num) {
            item.keys.forEach((item) => {
              this.selectedRowKeys.push(item)
            })
            isHave = true
          }
        })
      }
      // this.$emit(
      //     'setUpPageobjType',
      //     num - 1 > 0 ? num - 1 : 0,
      //     'page',
      //     this.perPage
      // )//后端未支持分页
      if (num == 1) {
        this.paginationSelect(this.perPage)
      } else {
        let _index = (num - 1) * this.perPage
        let arr = this.tableALLData.slice(_index, num * this.perPage)
        this.countData(arr)
      }
    },
    onFiltered(filteredItems) {
      this.totalRows = filteredItems.length
      this.currentPage = 1
    },
  },
}
</script>
<style>
.switch-box-user {
  .status-disabled .custom-control-label::before {
    background: rgb(233 52 52 / 10%) !important;
  }
}
</style>
<style lang="scss" scoped>
@import url('@/assets/scss/common/common');
@import url('@/assets/scss/common/publish');

.btn-item {
  color: $logoColor;
  cursor: pointer;
}

.task-content {
  .btn {
    padding: 0;
    line-height: 18px;
    text-align: left;
  }
}

.table-box-p {
  width: 99.5%;
  margin: 0 auto;

  .opreation-box {
    @mixin commonLine {
      position: absolute;
      top: 40%;
      width: 1px;
      height: 11px;
      content: '';
      background: #dcdee0;
      transform: translateY(-50%);
    }

    position: relative;
    height: 20px;

    .table-operation-btn-box {
      position: relative;
      display: flex;
      width: 100%;

      .content-btn-box {
        position: relative;
        display: flex;
        margin-right: 18px;
        color: #4273f6;
        cursor: pointer;

        .btn-item {
          flex: 1;

          &.btn-item-2 {
            padding: 0 16px;
          }

          &.line-el {
            @mixin line {
              position: absolute;
              top: 4px;
              width: 1px;
              height: 14px;
              content: '';
              background: #dcdee0;
            }

            position: relative;

            &::after {
              @include line;

              right: 6px;
            }

            &::before {
              @include line;

              left: 6px;
            }
          }
        }

        .switch-box {
          position: relative;

          .mask-el {
            position: absolute;
            top: 0;
            left: 0;
            z-index: 10;
            width: 68px;
            height: 26px;
            cursor: pointer;
            background: red;
            opacity: 0;
          }
        }

        .false-el {
          color: #ccc;
        }

        &::after {
          @include commonLine;

          right: -10px;
        }

        &:nth-last-child(1) {
          &::after {
            opacity: 0;
          }
        }
      }
    }
  }

  .objectKey-el {
    padding: 0 !important;
    overflow: hidden;
    text-overflow: ellipsis; // width: 80%;
    white-space: nowrap;

    span {
      line-height: 18px;
    }
  }

  .overview-box {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 500;
    width: 100%;
    height: 100vh;
    background: rgb(0 0 0 / 30%);
    border-radius: 2px;

    .icon-class {
      position: absolute;
      top: 30px;
      right: 30px;
      z-index: 501;
      cursor: pointer;
      background: #fff;
      border-radius: 15px;
      fill: #fff;
    }

    .pswp__zoom-wrap {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    .tips {
      @include centerEl;

      position: relative;
      top: 45%;
      padding-left: 2rem;
      font-size: 1rem;
      line-height: 3rem;
      color: #fff;
    }

    .previewer-demo-img {
      @include centerEl;

      width: 300px;
      color: #fff;
      opacity: 0;
    }

    .opration-img {
      opacity: 0 !important;
    }

    .icon-close-fill {
      position: absolute;
      top: -1rem;
      right: -4rem;
      font-size: 2rem;
      cursor: pointer;
    }
  }

  .table-box {
    overflow-y: auto;
  }

  .page-num-box {
    height: 26px;
  }

  .table-main {
    margin-bottom: 50px;

    .flex-p {
      width: 67%;

      > span:nth-child(2) {
        margin-left: 12px;
      }
    }
  }
}
</style>
