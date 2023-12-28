<script setup>
import { reactive, ref } from 'vue';
import {formatDate, usePagination} from '@/helpers';
import {customerDel, useGetCustomers} from '@/api';
import Edit from '@/pages/customer/Editor.vue';
import {ElMessage, ElMessageBox} from 'element-plus';
const model = reactive({});
const pagination = usePagination();
const getListApi = useGetCustomers(pagination);
const showEdit = ref(false);
const editor = ref(null);
const list = ref([]);
const edit = function(row) {
  editor.value.edit(row);
};
const del = async function(row) {
  await ElMessageBox.confirm(`确定删除【${row.name}】吗？`);
  await customerDel(row.id);
  ElMessage.success('删除成功');
  getList();
};
const getList = function() {
  getListApi(model).then(res => {
    list.value = res;
  });
};
getList();
</script>

<template>
  <div class="h-full flex flex-col">
    <GlFilterBar :model="model" @search="getList">
      <template v-slot:after>
        <ElButton type="primary" icon="Plus" @click="showEdit = true">新增客户</ElButton>
      </template>
    </GlFilterBar>
    <ElTable class="flex-1 m-t-2" height="100%" :data="list">
      <ElTableColumn label="客户名称" prop="name" />
      <ElTableColumn label="客户代码" prop="code" />
      <ElTableColumn label="创建人" prop="showName" />
      <ElTableColumn label="创建时间" prop="createdAt" :formatter="formatDate" />
      <ElTableColumn label="操作">
        <template v-slot:default="{ row }">
          <ElButton type="primary" link @click="edit(row)">编辑</ElButton>
          <GlAsyncButton type="danger" link :click="() => del(row)">删除</GlAsyncButton>
        </template>
      </ElTableColumn>
    </ElTable>
    <GlPagination class="m-t-2" :pagination="pagination" :requestHook="getList" />
    <Edit ref="editor" v-model:show="showEdit" @success="getList" />
  </div>
</template>

<style scoped lang="scss">

</style>
