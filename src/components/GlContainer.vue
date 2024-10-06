<template>
  <ElContainer>
    <ElHeader class="main-header">
      泓贝再生资源回收有限公司
    </ElHeader>
    <ElContainer class="overflow-hidden">
      <ElAside class="bg-white" width="200px">
        <ElMenu router :defaultActive="route.path">
          <template v-for="(menu, name) in group" :key="name">
            <div class="group-title">{{ name }}</div>
            <ElMenuItem v-for="item in menu" :key="item.key" :index="item.path">
              <ElIcon>
                <Component :is="item.icon" />
              </ElIcon>
              {{ item.label }}
            </ElMenuItem>
          </template>
        </ElMenu>
      </ElAside>
      <ElMain>
        <ElContainer class="h-full">
          <ElHeader v-if="activeMenu" class="breadcrumb-header">
            <ElBreadcrumb :separatorIcon="ArrowRight">
              <ElBreadcrumbItem>{{ activeMenu.group }}</ElBreadcrumbItem>
              <ElBreadcrumbItem>{{ activeMenu.label }}</ElBreadcrumbItem>
            </ElBreadcrumb>
          </ElHeader>
          <ElMain class="inset-main">
            <div class="rd h-full box-border">
              <RouterView class="h-full w-full overflow-auto" />
            </div>
          </ElMain>
        </ElContainer>
      </ElMain>
    </ElContainer>
  </ElContainer>
</template>
<script setup>
import routes from '@/router/routes';
import { useUser } from '@/store';
import { computed } from 'vue';
import {ArrowRight} from '@element-plus/icons-vue';
import {useRoute} from 'vue-router';

const route = useRoute();
const user = useUser();
const group = computed(() => {
  const menu = routes
    .filter(item => user.can(`menu.${item.key}`));
  const group = {};
  for(const item of menu) {
    if(!group[item.group]) {
      group[item.group] = [];
    }
    group[item.group].push(item);
  }
  return group;
});
const activeMenu = computed(() => {
  return routes.find(item => `menu.${item.key}` === route.name);
});

</script>
<style lang="scss" scoped>
.main-header{
  background: #272A39;
  font-weight: 400;
  font-size: 24px;
  color: #FFFFFF;
  display: flex;
  align-items: center;
  height: 65px;
}
.breadcrumb-header{
  height: unset;
  padding-left: 0;
}

.el-menu {
  padding: 0 20px;
}

.inset-main{
  padding: 0;
  margin-top: 20px;
}

.group-title{
  font-weight: 400;
  font-size: 16px;
  color: #848484;
  padding-left: 20px;
  margin: 12px 0;
}

.el-menu-item{
  font-size: 14px;
  border-radius: 4px;
  height: 44px;

  &.is-active{
    background: var(--el-color-primary);
    color: #FFFFFF;
  }
}
</style>
