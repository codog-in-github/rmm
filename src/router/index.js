import { createRouter, createWebHashHistory } from 'vue-router';
import routes from './routes';
import { onBeforeUnload } from '@/helpers';

/**
 * 缓存路由key 用于刷新时恢复路由表
 * @type {string [] | null}
 */
let cacheRouteKeys = JSON.parse(
  localStorage.getItem('routes')
);

if(cacheRouteKeys) {
  localStorage.removeItem('routes');
} else {
  cacheRouteKeys = [];
}

onBeforeUnload(() => {
  localStorage.setItem(
    'routes',
    JSON.stringify(cacheRouteKeys)
  );
});

/**
 * 根据key返回所有路由
 * @param {string[]} keys 
 * @returns 
 */
function restoreRoutes(keys) {
  const routeMap = {};
  routes.forEach(route => {
    routeMap[`menu.${route.key}`] = route;
  });
  return keys.map(key => {
    const matchedRoute = routeMap[key];
    return {
      name:      key,
      path:      matchedRoute.path,
      component: matchedRoute.component
    };
  });
}
const router = createRouter({
  history: createWebHashHistory(),
  routes:  [{ 
    path:     '/', 
    redirect: '/login' 
  }, { 
    path:      '/login', 
    component: () => import('@/pages/Login.vue') 
  }, { 
    name:      'container', 
    path:      '/container',
    children:  restoreRoutes(cacheRouteKeys),
    component: () => import('@/components/GlContainer.vue')
  }]
});

/**
 * 根据权限名动态添加路由
 * @param {string[]} authsKeys 
 */
export function addRouterForAuth(authsKeys) {
  const routeMap = {};
  routes.forEach(route => {
    routeMap[`menu.${route.key}`] = route;
  });
  const newRouteKeys = [];
  authsKeys.forEach(key => {
    const matchedRoute = routeMap[key];
    if (matchedRoute) {
      const newRoute = {
        name:      key,
        path:      matchedRoute.path,
        component: matchedRoute.component
      };
      newRouteKeys.push(key);
      router.addRoute('container', newRoute);
    } else {
      router.removeRoute(key);
    }
  });
  cacheRouteKeys = newRouteKeys;
}

export default router;
