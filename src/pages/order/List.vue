<script setup>
import {ref, reactive} from 'vue';
import {usePagination} from '@/helpers';
import {getOptions, ordelDel, printOrder, useOrderList} from '@/api';
import Editor from './Editor.vue';
import {ElMessage, ElMessageBox} from 'element-plus';
const isPrintTemplate = ref(true);
const printSettingsShow = ref(false);
const selectedIds = ref([]);
const customerOptions = ref([]);

async function getCustomerOptions() {
  const { customer } = await getOptions('customer');
  customerOptions.value = customer;
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
  LODOP.PRINT_INITA();
  LODOP.SET_PRINT_PAGESIZE(1, 0 ,0, 'A5');
  LODOP.SET_PRINTER_INDEX(printSettings.value.printerIndex);
  LODOP.SET_PRINT_STYLE('FontSize', 16);
  for (let i = 0; i < dataList.length; i++) {
    if(i > 0) {
      LODOP.NEWPAGE();
    }
    let html = '<table cellpadding="2" cellspacing="1" border="1" width="100%">';
    const data = dataList[i];
    html += `<tr><td>日期</td><td colspan="4">${data.orderDate}</td></tr>`;
    html += '<tr>' +
        '<td>明细</td>' +
        '<td>客户代码</td>' +
        '<td>原料</td>' +
        '<td>规格（MM）</td>' +
        '<td>数量（KG）</td>' +
        '</tr>';
    for(let i = 0; i < data.details.length; i++) {
      const item = data.details[i];
      html += '<tr>';
      html += '<td></td>';
      html += `<td>${item.code}</td>`;
      html += `<td>${item.goodsName}</td>`;
      html += `<td>${item.spec}</td>`;
      html += `<td>${item.num}</td>`;
      html += '</tr>';
      if(_isPrintTemplate && item.comment) {
        const item = data.details[i];
        html += '<tr>';
        html += '<td></td>';
        html += '<td>工艺说明：</td>';
        html += `<td colspan="3">${item.comment}</td>`;
        html += '</tr>';
      }
    }
    if(data.orderComment) {
      html += `<tr><td>备注</td><td colspan="4">${data.orderComment.replaceAll('\n', '<br/>')}</td></tr>`;
    }
    html += `<tr><td>打印人</td><td colspan="4">${data.user}</td></tr>`;
    html += `<tr><td>打印时间</td><td colspan="4">${data.printerTime}</td></tr>`;
    html += '</table>';
    LODOP.ADD_PRINT_HTM(10, 10, 500, 500, html);
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
getCustomerOptions();
</script>

<template>
  <div class="flex flex-col">
    <GlFilterBar :model="filters" class="m-b-2" @search="getList">
      <GlFilterItem
        label="订单日期"
        prop="date"
        type="daterange"
        clearable
      />
      <GlFilterItem
        label="客户名称"
        prop="customerId"
        type="select"
        :options="customerOptions"
        clearable
      />
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
