import { clearStorage } from 'oeos-components'
const Layout = () => import('@/layout/index.vue')

export default [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    beforeEnter(to, from) {
      if (from.fullPath === '/') {
        clearStorage('tenant-sysdomain')
      }
    },
    meta: {
      title: '登录',
      showLink: false,
      rank: 101,
    },
  },
  {
    path: '/redirect',
    component: Layout,
    meta: {
      title: '加载中...',
      showLink: false,
      rank: 102,
    },
    children: [
      {
        path: '/redirect/:path(.*)',
        name: 'Redirect',
        component: () => import('@/layout/redirect.vue'),
      },
    ],
  },
] satisfies Array<RouteConfigsTable>
