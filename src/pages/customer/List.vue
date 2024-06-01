<script setup>
import { reactive, ref } from 'vue';
import {formatDatetime, usePagination} from '@/helpers';
import {customerDel, useGetCustomers} from '@/api';
import Edit from '@/pages/customer/Editor.vue';
import {ElMessage, ElMessageBox} from 'element-plus';
import TemplateDialog from './TemplateDialog.vue';
const TemplateDialogRef = ref(null);
const filters = reactive({
  name: ''
});
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
  getListApi(filters).then(res => {
    list.value = res;
  });
};
function showTemplate(id) {
  TemplateDialogRef.value.show(id);
}
getList();
</script>

<template>
  <div class="h-full flex flex-col">
    <GlFilterBar :model="filters" @search="getList">
      <GlFilterItem label="客户名称" prop="name" />
      <template v-slot:after>
        <ElButton type="primary" icon="Plus" @click="showEdit = true">新增客户</ElButton>
      </template>
    </GlFilterBar>
    <ElTable
      v-loading="pagination.paginate.loading"
      class="flex-1 m-t-2"
      height="100%"
      :data="list"
    >
      <ElTableColumn label="客户名称" prop="name">
        <template v-slot:default="{ row }">
          <ElButton type="primary" link @click="showTemplate(row.id)">{{ row.name }}</ElButton>
        </template>
      </ElTableColumn>
      <ElTableColumn label="客户代码" prop="code" />
      <ElTableColumn label="创建人" prop="showName" />
      <ElTableColumn label="创建时间" prop="createdAt" :formatter="formatDatetime" />
      <ElTableColumn label="操作">
        <template v-slot:default="{ row }">
          <ElButton type="primary" link @click="edit(row)">编辑</ElButton>
          <GlAsyncButton type="danger" link :click="() => del(row)">删除</GlAsyncButton>
        </template>
      </ElTableColumn>
    </ElTable>
    <GlPagination class="m-t-2" :pagination="pagination" :requestHook="getList" />
    <Edit ref="editor" v-model:show="showEdit" @success="getList" />
    <TemplateDialog ref="TemplateDialogRef" />
  </div>
</template>

<style scoped lang="scss">

</style>
