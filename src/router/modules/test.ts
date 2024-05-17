const { VITE_HIDE_HOME } = import.meta.env
const Layout = () => import('@/layout/index.vue')

export default {
  path: '/test',
  name: 'test',
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
        showLink: VITE_HIDE_HOME === 'true' ? false : true,
      },
    },
    {
      path: '/test/t2',
      name: 'T2',
      component: () => import('@/views/test/t2.vue'),
      meta: {
        title: '测试页2',
        showLink: VITE_HIDE_HOME === 'true' ? false : true,
      },
    },
  ],
} satisfies RouteConfigsTable
