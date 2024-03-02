<template>
  <ElConfigProvider :locale="zhCn">
    <RouterView class="w-screen h-screen overflow-hidden bg-light" />
  </ElConfigProvider>
</template>

<script setup>
import zhCn from 'element-plus/dist/locale/zh-cn.mjs';
</script>

<style>
* {
  margin: 0;
  padding: 0;
}
.el-table{
  --el-border-color-lighter: #c2c8cc;
  --el-table-header-bg-color: #ececec !important;
}
</style>
