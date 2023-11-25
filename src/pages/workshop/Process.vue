<template>
  <div class="flex flex-col">
    <GlFilterBar class="m-b-2" :model="filters" @search="pagination.reset(getList)">
      <template v-slot:after>
        <ElButton type="primary" @click="add" icon="plus">新增作业</ElButton>
      </template>
    </GlFilterBar>
    <ElTable
      :data="list"
      border
      height="100%"
      v-loading="pagination.paginate.loading"
    >
      <ElTableColumn label="名称" prop="name" />
      <ElTableColumn label="创建人" prop="showName" />
      <ElTableColumn label="创建时间" prop="createdAt">
        <template v-slot="{ row }">
          {{ moment(row.createdAt).format('YYYY-MM-DD HH:mm') }}
        </template>
      </ElTableColumn>
      
      <ElTableColumn label="操作">
        <template v-slot="{ row }">
          <ElButton type="text" @click="showDetail(row.id)">详情</ElButton>
        </template>
      </ElTableColumn>
    </ElTable>
    <GlPagination class="m-t-2" :pagination="pagination" :requestHook="getList" />
    <Dialog v-model:visible="dialogVisible" :model="form" :storehouses="storehouses" />
  </div>
</template>
<script setup>
import { reactive, ref } from 'vue';
import {
  getSelfWorkshop,
  useGetPocessListWithPagination,
  getOptions,
  getProcessDetail
} from '@/api';
import { usePagination } from '@/helpers';
import { ElMessage } from 'element-plus';
import Dialog from './Dialog.vue';
import moment from 'moment';

const workshopId = ref(null);
const filters = reactive({});
const pagination = usePagination();
const getProcessList = useGetPocessListWithPagination(pagination);
const list = ref([]);
const dialogVisible = ref(false);
const form = ref(null);
const storehouses = ref([]);

function add() {
  dialogVisible.value = true;
  form.value = {
    name:         '',
    workshopId:   workshopId.value,
    storehouseId: storehouses.value[0]?.value ?? null,
    status:       null,
    raws:         [],
    products:     [],
    comment:      ''
  };
}

async function getList() {
  list.value =  await getProcessList(workshopId.value);
}
async function init() {
  getOptions('storehouse').then(res => {
    storehouses.value = res.storehouse;
  });
  const rep = await getSelfWorkshop();
  if(!rep || rep.length < 1) {
    ElMessage.error('您的账号未绑定车间，请联系管理员添加');
    return;
  }
  workshopId.value = rep[0].id;
  getList();
}
init();

async function showDetail(id) {
  if(id) {
    const rep = await getProcessDetail(id);
    console.log(rep);
    if(rep) {
      dialogVisible.value = true;
      form.value = rep;
    }
  }
}

</script>
