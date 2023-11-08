/**
 * 登陆后的路由表
 * @type {AuthRoute[]}
 */
export default [
  {
    key:       'home',
    icon:      'House',
    label:     '首页',
    path:      '/home',
    component: () => import('@/pages/Home.vue')
  }
];

