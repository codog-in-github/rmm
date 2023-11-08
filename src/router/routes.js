/**
 * 登陆后的路由表
 * @type {AuthRoute[]}
 */
export default [
  {
    key:       'home',
    icon:      'HomeFilled',
    label:     '首页',
    path:      '/home',
    component: () => import('@/pages/Home.vue')
  },
  {
    key:       'stock',
    icon:      'Grid',
    label:     '库存管理',
    path:      '/stock',
    component: () => import('@/pages/stock/List.vue')
  }
];

