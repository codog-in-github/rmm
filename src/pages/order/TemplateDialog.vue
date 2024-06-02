<script setup>
import {ref, reactive} from 'vue';
import {usePagination} from '@/helpers';
import {getOptions, templateDel, useTemplateList} from '@/api';
import Editor from '../template/Editor.vue';
import {ElMessageBox} from 'element-plus';
import {useUser} from '@/store';

const user = useUser();
const customers = ref([]);
const pagination = usePagination();
const listApi = useTemplateList(pagination);
const list = ref([]);
const visible = ref(false);
const editorRef = ref(null);
let customerId = null;
const edit = function(row) {
  customerId = row.id;
  return editorRef.value.show(row.id);
};
const add = function() {
  return editorRef.value.showAddCustomer(customerId);
};
const getList = async function() {
  list.value = await listApi({
    customerId
  });
};

const confirmDel = async function(row) {
  await ElMessageBox.confirm('确定删除该模板？');
  await templateDel(row.id);
  getList();
};

getOptions('customer').then(res => {
  customers.value = res.customer;
});
defineExpose({
  show(id) {
    visible.value = true;
    customerId = id;
    getList();
  }
});
</script>

<template>
  <ElDialog v-model="visible" title="工艺参考">
    <GlFilterBar>
      <template #after>
        <ElButton type="primary" @click="add">新增</ElButton>
      </template>
    </GlFilterBar>
    <ElTable :data="list" class="flex-1 m-t-2">
      <ElTableColumn prop="goodsName" label="成品名称" />
      <ElTableColumn prop="rawSpec" label="原料规格" />
      <ElTableColumn prop="targetSpec" label="成品规格" />
      <ElTableColumn label="查看工艺">
        <template v-slot="{ row }">
          <GlAsyncButton link type="primary" :click="() => edit(row)">查看</GlAsyncButton>
          <GlAsyncButton
            link
            type="danger"
            v-if="user.can('template.delete')"
            :click="() => confirmDel(row)"
          >
            删除
          </GlAsyncButton>
        </template>
      </ElTableColumn>
    </ElTable>
    <GlPagination class="m-t-2" :pagination="pagination" :requestHook="getList" />
    <Editor ref="editorRef" @success="getList" />
  </ElDialog>
</template>

<style scoped lang="scss">

</style>
