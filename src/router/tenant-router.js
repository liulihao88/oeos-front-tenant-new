const Layout = () => import('@/layout/index.vue')

import router from './index'
import { getStorage, isEmpty } from 'oeos-components'

import DarkSvg from '@/assets/svg/dark.svg'
import DaySvg from '@/assets/svg/day.svg'
import tenantViewSvg from '@/assets/svg/menu/tenant-view.svg'
import spaceManagementSvg from '@/assets/svg/menu/space-management.svg'
import BucketListSvg from '@/assets/svg/menu/bucket-list.svg'
import easySearchSvg from '@/assets/svg/menu/easy-search.svg'
import advanceSearchSvg from '@/assets/svg/menu/advance-search.svg'
import unfreezeViewSvg from '@/assets/svg/menu/unfreeze-view.svg'
import taskManagementSvg from '@/assets/svg/menu/task-management.svg'
import bucketTaskSvg from '@/assets/svg/menu/bucket-task.svg'
import taskPlanSvg from '@/assets/svg/menu/task-plan.svg'
import securityPermissionSvg from '@/assets/svg/menu/security-permission.svg'
import userManagemenetSvg from '@/assets/svg/menu/user-management.svg'
import groupManagementSvg from '@/assets/svg/menu/group-management.svg'
import bucketViewSvg from '@/assets/svg/menu/bucket-view.svg'
import spaceViewSvg from '@/assets/svg/menu/space-view.svg'
import serviceManageMentSvg from '@/assets/svg/menu/service-management.svg'
import innerCommandSvg from '@/assets/svg/menu/inner-command.svg'
import tenentControlSvg from '@/assets/svg/menu/tenent-control.svg'
import tenantEventSvg from '@/assets/svg/menu/tenant-event.svg'
import systemSettingSvg from '@/assets/svg/menu/system-setting.svg'
import defaultConfigSvg from '@/assets/svg/menu/default-config.svg'
import testSvg from '@/assets/svg/menu/test.svg'

