/**
 * 登陆后的路由表
 * @type {AuthRoute[]}
 */
export default [
  {
    key:       'order.list',
    icon:      'Memo',
    label:     '订单管理',
    path:      '/order/list',
    component: () => import('@/pages/order/List.vue')
  },
  {
    key:       'futures',
    icon:      'PieChart',
    label:     '期货管理',
    path:      '/futures',
    component: () => import('@/pages/futures/Index.vue')
  },
  // {
  //   key:       'futuresV2',
  //   icon:      'PieChart',
  //   label:     '期货管理（新）',
  //   path:      '/futuresV2',
  //   component: () => import('@/pages/futures/IndexV2.vue')
  // },
  {
    key:       'customer.list',
    icon:      'Avatar',
    label:     '客户管理',
    path:      '/customer/list',
    component: () => import('@/pages/customer/List.vue')
  },
  {
    key:       'template.list',
    icon:      'Memo',
    label:     '工艺参考管理',
    path:      '/template/list',
    component: () => import('@/pages/template/List.vue')
  },
  // {
  //   key:       'home',
  //   icon:      'HomeFilled',
  //   label:     '首页',
  //   path:      '/home',
  //   component: () => import('@/pages/Home.vue')
  // },
  {
    key:       'stock',
    icon:      'Grid',
    label:     '库存管理',
    path:      '/stock',
    component: () => import('@/pages/stock/List.vue')
  },
  {
    key:       'stockRecord',
    icon:      'Memo',
    label:     '出入库记录',
    path:      '/stock/record',
    component: () => import('@/pages/stock/Record.vue')
  },
  {
    key:       'process',
    icon:      'Files',
    label:     '加工车间',
    path:      '/workshop/process',
    component: () => import('@/pages/workshop/Process.vue')
  },
  {
    key:       'goodsApply',
    icon:      'Tickets',
    label:     '出入库审核',
    path:      '/stock/apply',
    component: () => import('@/pages/stock/Apply.vue')
  },
  // {
  //   key:       'report.profit',
  //   icon:      'Histogram',
  //   label:     '利润统计',
  //   path:      '/report/profit',
  //   component: () => import('@/pages/report/Profit.vue')
  // },
  {
    key:       'report.process',
    icon:      'ScaleToOriginal',
    label:     '成品率统计',
    path:      '/report/process',
    component: () => import('@/pages/report/Process.vue')
  },
  {
    key:       'report.stockChange',
    icon:      'DataAnalysis',
    label:     '出入库统计',
    path:      '/report/stockChange',
    component: () => import('@/pages/report/StockChange.vue')
  }
];

