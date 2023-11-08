<template>
  <ElContainer>
    <ElHeader class="bg-primary color-white">
      <ElRow>
        <ElCol :span="3" class="font-size-8">
          欢迎使用xxx系统
        </ElCol>
        <ElCol :span="2">
          你好：<ElIcon><User /></ElIcon>{{ user.name }}
        </ElCol>
      </ElRow>
    </ElHeader>
    <ElContainer>
      <ElAside class="bg-white">
        <ElMenu>
          <ElMenuItem v-for="item in menu" :key="item.key">
            <ElIcon>
              <Component :is="item.icon" />
            </ElIcon>
            {{ item.label }}
          </ElMenuItem>
        </ElMenu> 
      </ElAside>
      <ElMain>
        <RouterView>
          <template v-slot="{ Component }">
            <div class="bg-white rd h-full">
              <Transform name="el-fade-in-linear">
                <Component :is="Component" class="h-full overflow-auto" />
              </Transform>
            </div>
          </template>
        </RouterView>
      </ElMain>
    </ElContainer>
  </ElContainer>
</template>
<script setup>
import routes from '@/router/routes';
import { useUser } from '@/store';
import { computed } from 'vue';
const user = useUser();
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
</script>
