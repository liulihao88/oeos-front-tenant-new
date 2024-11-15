const { VITE_HIDE_HOME } = import.meta.env
const Layout = () => import('@/layout/index.vue')

export default {
  path: '/',
  name: 'Home',
  component: Layout,
  redirect: '/apps/overview',
  meta: {
    icon: 'ep:home-filled',
    title: '租户概览首页',
    rank: 0,
  },
  children: [
    // {
    //   path: '/welcome',
    //   name: 'Welcome',
    //   component: () => import('@/views/welcome/index.vue'),
    //   meta: {
    //     title: '首页',
    //     showLink: false,
    //   },
    // },
    // {
    //   path: '/overview',
    //   name: 'Overview',
    //   component: () => import('@/views/overview/index.vue'),
    //   meta: {
    //     icon: 'ep:home-filled',
    //     title: '租户概览---',
    //     showLink: false,
    //   },
    // },
  ],
} satisfies RouteConfigsTable
