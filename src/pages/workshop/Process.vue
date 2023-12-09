<template>
  <div class="flex flex-col">
    <GlFilterBar class="m-b-2" :model="filters" @search="pagination.reset(getList)">
      <GlFilterItem label="名称" prop="name" />
      <template v-slot:after>
        <ElButton type="primary" @click="add" icon="plus">配料申请</ElButton>
        <ElButton type="primary" @click="showUsedDetail" icon="plus">耗材申请</ElButton>
      </template>
    </GlFilterBar>
    <div class="flex-auto h-1">
      <ElTable
        :data="list"
        border
        height="100%"
        v-loading="pagination.paginate.loading"
      >
        <ElTableColumn label="名称" prop="name" />
        <ElTableColumn label="创建人" prop="showName" />
        <ElTableColumn label="状态">
          <template v-slot="{ row }">
            <span>{{ PROCESS_STATUS_MAP[row.status] }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn label="创建时间" prop="createdAt">
          <template v-slot="{ row }">
            {{ moment(row.createdAt).format('YYYY-MM-DD HH:mm') }}
          </template>
        </ElTableColumn>
        <ElTableColumn label="操作">
          <template v-slot="{ row }">
            <GlAsyncButton type="primary" link :click="() => showDetail(row.id)">详情</GlAsyncButton>
            <ElButton
              type="primary"
              link
              v-if="row.status === PROCESS_STATUS_WAIT"
              @click="toProcessing(row)"
            >
              开始加工
            </ElButton>
          </template>
        </ElTableColumn>
      </ElTable>
    </div>
   
    <GlPagination class="m-t-2" :pagination="pagination" :requestHook="getList" />
    <Dialog
      v-model:visible="dialogVisible"
      :model="form"
      :storehouses="storehouses"
      @reload="getList"
    />
    <UsedDialog
      v-model:visible="usedDialogVisible"
      :model="usedForm"
      :storehouses="storehouses"
      @submit="submit"
    />
  </div>
</template>
<script setup>
import { reactive, ref } from 'vue';
import {
  getSelfWorkshop,
  useGetPocessListWithPagination,
  getOptions,
  getProcessDetail,
  toProcessing as toProcessingApi,
  usedApply
} from '@/api';
import { PROCESS_STATUS_MAP, PROCESS_STATUS_PROCESS, PROCESS_STATUS_WAIT } from '@/constant';
import { usePagination } from '@/helpers';
import { ElMessage } from 'element-plus';
import Dialog from './Dialog.vue';
import UsedDialog from './UsedDialog.vue';
import moment from 'moment';

const workshopId = ref(null);
const filters = reactive({
  name: ''
});
const pagination = usePagination();
const getProcessList = useGetPocessListWithPagination(pagination);
const list = ref([]);
const dialogVisible = ref(false);
const form = ref(null);
const usedDialogVisible = ref(false);
const usedForm = ref(null);
const storehouses = ref([]);

function add() {
  dialogVisible.value = true;
  form.value = {
    name:         '',
    workshopId:   workshopId.value,
    storehouseId: storehouses.value[0]?.value ?? null,
    status:       null,
    raw:          {
      goodsId:       null,
      specification: null,
      unitId:        null,
      num:           null
    },
    product: null,
    semis:   [],
    comment: ''
  };
}

async function getList() {
  list.value =  await getProcessList(workshopId.value, filters);
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
async function toProcessing(row) {
  await toProcessingApi(row.id);
  ElMessage.success('开始加工成功');
  row.status = PROCESS_STATUS_PROCESS;
}
async function showDetail(id) {
  if(id) {
    const rep = await getProcessDetail(id);
    if(rep) {
      dialogVisible.value = true;
      form.value = rep;
    } else {
      ElMessage.error('未找到该加工');
    }
  }
}

async function submit(form) {
  await usedApply(form);
  ElMessage.success('耗材申请成功');
}

function showUsedDetail() {
  usedForm.value = {
    workshopId:   workshopId.value,
    storehouseId: storehouses.value[0]?.value ?? null,
    items:        []
  };
  usedDialogVisible.value = true;
}

init();
</script>
