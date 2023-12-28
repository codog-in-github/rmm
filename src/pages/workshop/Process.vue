<template>
  <div class="flex flex-col">
    <GlFilterBar class="m-b-2" :model="filters" @search="pagination.reset(getList)">
      <GlFilterItem label="名称" prop="name" />
      <template v-slot:after>
        <ElButton type="primary" @click="add" icon="plus">配料申请</ElButton>
        <ElButton type="primary" @click="showUsedDetail" icon="plus">耗材申请</ElButton>
        <ElButton type="primary" @click="printSettingsShow = true" icon="tools">打印设置</ElButton>
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
      @print="doPrint"
    />
    <UsedDialog
      v-model:visible="usedDialogVisible"
      :model="usedForm"
      :storehouses="storehouses"
      @submit="submit"
    />
    <PrintSetting v-model:visible="printSettingsShow" :model="printSettings" @submit="savePrintSettings" />
  </div>
</template>
<script setup>
import { reactive, ref } from 'vue';
import {
  getSelfWorkshop,
  useGetProcessList,
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
import PrintSetting from './PrintSetting.vue';
import moment from 'moment';
import { useUser } from '@/store';

const canPrint = Boolean(LODOP);
const workshopId = ref(null);
const filters = reactive({
  name: ''
});
const pagination = usePagination();
const getProcessList = useGetProcessList(pagination);
const list = ref([]);
const dialogVisible = ref(false);
const form = ref(null);
const usedDialogVisible = ref(false);
const usedForm = ref(null);
const storehouses = ref([]);
const printSettingsShow = ref(false);
let _printSettings = JSON.parse(
  localStorage.getItem('printSettings')
);
if(!_printSettings) {
  _printSettings = {
    printerIndex:   null,
    paperSizeIndex: null
  };
}
const printSettings = ref(_printSettings);
function savePrintSettings(settings) {
  if(settings) {
    localStorage.setItem('printSettings', JSON.stringify(settings));
    printSettings.value = settings;
  }
}

function add() {
  dialogVisible.value = true;
  form.value = {
    name:         '',
    workshopId:   workshopId.value,
    storehouseId: storehouses.value?.[0].value ?? null,
    status:       null,
    raw:          {
      goodsId: null,
      spec:    null,
      unitId:  null,
      num:     null
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
  return getList();
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
function doPrint(data) {
  if(!LODOP) {
    ElMessage.error('请先安装LODOP插件');
  }
  LODOP.PRINT_INITA();
  LODOP.SET_PRINTER_INDEX(printSettings.value.printerIndex);
  LODOP.SET_PRINT_STYLE('FontSize', 16);
  LODOP.ADD_PRINT_TEXT(20, 20, 200, 20, '名称');
  LODOP.ADD_PRINT_TEXT(20, 120, 200, 20, data.name);
  LODOP.ADD_PRINT_TEXT(60, 20, 200, 20, '材料');
  LODOP.ADD_PRINT_TEXT(60, 120, 200, 20, '名称');
  LODOP.ADD_PRINT_TEXT(100, 120, 200, 20, data.raw.goodsName);
  LODOP.ADD_PRINT_TEXT(60, 220, 200, 20, '规格(MM)');
  LODOP.ADD_PRINT_TEXT(100, 220, 200, 20, data.raw.spec);
  LODOP.ADD_PRINT_TEXT(60, 340, 200, 20, '数量');
  LODOP.ADD_PRINT_TEXT(100, 340, 200, 20, data.raw.num);
  LODOP.ADD_PRINT_TEXT(60, 420, 200, 20, '单位');
  LODOP.ADD_PRINT_TEXT(100, 420, 200, 20, data.raw.unitName);
  LODOP.ADD_PRINT_TEXT(140, 20, 200, 20, '备注');
  LODOP.ADD_PRINT_TEXT(140, 120, 300, 500, data.comment);
  LODOP.ADD_PRINT_TEXT(260, 20, 200, 20, '打印人');
  LODOP.ADD_PRINT_TEXT(260, 120, 200, 20, useUser().name);
  LODOP.ADD_PRINT_TEXT(300, 20, 200, 20, '打印时间');
  LODOP.ADD_PRINT_TEXT(300, 120, 200, 20, moment().format('YYYY-MM-DD HH:mm'));
  LODOP.PRINT();
}
async function submit(form) {
  await usedApply(form);
  ElMessage.success('耗材申请成功');
}
function showUsedDetail() {
  usedForm.value = {
    workshopId:   workshopId.value,
    storehouseId: storehouses.value?.[0].value ?? null,
    items:        []
  };
  usedDialogVisible.value = true;
}
init();
</script>
