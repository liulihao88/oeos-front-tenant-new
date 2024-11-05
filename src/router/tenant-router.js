const Layout = () => import('@/layout/index.vue')
export default [
  {
    id: 'TM000',
    path: '/overview',
    component: Layout,
    meta: {
      icon: 'ep:home-filled',
      title: '租户概览',
    },
    children: [
      {
        path: '/overview',
        name: 'Overview',
        component: () => import('@/views/overview/index.vue'),
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
      icon: 'ep:home-filled',
      title: '空间管理222',
    },
    redirect: '/bucket/management',
    children: [
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
              // showParent: true,
            },
            component: () => import('@/views/bucket/managementDetail.vue'),
          },
        ],
      },
      {
        id: 'TM011',
        path: '/bucket/management',
        name: 'Management',
        component: () => import('@/views/bucket/management.vue'),
        meta: {
          icon: 'ep:home-filled',
          title: '桶列表',
        },
      },
      {
        id: 'TM012',
        path: '/bucket/objectexplorer',
        name: 'Objectexplorer',
        component: () => import('@/views/bucket/objectexplorer.vue'),
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
    redirect: '/object/search',
    meta: {
      icon: 'ep:home-filled',
      title: '空间浏览',
    },
    children: [
      {
        id: 'TM031',
        path: '/object/search',
        name: 'Search',
        component: () => import('@/views/object/search.vue'),
        meta: {
          icon: 'ep:home-filled',
          title: '简单搜索',
        },
      },
      {
        id: 'TM032',
        path: '/object/advancesearch',
        name: 'AdvanceSearch',
        component: () => import('@/views/object/advanceSearch.vue'),
        meta: {
          icon: 'ep:home-filled',
          title: '高级搜索',
        },
      },
      {
        id: 'TM034',
        path: '/object/unfrezze',
        name: 'Unfrezze',
        component: () => import('@/views/object/unfrezze.vue'),
        meta: {
          icon: 'ep:home-filled',
          title: '解冻浏览',
        },
      },
    ],
  },
  {
    id: 'TM020',
    path: '/task',
    component: Layout,
    redirect: '/task/management',
    meta: {
      icon: 'ep:home-filled',
      title: '任务管理',
    },
    children: [
      {
        id: 'TM021',
        path: '/task/management',
        name: 'TaskManagement',
        component: () => import('@/views/task/management.vue'),
        meta: {
          icon: 'ep:home-filled',
          title: '桶任务',
        },
      },
      {
        id: 'TM022',
        path: '/task/schedule',
        name: 'Schedule',
        component: () => import('@/views/task/schedule.vue'),
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
    redirect: '/security/user',
    meta: {
      icon: 'ep:home-filled',
      title: '安全权限',
    },
    children: [
      {
        id: 'TM041',
        path: '/security/user',
        name: 'User',
        component: () => import('@/views/security/user.vue'),
        meta: {
          icon: 'ep:home-filled',
          title: '用户管理',
        },
      },
      {
        path: '/security/user',
        meta: {
          title: '用户管理',
        },
        children: [
          {
            path: '/security/user/addUser',
            name: 'addUser',
            meta: {
              title: '用户处理',
              activePath: '/security/user',
              showLink: false,
              keepAlive: true,
            },
            component: async () => await import('@/views/security/addUser.vue'),
          },
        ],
      },
      {
        id: 'TM042',
        path: '/security/group',
        name: 'Group',
        component: () => import('@/views/security/group.vue'),
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
    redirect: '/test/t1',
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
        component: () => import('@/views/test/t1.vue'),
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
    redirect: '/test/t2',
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
        component: () => import('@/views/test/t2.vue'),
        meta: {
          title: '测试页2',
          showLink: true,
        },
      },
      {
        path: '/test/t22',
        name: 'T22',
        component: () => import('@/views/test/t22.vue'),
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
    redirect: '/test/t3',
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
        component: () => import('@/views/test/t3.vue'),
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
    redirect: '/test/t4',
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
        component: () => import('@/views/test/t4.vue'),
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
    redirect: '/test/t5',
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
        component: () => import('@/views/test/t5.vue'),
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
    redirect: '/test/t6',
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
        component: () => import('@/views/test/t6.vue'),
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
    redirect: '/feature/management',
    meta: {
      icon: 'ep:home-filled',
      title: '服务管理',
    },
    children: [
      {
        id: 'TM051',
        path: '/feature/command',
        name: 'InnerCommand',
        component: () => import('@/views/system/innerCommand.vue'),
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
    redirect: '/monitor/event',
    meta: {
      icon: 'ep:home-filled',
      title: '租户监控',
    },
    children: [
      {
        id: 'TM061',
        path: '/monitor/event',
        name: 'Event',
        component: () => import('@/views/system/event.vue'),
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
    redirect: '/config/default',
    meta: {
      icon: 'ep:home-filled',
      title: '系统配置',
    },
    children: [
      {
        id: 'TM071',
        path: '/config/default',
        name: 'DefaultConfig',
        component: () => import('@/views/system/defaultConfig.vue'),
        meta: {
          icon: 'ep:home-filled',
          title: '默认配置',
          showParent: true,
        },
      },
    ],
  },
]
