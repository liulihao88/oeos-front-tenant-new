const Layout = () => import('@/layout/index.vue')
import DarkSvg from '@/assets/svg/dark.svg'
import DaySvg from '@/assets/svg/day.svg'
export default [
  {
    id: 'TM000',
    path: '/apps/overview',
    component: Layout,
    meta: {
      icon: 'ep:home-filled',
      title: '租户概览',
    },
    children: [
      {
        path: '/apps/overview',
        name: 'Overview',
        component: 'overview/index',
        meta: {
          icon: 'ep:home-filled',
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
      icon: 'notic.png',
      title: '空间管理222',
    },
    children: [
      {
        id: 'TM011',
        path: '/bucket/management',
        name: 'Management',
        component: 'bucket/management',
        meta: {
          icon: 'cc/bg.png',
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
          icon: 'ep:home-filled',
          title: '桶浏览',
        },
      },
    ],
  },
  {
    id: 'TM030',
    path: '/object',
    component: Layout,
    meta: {
      icon: DarkSvg,
      title: '空间浏览',
    },
    children: [
      {
        id: 'TM031',
        path: '/object/search',
        name: 'Search',
        component: 'object/search',
        meta: {
          icon: DarkSvg,
          title: '简单搜索',
        },
      },
      {
        id: 'TM032',
        path: '/object/advancesearch',
        name: 'AdvanceSearch',
        component: 'object/advancesearch',
        meta: {
          icon: DaySvg,
          title: '高级搜索',
        },
      },
      {
        id: 'TM034',
        path: '/object/unfrezze',
        name: 'Unfrezze',
        component: 'object/unfrezze',
        meta: {
          icon: () => import('../assets/svg/day.svg'),
          title: '解冻浏览',
        },
      },
    ],
  },
  {
    id: 'TM020',
    path: '/task',
    component: Layout,
    meta: {
      icon: 'ep:home-filled',
      title: '任务管理',
    },
    children: [
      {
        id: 'TM021',
        path: '/task/management',
        name: 'TaskManagement',
        component: 'task/management.vue',
        meta: {
          icon: 'ep:home-filled',
          title: '桶任务',
        },
      },
      {
        id: 'TM022',
        path: '/task/schedule',
        name: 'Schedule',
        component: 'task/schedule',
        meta: {
          icon: 'ep:home-filled',
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
      icon: 'ep:home-filled',
      title: '安全权限',
    },
    children: [
      {
        id: 'TM041',
        path: '/security/user',
        name: 'User',
        component: 'security/user.vue',
        meta: {
          icon: 'ep:home-filled',
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
          icon: 'ep:home-filled',
          title: '组管理',
        },
      },
    ],
  },
  {
    path: '/test',
    component: Layout,
    meta: {
      icon: 'ep:home-filled',
      showLink: import.meta.env.MODE === 'development',
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
      showLink: import.meta.env.MODE === 'development',
      icon: 'ep:home-filled',
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
      showLink: import.meta.env.MODE === 'development',
      icon: 'ep:home-filled',
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
      showLink: import.meta.env.MODE === 'development',
      icon: 'ep:home-filled',
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
      showLink: import.meta.env.MODE === 'development',
      icon: 'ep:home-filled',
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
      showLink: import.meta.env.MODE === 'development',
      icon: 'ep:home-filled',
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
      icon: 'ep:home-filled',
      title: '服务管理',
    },
    children: [
      {
        id: 'TM051',
        path: '/feature/command',
        name: 'InnerCommand',
        component: 'system/innerCommand',
        meta: {
          icon: 'ep:home-filled',
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
      icon: 'ep:home-filled',
      title: '租户监控',
    },
    children: [
      {
        id: 'TM061',
        path: '/monitor/event',
        name: 'Event',
        component: 'system/event',
        meta: {
          icon: 'ep:home-filled',
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
      icon: 'ep:home-filled',
      title: '系统配置',
    },
    children: [
      {
        id: 'TM071',
        path: '/config/default',
        name: 'DefaultConfig',
        component: 'system/defaultConfig',
        meta: {
          icon: 'ep:home-filled',
          title: '默认配置',
          showParent: true,
        },
      },
    ],
  },
]
