<script setup>
import {ref, reactive} from 'vue';
import {usePagination} from '@/helpers';
import {useOrderList} from '@/api';
import Editor from './Editor.vue';


const pagination = usePagination();
const listApi = useOrderList(pagination);
const list = ref([]);
const filters = reactive({});
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

getList();
</script>

<template>
  <div class="flex flex-col">
    <GlFilterBar :model="filters" class="m-b-2" @search="getList">
      <template #after>
        <ElButton icon="Plus" type="primary" @click="add">新增订单</ElButton>
      </template>
    </GlFilterBar>
    <ElTable :data="list" class="flex-1">
      <ElTableColumn prop="date" label="订单日期" />
      <ElTableColumn prop="name" label="名称" />
      <ElTableColumn label="操作">
        <template v-slot="{ row }">
          <GlAsyncButton link type="primary" :click="() => edit(row)">查看</GlAsyncButton>
        </template>
      </ElTableColumn>
    </ElTable>
    <GlPagination class="m-t-2" :pagination="pagination" :requestHook="getList" />
    <Editor ref="editor" @success="getList" />
  </div>
</template>

<style scoped lang="scss">

</style>
