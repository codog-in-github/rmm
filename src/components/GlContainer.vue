<template>
  <ElContainer>
    <ElAside class="bg-white">
      <ElMenu>
        <ElMenuItem index="1-1">
          <ElIcon><Aim /></ElIcon>item one
        </ElMenuItem>
        <ElMenuItem index="1-2">item one</ElMenuItem>
      </ElMenu> 
    </ElAside>
    <ElContainer>
      <ElHeader>{{ user.name }}</ElHeader>
      <ElMain>
        <RouterView />
      </ElMain>
    </ElContainer>
  </ElContainer>
</template>
<script setup>
import { useUser } from '@/store';
const user = useUser();
</script>