const isDev = process.env.NODE_ENV === 'development'
export default [
  {
    id: 'TM000',
    path: '/apps/overview',
    component: Layout,
    meta: {
      icon: testSvg,
      title: '租户概览',
    },
    children: [
      {
        path: '/apps/overview',
        name: 'Overview',
        component: 'overview/index',
        meta: {
          icon: tenantViewSvg,
          title: '租户概览',
        },
      },
    ],
  },
  {
    id: 'TM010',
    path: '/bucket',
    component: Layout,
    meta: {
      icon: spaceManagementSvg,
      title: '空间管理',
    },
    children: [
      {
        id: 'TM011',
        path: '/bucket/management',
        name: 'Management',
        component: 'bucket/management',
        meta: {
          icon: BucketListSvg,
          title: '桶列表',
        },
      },
      {
        path: '/bucket/management',
        meta: {
          title: '桶列表',
          name: 'Management',
        },
        children: [
          {
            path: '/bucket/managementDetail',
            name: 'ManagementDetail',
            meta: {
              title: '桶详情',
              activePath: '/bucket/management',
              showLink: false,
              showParent: true,
            },
            component: 'bucket/managementDetail',
          },
        ],
      },
      {
        id: 'TM012',
        path: '/bucket/objectexplorer',
        name: 'Objectexplorer',
        component: 'bucket/objectexplorer',
        meta: {
          icon: bucketViewSvg,
          title: '桶浏览',
        },
      },
    ],
  },
  {
    id: 'TM020',
    path: '/object',
    component: Layout,
    meta: {
      icon: spaceViewSvg,
      title: '空间浏览',
    },
    children: [
      {
        id: 'TM021',
        path: '/object/search',
        name: 'Search',
        component: 'object/search',
        meta: {
          icon: easySearchSvg,
          title: '简单搜索',
        },
      },
      {
        id: 'TM022',
        path: '/object/advancesearch',
        name: 'AdvanceSearch',
        component: 'object/advancesearch',
        meta: {
          icon: advanceSearchSvg,
          title: '高级搜索',
        },
      },
      {
        id: 'TM023',
        path: '/object/unfrezze',
        name: 'Unfrezze',
        component: 'object/unfrezze',
        meta: {
          icon: unfreezeViewSvg,
          title: '解冻浏览',
        },
      },
    ],
  },
  {
    id: 'TM030',
    path: '/task',
    component: Layout,
    meta: {
      icon: taskManagementSvg,
      title: '任务管理',
    },
    children: [
      {
        id: 'TM031',
        path: '/task/management',
        name: 'TaskManagement',
        component: 'task/management.vue',
        meta: {
          icon: bucketTaskSvg,
          title: '桶任务',
        },
      },
      {
        id: 'TM032',
        path: '/task/schedule',
        name: 'Schedule',
        component: 'task/schedule',
        meta: {
          icon: taskPlanSvg,
          title: '任务计划',
        },
      },
    ],
  },

  {
    id: 'TM040',
    path: '/security',
    component: Layout,
    meta: {
      icon: securityPermissionSvg,
      title: '安全权限',
    },
    children: [
      {
        id: 'TM041',
        path: '/security/user',
        name: 'User',
        component: 'security/user.vue',
        meta: {
          icon: userManagemenetSvg,
          title: '用户管理',
        },
      },
      {
        path: '/security/user',
        meta: {
          title: '用户管理',
          name: 'User',
        },
        children: [
          {
            path: '/security/user/addUser',
            name: 'AddUser',
            meta: {
              title: '用户编辑',
              activePath: '/security/user',
              showLink: false,
              showParent: false,
            },
            beforeEnter: (to, from) => {
              if (isEmpty(getStorage('tenant-user-details'))) {
                router.push({ name: 'User' })
              }
            },
            component: 'security/addUser',
          },
        ],
      },
      {
        id: 'TM042',
        path: '/security/group',
        name: 'Group',
        component: 'security/group',
        meta: {
          icon: groupManagementSvg,
          title: '组管理',
        },
      },
    ],
  },
  {
    path: '/test',
    component: Layout,
    meta: {
      icon: testSvg,
      showLink: isDev,
      title: '测试页',
      rank: 0,
    },
    children: [
      {
        path: '/test/t1',
        name: 'T1',
        component: 'test/t1',
        meta: {
          title: '测试页1',
          showLink: true,
        },
      },
    ],
  },
  {
    path: '/test2',
    component: Layout,
    meta: {
      showLink: isDev,
      icon: testSvg,
      title: '测试页2顶部',
      rank: 0,
    },
    children: [
      {
        path: '/test/t2',
        name: 'T2',
        component: 'test/t2',
        meta: {
          title: '测试页2',
          showLink: true,
        },
      },
      {
        path: '/test/t22',
        name: 'T22',
        component: 'test/t22',
        meta: {
          title: '测试页22',
          showLink: false,
        },
      },
    ],
  },
  {
    path: '/test3',
    component: Layout,
    meta: {
      showLink: isDev,
      icon: testSvg,
      title: '测试页2顶部',
      rank: 0,
    },
    children: [
      {
        path: '/test/t3',
        name: 'T3',
        component: 'test/t3',
        meta: {
          title: '测试页3',
          showLink: true,
        },
      },
    ],
  },
  {
    path: '/test4',
    component: Layout,
    meta: {
      showLink: isDev,
      icon: testSvg,
      title: '测试页2顶部',
      rank: 0,
    },
    children: [
      {
        path: '/test/t4',
        name: 'T4',
        component: 'test/t4',
        meta: {
          title: '测试页4',
          showLink: true,
        },
      },
    ],
  },
  {
    path: '/test5',
    component: Layout,
    meta: {
      showLink: isDev,
      icon: testSvg,
      title: '测试页2顶部',
      rank: 0,
    },
    children: [
      {
        path: '/test/t5',
        name: 'T5',
        component: 'test/t5',
        meta: {
          title: '测试页5',
          showLink: true,
        },
      },
    ],
  },
  {
    path: '/test6',
    component: Layout,
    meta: {
      showLink: isDev,
      icon: testSvg,
      title: '测试页2顶部',
      rank: 0,
    },
    children: [
      {
        path: '/test/t6',
        name: 'T6',
        component: 'test/t6',
        meta: {
          title: '测试页6',
          showLink: true,
        },
      },
    ],
  },
  {
    id: 'TM050',
    path: '/feature',
    component: Layout,
    meta: {
      icon: serviceManageMentSvg,
      title: '服务管理',
    },
    children: [
      {
        id: 'TM051',
        path: '/feature/command',
        name: 'InnerCommand',
        component: 'system/innerCommand',
        meta: {
          icon: innerCommandSvg,
          title: '内置命令',
          showParent: true,
        },
      },
    ],
  },
  {
    id: 'TM060',
    path: '/monitor',
    component: Layout,
    meta: {
      icon: tenentControlSvg,
      title: '租户监控',
    },
    children: [
      {
        id: 'TM061',
        path: '/monitor/event',
        name: 'Event',
        component: 'system/event',
        meta: {
          icon: tenantEventSvg,
          title: '租户事件',
          showParent: true,
        },
      },
    ],
  },
  {
    id: 'TM070',
    path: '/config',
    component: Layout,
    meta: {
      icon: systemSettingSvg,
      title: '系统配置',
    },
    children: [
      {
        id: 'TM071',
        path: '/config/default',
        name: 'DefaultConfig',
        component: 'system/defaultConfig',
        meta: {
          icon: defaultConfigSvg,
          title: '默认配置',
          showParent: true,
        },
      },
    ],
  },
]
