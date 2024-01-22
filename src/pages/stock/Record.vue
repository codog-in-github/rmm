<template>
  <div class="flex flex-col">
    <GlFilterBar :model="filters" @search="pagination.reset(getList)" class="m-b-4">
      <GlFilterItem
        prop="goodsType"
        type="select"
        label="库存类型"
        :options="goodsTypeList"
      />
      <GlFilterItem
        prop="type"
        type="select"
        label="类型"
        :options="stockChangeList"
      />
      <GlFilterItem
        prop="createdAt"
        type="daterange"
        label="操作时间"
      />
    </GlFilterBar>
    <div class="flex-auto overflow-auto h-1" v-loading="pagination.paginate.loading">
      <ElTable
        :data="list"
        border
        height="100%"
      >
        <ElTableColumn label="库存类型" prop="goodsType">
          <template v-slot="{ row }">{{ CONSTANT.GOODS_TYPE_MAP[row['goodsType']] }}</template>
        </ElTableColumn>
        <ElTableColumn label="类型" prop="type">
          <template v-slot="{ row }">
            <span v-if="row['type'] === CONSTANT.STOCK_CHANGE_TYPE_IN" class="color-success">入库</span>
            <span v-else-if="row['type'] === CONSTANT.STOCK_CHANGE_TYPE_OUT" class="color-danger">出库</span>
            <span v-else-if="row['type'] === CONSTANT.STOCK_CHANGE_TYPE_RETURN" class="color-success">加工入库</span>
            <span v-else-if="row['type'] === CONSTANT.STOCK_CHANGE_TYPE_TRANSFER" class="color-danger">加工配料</span>
            <span v-else-if="row['type'] === CONSTANT.STOCK_CHANGE_TYPE_UNDO" class="color-warning">撤销</span>
            <span v-else class="color-info">未知</span>
          </template>
        </ElTableColumn>
        <ElTableColumn label="操作人" prop="showName" />
        <ElTableColumn
          label="操作时间"
          prop="createdAt"
          width="180"
          :formatter="formatDatetime"
        />
        <ElTableColumn label="操作" width="180">
          <template v-slot="{ row }">
            <GlAsyncButton type="text" :click="() => showDetail(row)">详情</GlAsyncButton>
            <GlAsyncButton v-if="CONSTANT.STOCK_CHANGE_TYPE_OUT === row.type" type="text" :click="() => doPrint(row.id)">打印出库单</GlAsyncButton>
            <GlAsyncButton
              v-if="CONSTANT.STOCK_CHANGE_TYPE_IN === row.type  && !row.undidAt"
              type="text"
              :click="() => undo(row.id)"
            >
              撤销
            </GlAsyncButton>
          </template>
        </ElTableColumn>
      </ElTable>
    </div>
    <GlPagination class="m-t-2" :pagination="pagination" :requestHook="getList" />
    <Dialog v-model:visible="showDialog" :model="dialogData" readonly />
  </div>
</template>

<script setup>
import {
  getSelfStorehouse,
  getStockRecordDetail,
  useGetStockRecord,
  stockRecordUndo, printReduce
} from '@/api';
import { ElMessage, ElMessageBox } from 'element-plus';
import { ref, reactive } from 'vue';
import Dialog from './Dialog.vue';
import * as CONSTANT from '@/constant';
import { usePagination, formatDatetime, map2array } from '@/helpers';

const storehouseId = ref(null);
const list = ref([]);
const filters = reactive({
  goodsType: '',
  type:      '',
  createdAt: []
});
const showDialog = ref(false);
const dialogData = ref(null);
const pagination = usePagination();
const goodsTypeList = map2array(CONSTANT.GOODS_TYPE_MAP);
const stockChangeList = map2array(CONSTANT.STOCK_CHANGE_TYPE_MAP);
const getStockRecord = useGetStockRecord(pagination);

function getList() {
  return getStockRecord(storehouseId.value, filters)
    .then(rep => {
      list.value = rep;
    });
}

async function showDetail(row) {
  const rep = await getStockRecordDetail(row.id);
  dialogData.value = rep;
  showDialog.value = true;
}

async function undo(id) {
  try {
    const { value: comment } = await ElMessageBox.prompt('请输入原因', '确定要撤销吗？', {
      inputPattern:      /^[\u4e00-\u9fa5\w\s]{1,20}$/,
      inputErrorMessage: '请输入1-20个字符'
    });
    await stockRecordUndo(id, comment);
    ElMessage.success('撤销成功');
    getList();
  } catch (error) {
    //
  }
}
let _printSettings = JSON.parse(
  localStorage.getItem('printSettings')
);
if(!_printSettings) {
  _printSettings = {
    printerIndex:   null,
    paperSizeIndex: null
  };
}
const printSettingsShow = ref(false);
function savePrintSettings(settings) {
  if(settings) {
    localStorage.setItem('printSettings', JSON.stringify(settings));
    printSettings.value = settings;
  }
}

const printSettings = ref(_printSettings);
async function doPrint(id) {
  const data = await printReduce(id);
  LODOP.PRINT_INITA();
  LODOP.SET_PRINTER_INDEX(printSettings.value.printerIndex);
  LODOP.SET_PRINT_STYLE('FontSize', 16);
  LODOP.ADD_PRINT_TEXT(40, 20, 200, 20, '明细');
  LODOP.ADD_PRINT_TEXT(40, 120, 200, 20, '名称');
  LODOP.ADD_PRINT_TEXT(40, 220, 200, 20, '规格');
  LODOP.ADD_PRINT_TEXT(40, 370, 200, 20, '单价（元）');
  LODOP.ADD_PRINT_TEXT(40, 510, 200, 20, '数量');
  LODOP.ADD_PRINT_TEXT(40, 620, 200, 20, '总价（元）');
  for(let i = 0; i < data.details.length; i++) {
    const item = data.details[i];
    LODOP.ADD_PRINT_TEXT(70 + i * 30, 120, 200, 20, item.goodsName);
    LODOP.ADD_PRINT_TEXT(70 + i * 30, 220, 200, 20, item.spec);
    LODOP.ADD_PRINT_TEXT(70 + i * 30, 370, 200, 20, item.price);
    LODOP.ADD_PRINT_TEXT(70 + i * 30, 510, 200, 20, item.num + ' ' + item.unit);
    LODOP.ADD_PRINT_TEXT(70 + i * 30, 620, 200, 20, item.total);
  }
  LODOP.ADD_PRINT_TEXT(80 + data.details.length * 30, 20, 200, 20, '打印人');
  LODOP.ADD_PRINT_TEXT(80 + data.details.length * 30, 120, 200, 20, data.user);
  LODOP.ADD_PRINT_TEXT(120 + data.details.length * 30, 20, 200, 20, '打印时间');
  LODOP.ADD_PRINT_TEXT(120 + data.details.length * 30, 120, 400, 20, data.time);
  LODOP.ADD_PRINT_TEXT(160 + data.details.length * 30, 20, 200, 20, '备注');
  LODOP.ADD_PRINT_TEXT(160 + data.details.length * 30, 120, 400, 20, data.comment);
  LODOP.PREVIEW();
}
async function init() {
  pagination.paginate.loading = true;
  const storehouseList = await getSelfStorehouse();
  if(storehouseList.length > 0) {
    storehouseId.value = storehouseList[0].id;
    return pagination.reset(getList);
  }
  ElMessage.error('您的账号未绑定仓库，请联系管理员添加');
}
init();
</script>
