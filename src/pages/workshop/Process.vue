<template>
  <div class="flex flex-col">
    <GlFilterBar class="m-b-2" :model="filters">
      <template v-slot:after>
        <ElButton type="primary" @click="add" icon="plus">新增作业</ElButton>
      </template>
    </GlFilterBar>
    <ElTable
      :data="list"
      border
      height="100%"
      v-loadng="pagination.paginate.loading"
    >
      <ElTableColumn label="库存类型" prop="goodsType">
        <template v-slot="{ row }">{{ row['goodsType'] }}</template>
      </ElTableColumn>
    </ElTable>
    <GlPagination class="m-t-2" :pagination="pagination" :requestHook="getList" />
    <Dialog v-model:visible="dialogVisible" :model="form" />
  </div>
</template>
<script setup>
import { reactive, ref } from 'vue';
import {
  getSelfWorkshop,
  useGetPocessListWithPagination,
  getOptions
} from '@/api';
import { usePagination } from '@/helpers';
import { ElMessage } from 'element-plus';
import Dialog from './Dialog.vue';
const workshopId = ref(null);
const filters = reactive({});
const pagination = usePagination();
const getProcessList = useGetPocessListWithPagination(pagination);
const list = ref([]);
const dialogVisible = ref(false);
const form = ref(null);

function add() {
  dialogVisible.value = true;
  form.value = {
    workshopId: workshopId.value
  };
}

async function getList() {
  const options = await getOptions('storehouse');
  console.log('options', options);
  // const list = await getProcessList(workshopId.value);
  // console.log('list', list);
}
async function init() {
  const rep = await getSelfWorkshop();
  if(!rep || rep.length < 1) {
    ElMessage.error('您的账号未绑定车间，请联系管理员添加');
    return;
  }
  workshopId.value = rep[0].id;
  getList();
}
init();

</script>
