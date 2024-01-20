<script setup>
import {ref, reactive} from 'vue';
import {usePagination} from '@/helpers';
import {printOrder, useOrderList} from '@/api';
import Editor from './Editor.vue';
import {ElMessageBox} from 'element-plus';

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

function savePrintSettings(settings) {
  if(settings) {
    localStorage.setItem('printSettings', JSON.stringify(settings));
    printSettings.value = settings;
  }
}

const printSettings = ref(_printSettings);
const canPrint = Boolean(LODOP);
const pagination = usePagination();
const listApi = useOrderList(pagination);
const list = ref([]);
const filters = reactive({
  date: []
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
async function doPrint(date) {
  const data = await printOrder(date);
  LODOP.PRINT_INITA();
  LODOP.SET_PRINTER_INDEX(printSettings.value.printerIndex);
  LODOP.SET_PRINT_STYLE('FontSize', 16);
  LODOP.ADD_PRINT_TEXT(20, 20, 200, 20, '日期');
  LODOP.ADD_PRINT_TEXT(20, 120, 200, 20, data.orderDate);
  LODOP.ADD_PRINT_TEXT(60, 20, 200, 20, '明细');
  LODOP.ADD_PRINT_TEXT(60, 120, 200, 20, '客户代码');
  LODOP.ADD_PRINT_TEXT(60, 220, 200, 20, '原料');
  LODOP.ADD_PRINT_TEXT(60, 340, 200, 20, '规格（MM）');
  LODOP.ADD_PRINT_TEXT(60, 480, 200, 20, '数量（KG）');
  for(let i = 0; i < data.details.length; i++) {
    const item = data.details[i];
    LODOP.ADD_PRINT_TEXT(100 + i * 30, 120, 200, 20, item.code);
    LODOP.ADD_PRINT_TEXT(100 + i * 30, 220, 200, 20, item.goodsName);
    LODOP.ADD_PRINT_TEXT(100 + i * 30, 340, 200, 20, item.spec);
    LODOP.ADD_PRINT_TEXT(100 + i * 30, 480, 200, 20, item.num);
  }
  LODOP.ADD_PRINT_TEXT(120 + data.details.length * 30, 20, 200, 20, '打印人');
  LODOP.ADD_PRINT_TEXT(120 + data.details.length * 30, 120, 200, 20, data.user);
  LODOP.ADD_PRINT_TEXT(160 + data.details.length * 30, 20, 200, 20, '打印时间');
  LODOP.ADD_PRINT_TEXT(160 + data.details.length * 30, 120, 400, 20, data.printerTime);
  LODOP.PREVIEW();
}

async function addSuccess(date) {
  if(canPrint) {
    try {
      await ElMessageBox.confirm('订单新增，是否打印？');
      doPrint(date);
    } catch (none) {
      //
    }
  }
  getList();
}

getList();
</script>

<template>
  <div class="flex flex-col">
    <GlFilterBar :model="filters" class="m-b-2" @search="getList">
      <GlFilterItem label="订单日期" prop="date" type="daterange" />
      <template #after>
        <ElButton icon="Plus" type="primary" @click="add">新增订单</ElButton>
        <ElButton icon="Setting" type="primary" @click="printSettingsShow = true">打印设置</ElButton>
      </template>
    </GlFilterBar>
    <ElTable :data="list" class="flex-1">
      <ElTableColumn prop="date" label="订单日期" />
      <ElTableColumn prop="name" label="名称" />
      <ElTableColumn label="操作">
        <template v-slot="{ row }">
          <GlAsyncButton link type="primary" :click="() => edit(row)">查看</GlAsyncButton>
          <GlAsyncButton link type="primary" :click="() => doPrint(row.date)">打印</GlAsyncButton>
        </template>
      </ElTableColumn>
    </ElTable>
    <GlPagination class="m-t-2" :pagination="pagination" :requestHook="getList" />
    <Editor ref="editor" @success="addSuccess" />
    <GlPrintSetting v-model:visible="printSettingsShow" :model="printSettings" @submit="savePrintSettings" />
  </div>
</template>

<style scoped lang="scss">

</style>
