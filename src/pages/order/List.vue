<script setup>
import {ref, reactive} from 'vue';
import {usePagination} from '@/helpers';
import {ordelDel, printOrder, useOrderList} from '@/api';
import Editor from './Editor.vue';
import {ElMessage, ElMessageBox} from 'element-plus';
const isPrintTemplate = ref(true);
const printSettingsShow = ref(false);
const selectedIds = ref([]);
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
  selectedIds.value = [];
  list.value = await listApi(filters);
};
async function doPrint(id, _isPrintTemplate = isPrintTemplate.value) {
  const dataList = await printOrder(id);
  console.log(dataList);
  LODOP.PRINT_INITA();
  LODOP.SET_PRINTER_INDEX(printSettings.value.printerIndex);
  LODOP.SET_PRINT_STYLE('FontSize', 16);
  for (let i = 0; i < dataList.length; i++) {
    if(i > 0) {
      LODOP.NEWPAGE();
    }
    const data = dataList[i];
    LODOP.ADD_PRINT_TEXT(20, 20, 200, 20, '日期');
    LODOP.ADD_PRINT_TEXT(20, 120, 200, 20, data.orderDate);
    LODOP.ADD_PRINT_TEXT(60, 20, 200, 20, '明细');
    LODOP.ADD_PRINT_TEXT(60, 120, 200, 20, '客户代码');
    LODOP.ADD_PRINT_TEXT(60, 220, 200, 20, '原料');
    LODOP.ADD_PRINT_TEXT(60, 340, 200, 20, '规格（MM）');
    LODOP.ADD_PRINT_TEXT(60, 480, 200, 20, '数量（KG）');
    let offset = 0;
    for(let i = 0; i < data.details.length; i++) {
      const lineTop = 100 + (i + offset) * 30;
      const item = data.details[i];
      LODOP.ADD_PRINT_TEXT(lineTop, 120, 200, 20, item.code);
      LODOP.ADD_PRINT_TEXT(lineTop, 220, 200, 20, item.goodsName);
      LODOP.ADD_PRINT_TEXT(lineTop, 340, 200, 20, item.spec);
      LODOP.ADD_PRINT_TEXT(lineTop, 480, 200, 20, item.num);
      if(_isPrintTemplate && item.comment) {
        offset += 1.5;
        LODOP.SET_PRINT_STYLE('FontSize', 12);
        LODOP.ADD_PRINT_TEXT(lineTop + 34, 120, 800, 20, '工艺说明： ' + item.comment);
        LODOP.SET_PRINT_STYLE('FontSize', 16);
      }
    }
    let lastTop = 120 + (data.details.length + offset)* 30;
    if(data.orderComment) {
      LODOP.ADD_PRINT_TEXT(lastTop, 20, 200, 20, '备注');
      const comment = data.orderComment.split('\n');
      for(let i = 0; i < comment.length; i++) {
        LODOP.ADD_PRINT_TEXT(lastTop, 120, 800, 20, comment[i]);
        lastTop += 30;
      }
      lastTop += 10;
    }
    LODOP.ADD_PRINT_TEXT(lastTop, 20, 200, 20, '打印人');
    LODOP.ADD_PRINT_TEXT(lastTop, 120, 200, 20, data.user);
    LODOP.ADD_PRINT_TEXT(lastTop + 40, 20, 200, 20, '打印时间');
    LODOP.ADD_PRINT_TEXT(lastTop + 40, 120, 400, 20, data.printerTime);
  }
  LODOP.PREVIEW();
}

function printMultiple() {
  if(selectedIds.value.length > 0) {
    doPrint(selectedIds.value);
  } else {
    ElMessage.warning('请先选择订单');
  }
}

function toggleSelected(id, isSelected) {
  if(isSelected) {
    selectedIds.value.push(id);
  } else {
    selectedIds.value = selectedIds.value.filter((item) => item !== id);
  }
}

async function confirmDel(row) {
  await ElMessageBox.confirm('确认删除该订单？');
  await ordelDel(row.id);
  getList();
}

async function addSuccess(id, isPrintTemplate) {
  if(canPrint) {
    try {
      await ElMessageBox.confirm('订单新增，是否打印？');
      doPrint(id, isPrintTemplate);
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
        <ElButton icon="Printer" type="primary" @click="printMultiple">批量打印</ElButton>
        <!--        <GlBorderCard title="工艺说明" class="m-b-2">-->
        <!--          <ElSwitch v-model="isPrintTemplate" activeText="打印" inactiveText="不打印" />-->
        <!--        </GlBorderCard>-->
      </template>
    </GlFilterBar>
    <ElTable :data="list" class="flex-1">
      <ElTableColumn prop="date"  width="50px">
        <template v-slot="{ row }">
          <ElCheckbox :modelValue="selectedIds.includes(row.id)" @update:modelValue="(e) => toggleSelected(row.id, e)" />
        </template>
      </ElTableColumn>
      <ElTableColumn prop="date" label="订单日期" />
      <ElTableColumn prop="customerName" label="客户名称" />
      <ElTableColumn label="名称">
        <template v-slot="{ row }">
          {{ row.name }} - {{ row.spec }} - {{ row.num }}KG
        </template>
      </ElTableColumn>
      <ElTableColumn label="操作">
        <template v-slot="{ row }">
          <GlAsyncButton link type="primary" :click="() => edit(row)">查看</GlAsyncButton>
          <GlAsyncButton link type="primary" :click="() => doPrint(row.id)">打印</GlAsyncButton>
          <GlAsyncButton link type="primary" :click="() => confirmDel(row)">删除</GlAsyncButton>
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
