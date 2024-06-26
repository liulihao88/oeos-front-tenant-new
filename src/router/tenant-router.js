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
        path: '/apps/bucket/objectexplorer',
        name: 'Objectexplorer',
        component: () => import('@/views/bucket/objectexplorer.vue'),
        meta: {
          icon: 'ep:home-filled',
          title: '桶概览',
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
      icon: 'ep:home-filled',
      title: '测试页',
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
    ],
  },
  {
    path: '/test3',
    component: Layout,
    redirect: '/test/t3',
    meta: {
      icon: 'ep:home-filled',
      title: '测试页',
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
]
