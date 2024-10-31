const Layout = () => import('@/layout/index.vue')
export default [
  {
    path: '/apps',
    name: 'Overview',
    component: Layout,
    meta: {
      icon: 'ep:home-filled',
      title: '租户概览',
    },
    children: [
      {
        path: '/apps/overview',
        name: 'Overview',
        component: () => import('@/views/overview/index.vue'),
        meta: {
          icon: 'ep:home-filled',
          title: '租户概览',
          path: '/apps/overview',
        },
      },
    ],
  },
  {
    path: '/apps/bucket',
    component: Layout,
    redirect: '/apps/bucket/management',
    meta: {
      icon: 'ep:home-filled',
      title: '空间管理',
    },
    children: [
      {
        path: '/apps/bucket/management',
        name: 'Management',
        component: () => import('@/views/bucket/management.vue'),
        meta: {
          icon: 'ep:home-filled',
          title: '桶列表',
        },
      },
      {
        path: '/apps/bucket/management',
        meta: {
          title: '桶列表',
        },
        children: [
          {
            path: '/apps/bucket/management/detail',
            name: 'ManagementDetail',
            meta: {
              title: '桶详情',
              activePath: '/apps/bucket/management',
              showLink: false,
              keepAlive: true,
            },
            component: async () => await import('@/views/bucket/managementDetail.vue'),
          },
        ],
      },
      {
        path: '/apps/bucket/objectexplorer',
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
    path: '/apps/object',
    component: Layout,
    redirect: '/apps/object/search',
    meta: {
      icon: 'ep:home-filled',
      title: '空间浏览',
    },
    children: [
      {
        path: '/apps/object/search',
        name: 'Search',
        component: () => import('@/views/spaceScan/search.vue'),
        meta: {
          icon: 'ep:home-filled',
          title: '简单搜索',
        },
      },
      {
        path: '/apps/object/advancesearch',
        name: 'AdvanceSearch',
        component: () => import('@/views/spaceScan/advanceSearch.vue'),
        meta: {
          icon: 'ep:home-filled',
          title: '高级搜索',
        },
      },
      {
        path: '/apps/task/unfrezze',
        name: 'Unfrezze',
        component: () => import('@/views/spaceScan/unfrezze.vue'),
        meta: {
          icon: 'ep:home-filled',
          title: '解冻浏览',
        },
      },
    ],
  },
  {
    path: '/apps/task',
    component: Layout,
    redirect: '/apps/task/management',
    meta: {
      icon: 'ep:home-filled',
      title: '任务管理',
    },
    children: [
      {
        path: '/apps/task/management',
        name: 'TaskManagement',
        component: () => import('@/views/task/management.vue'),
        meta: {
          icon: 'ep:home-filled',
          title: '桶任务',
        },
      },
      {
        path: '/apps/task/schedule',
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
    path: '/apps/security',
    component: Layout,
    redirect: '/apps/security/user',
    meta: {
      icon: 'ep:home-filled',
      title: '安全权限',
    },
    children: [
      {
        path: '/apps/security/user',
        name: 'User',
        component: () => import('@/views/security/user.vue'),
        meta: {
          icon: 'ep:home-filled',
          title: '用户管理',
        },
      },
      {
        path: '/apps/security/user',
        meta: {
          title: '用户管理',
        },
        children: [
          {
            path: '/apps/security/user/addUser',
            name: 'addUser',
            meta: {
              title: '用户处理',
              activePath: '/apps/security/user',
              showLink: false,
              keepAlive: true,
            },
            component: async () => await import('@/views/security/addUser.vue'),
          },
        ],
      },
      {
        path: '/apps/security/group',
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
    path: '/apps/feature',
    component: Layout,
    redirect: '/apps/feature/management',
    meta: {
      icon: 'ep:home-filled',
      title: '服务管理',
    },
    children: [
      {
        path: '/apps/feature/command',
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
    path: '/apps/monitor',
    component: Layout,
    redirect: '/apps/monitor/event',
    meta: {
      icon: 'ep:home-filled',
      title: '租户监控',
    },
    children: [
      {
        path: '/apps/monitor/event',
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
    path: '/apps/config',
    component: Layout,
    redirect: '/apps/config/default',
    meta: {
      icon: 'ep:home-filled',
      title: '系统配置',
    },
    children: [
      {
        path: '/apps/config/default',
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

  // {
  //   path: '/test3',
  //   component: Layout,
  //   redirect: '/test3/t3',
  //   meta: {
  //     icon: 'ep:home-filled',
  //     title: '测试页',
  //     rank: 0,
  //   },
  //   children: [
  //     {
  //       path: '/test3/t3',
  //       name: 'T3',
  //       redirect: '/test3/t3/t4',
  //       component: () => import('@/views/test/t3.vue'),
  //       meta: {
  //         title: '测试页3',
  //       },
  //       children: [
  //         {
  //           path: '/test3/t3/t4',
  //           name: 'T4',
  //           component: () => import('@/views/test/t4.vue'),
  //           meta: {
  //             title: '测试页4',
  //           },
  //         },
  //         {
  //           path: '/test3/t3/t5',
  //           name: 'T5',
  //           component: () => import('@/views/test/t5.vue'),
  //           meta: {
  //             title: '测试页5',
  //           },
  //         },
  //       ],
  //     },
  //     {
  //       path: '/t6',
  //       name: 'T6',
  //       component: () => import('@/views/test/t6.vue'),
  //       meta: {
  //         title: '测试页6',
  //       },
  //     },
  //   ],
  // },
]
