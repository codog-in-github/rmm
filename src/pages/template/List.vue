<script setup>
import {ref, reactive} from 'vue';
import {usePagination} from '@/helpers';
import {getOptions, templateDel, useTemplateList} from '@/api';
import Editor from './Editor.vue';
import {ElMessageBox} from 'element-plus';
import {useUser} from '@/store';

const user = useUser();
const customers = ref([]);
const pagination = usePagination();
const listApi = useTemplateList(pagination);
const list = ref([]);
const filters = reactive({
  customerId: null
});
const editor = ref(null);

const add = function() {
  editor.value.show();
};
const edit = function(row) {
  return editor.value.show(row.id);
};
const getList = async function() {
  list.value = await listApi(filters);
};

const confirmDel = async function(row) {
  await ElMessageBox.confirm('确定删除该模板？');
  await templateDel(row.id);
  getList();
};

getOptions('customer').then(res => {
  customers.value = res.customer;
});
getList();
</script>

<template>
  <div class="inner-page-container flex flex-col">
    <GlFilterBar :model="filters" class="m-b-2" @search="getList">
      <GlFilterItem
        label="客户名称"
        prop="customerId"
        type="select"
        :options="customers"
        filterable
      />
      <template #after>
        <ElButton icon="Plus" type="primary" @click="add">新增模板</ElButton>
      </template>
    </GlFilterBar>
    <ElTable :data="list" class="flex-1" stripe>
      <ElTableColumn prop="customerName" label="客户名称" />
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
    <Editor ref="editor" @success="getList" />
  </div>
</template>

<style scoped lang="scss">

</style>
