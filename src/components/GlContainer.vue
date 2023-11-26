<template>
  <ElContainer>
    <ElHeader class="bg-primary color-white">
      <ElRow align="middle" class="h-full">
        <ElCol :span="20" class="font-size-6">
          泓贝再生资源回收有限公司
        </ElCol>
        <ElCol :span="4" class="text-right">
          <span class="p-r-4">
            你好：{{ user.name }}
          </span>
          <GlAsyncButton
            :click="logoutClick"
            type="danger"
            circle
            size="small"
            icon="SwitchButton"
          />
        </ElCol>
      </ElRow>
    </ElHeader>
    <ElContainer>
      <ElAside class="bg-white" width="160px">
        <ElMenu router>
          <ElMenuItem v-for="item in menu" :key="item.key" :index="item.path">
            <ElIcon>
              <Component :is="item.icon" />
            </ElIcon>
            {{ item.label }}
          </ElMenuItem>
        </ElMenu> 
      </ElAside>
      <ElMain>
        <div class="bg-white rd h-full p3 box-border">
          <RouterView class="h-full w-full overflow-auto" />
        </div>
      </ElMain>
    </ElContainer>
  </ElContainer>
</template>
<script setup>
import routes from '@/router/routes';
import { useUser } from '@/store';
import { computed } from 'vue';
import { logout } from '@/api';
import { useRouter } from 'vue-router';
import { clearRoutes } from '@/router';

const user = useUser();
const router = useRouter();
const menu = computed(() => {
  return routes
    .filter(item => user.can(`menu.${item.key}`))
    .map(item => ({
      key:   item.key,
      icon:  item.icon,
      path:  item.path,
      label: item.label
    }));
});

async function logoutClick() {
  try {
    await logout();
    user.logout();
    clearRoutes();
    router.replace('/login');
  } catch (error) {
    //
  }
}
</script>
