import { VueElementConstructor } from "vue";
import * as icon from '@element-plus/icons-vue'

declare global {
  interface AuthRoute {
    /**
     * 菜单权限key 不含前缀 `menu.`
     */
    key: string,
    /**
     * 菜单左侧图标
     */
    icon: keyof typeof icon,
    /**
     * 菜单名称
     */
    label: string,
    /**
     * 页面路由
     */
    path: string,
    /**
     * 
     * @returns 页面组件
     */
    component: () => Promise<VueElementConstructor>
  }
}
