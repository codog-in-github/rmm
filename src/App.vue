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

:root{
  --el-color-primary: #2072EC !important;
  --el-color-primary-light-3: #79bbff;
  --el-color-primary-light-5: #a0cfff;
  --el-color-primary-light-7: #c6e2ff;
  --el-color-primary-light-8: #d9ecff;
  --el-color-primary-light-9: #ecf5ff;
  --el-color-primary-dark-2: #337ecc;

  --el-color-success: #1EA22A !important;
}

.el-table{
  --el-border-color-lighter: #c2c8cc;
  --el-table-header-bg-color: #ececec !important;

  --el-table-border: none !important;
}

.inner-page-container{
  background-color: #fff;
  padding: 20px;
  box-sizing: border-box;
}

.el-form-item-content__flex-grow-0 .el-form-item__content{
  flex-grow: 0;
}

.el-select.no-arrow .el-input__suffix{
  display: none;
}
</style>
