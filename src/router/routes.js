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
    path:      '/stock/record',
    component: () => import('@/pages/stock/Record.vue')
  },
  {
    key:       'process',
    icon:      'Files',
    label:     '作业清单',
    path:      '/workshop/process',
    component: () => import('@/pages/workshop/Process.vue')
  },
  {
    key:       'goodsApply',
    icon:      'Tickets',
    label:     '配料申请',
    path:      '/stock/apply',
    component: () => import('@/pages/stock/Apply.vue')
  },
  {
    key:       'report.profit',
    icon:      'Histogram',
    label:     '利润统计',
    path:      '/report/profit',
    component: () => import('@/pages/report/Profit.vue')
  },
  {
    key:       'report.process',
    icon:      'PieChart',
    label:     '成品率统计',
    path:      '/report/process',
    component: () => import('@/pages/report/Process.vue')
  }
];

