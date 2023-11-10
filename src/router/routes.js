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
  },
  {
    key:       'stockRecord',
    icon:      'List',
    label:     '出入库记录',
    path:      '/stockRecord',
    component: () => import('@/pages/stock/Record.vue')
  }
];

