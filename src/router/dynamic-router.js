const fightingRouter = [
  {
    id: 'TM000',
    path: '/overview',
    meta: {
      icon: 'ep:home-filled',
      title: '租户概览111',
    },
    children: [
      {
        path: '/overview',
        name: 'Overview',
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
    meta: {
      icon: 'ep:home-filled',
      title: '空间管理222',
    },
    children: [
      {
        id: 'TM012',
        path: '/bucket/management',
        meta: {
          title: '桶列表',
        },
        children: [
          {
            path: '/bucket/management/detail',
            name: 'ManagementDetail',
            meta: {
              title: '桶详情',
              activePath: '/bucket/management',
              showLink: false,
              keepAlive: true,
            },
          },
        ],
      },
      {
        id: 'TM011',
        path: '/bucket/management',
        name: 'Management',

        meta: {
          icon: 'ep:home-filled',
          title: '桶列表',
        },
      },
      {
        path: '/bucket/objectexplorer',
        name: 'Objectexplorer',
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
        meta: {
          icon: 'ep:home-filled',
          title: '简单搜索',
        },
      },
      {
        id: 'TM032',
        path: '/object/advancesearch',
        name: 'AdvanceSearch',
        meta: {
          icon: 'ep:home-filled',
          title: '高级搜索',
        },
      },
      {
        id: 'TM034',
        path: '/object/unfrezze',
        name: 'Unfrezze',

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

        meta: {
          icon: 'ep:home-filled',
          title: '桶任务',
        },
      },
      {
        id: 'TM022',
        path: '/task/schedule',
        name: 'Schedule',

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
          },
        ],
      },
      {
        id: 'TM042',
        path: '/security/group',
        name: 'Group',
        meta: {
          icon: 'ep:home-filled',
          title: '组管理',
        },
      },
    ],
  },
  {
    path: '/fighting',
    meta: {
      title: '加油',
    },
    children: [
      {
        path: '/fighting/index',
        name: 'Fighting',
        meta: {
          title: '加油',
        },
      },
    ],
  },
  {
    path: '/test',
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
        meta: {
          title: '测试页1',
          showLink: true,
        },
      },
    ],
  },
  {
    path: '/test2',
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
        meta: {
          title: '测试页2',
          showLink: true,
        },
      },
      {
        path: '/test/t22',
        name: 'T22',
        meta: {
          title: '测试页22',
          showLink: false,
        },
      },
    ],
  },
]
export default fightingRouter
