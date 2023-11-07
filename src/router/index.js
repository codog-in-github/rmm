import { createRouter, createWebHashHistory } from 'vue-router';
import routes from './routes';
import { onBeforeUnload } from '@/helpers';

let cacheRoutes = JSON.parse(
  localStorage.getItem('route')
);

if(cacheRoutes) {
  localStorage.removeItem('route');
} else {
  cacheRoutes = [];
}

onBeforeUnload(() => {
  localStorage.setItem(
    'route',
    JSON.stringify(cacheRoutes)
  );
});

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
    children:  cacheRoutes,
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
  const newRoutes = [];
  authsKeys.forEach(key => {
    const matchedRoute = routeMap[key];
    if (matchedRoute) {
      const newRoute = {
        name:      key,
        path:      matchedRoute.path,
        component: matchedRoute.component
      };
      newRoutes.push(newRoute);
      router.addRoute('container', newRoute);
    } else {
      router.removeRoute(key);
    }
  });
  cacheRoutes = newRoutes;
}

export default router;
