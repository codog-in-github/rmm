<script setup>
import {ref, reactive} from 'vue';
import {spec2html, specParse, toleranceFormat, usePagination} from '@/helpers';
import {getOptions, ordelDel, printOrder, useOrderList} from '@/api';
import Editor from './Editor.vue';
import {ElMessage, ElMessageBox} from 'element-plus';
import {ORDER_STATUS_WAIT, ORDER_UNIT_MAP} from '@/constant';
import TemplateDialog from './TemplateDialog.vue';
import moment from 'moment';
import {isEmptyDateString} from '@/helpers/check';
import UploadDialog from '@/pages/order/UploadDialog.vue';

const isPrintTemplate = ref(true);
const printSettingsShow = ref(false);
const selectedIds = ref([]);
const customerOptions = ref([]);
const templateDialogRef = ref(null);
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
  date:       [],
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
  selectedIds.value = [];
  const rep = await listApi(filters);
  list.value = rep.map(item => {
    const spec = specParse(item.spec);
    const wLimit = item.wLimit ? item.wLimit.split('/') : ['', ''];
    return {
      ...item,
      spec,
      wLimit
    };
  });
};

const uploadRef = ref(null);
function showUpload() {
  uploadRef.value.show();
}

async function doPrint(id, _isPrintTemplate = isPrintTemplate.value) {
  const dataList = await printOrder(id);
  LODOP.PRINT_INITA();
  LODOP.SET_PRINT_PAGESIZE(1, 0 ,0, 'A5');
  LODOP.SET_PRINTER_INDEX(printSettings.value.printerIndex);
  for (let i = 0; i < dataList.length; i++) {
    if(i > 0) {
      LODOP.NEWPAGE();
    }
    let html = '<table cellpadding="2" cellspacing="0" border="1" width="100%" style="font-size: 18px">';
    const data = dataList[i];
    html += `<tr><td>日期</td><td colspan="5">${data.orderDate}</td></tr>`;
    html += '<tr>' +
        '<td colspan="2">客户代码</td>' +
        '<td>原料</td>' +
        '<td>规格（MM）</td>' +
        '<td>硬度</td>' +
        '<td>数量</td>' +
        '</tr>';
    for(let i = 0; i < data.details.length; i++) {
      const item = data.details[i];
      html += '<tr>';
      html += `<td colspan="2">${item.code ?? '-'}</td>`;
      html += `<td>${item.goodsName}</td>`;
      html += `<td>${spec2html(item.spec)}</td>`;
      html += `<td>${item.hard}</td>`;
      html += `<td>${item.num}(${ORDER_UNIT_MAP[item.unit]})</td>`;
      html += '</tr>';
      if(item.orderComment) {
        html += '<tr>';
        html += '<td>备注：</td>';
        html += `<td colspan="5">${item.orderComment}</td>`;
        html += '</tr>';
      }
      if(_isPrintTemplate && item.comment) {
        html += '<tr>';
        html += '<td>工艺说明：</td>';
        html += `<td colspan="5">${item.comment}</td>`;
        html += '</tr>';
      }
    }
    html += `<tr><td>打印人</td><td colspan="5">${data.user}</td></tr>`;
    html += `<tr><td>打印时间</td><td colspan="5">${data.printerTime}</td></tr>`;
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

function showTemplate(val) {
  templateDialogRef.value.show(val.customerId);
}

function filterCustomer(row) {
  filters.customerId = row.customerId;
  getList();
}

getList();
getCustomerOptions();
</script>

<template>
  <div class="inner-page-container flex flex-col">
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
        <ElButton icon="Upload" type="primary" @click="showUpload">excel导入</ElButton>
        <!--        <GlBorderCard title="工艺说明" class="m-b-2">-->
        <!--          <ElSwitch v-model="isPrintTemplate" activeText="打印" inactiveText="不打印" />-->
        <!--        </GlBorderCard>-->
      </template>
    </GlFilterBar>
    <ElTable
      :data="list"
      class="flex-1"
      stripe
      v-loading="pagination.paginate.loading"
    >
      <ElTableColumn prop="date"  width="50px">
        <template v-slot="{ row }">
          <ElCheckbox :modelValue="selectedIds.includes(row.id)" @update:modelValue="(e) => toggleSelected(row.id, e)" />
        </template>
      </ElTableColumn>
      <ElTableColumn prop="date" label="订单日期" width="120" />
      <ElTableColumn prop="customerName" label="客户名称" width="220">
        <template v-slot="{ row }">
          <template v-if="row.customerName">
            <ElButton type="primary" @click="filterCustomer(row)" link>{{ row.customerName }}</ElButton>
          </template>
          <template v-else>
            无
          </template>
        </template>
      </ElTableColumn>
      <ElTableColumn label="名称" prop="name" width="120" />

      <ElTableColumn
        label="规格"
        prop="spec"
        width="160"
        :formatter="row => {
          const spec = `${row.spec.R[0]}*${row.spec.w[0]}`
          if(row.spec.l[0]) {
            return `${spec}*${row.spec.l[0]}`
          }
          return spec;
        }"
      />

      <ElTableColumn
        label="内径下公差"
        width="100"
        :formatter="row => toleranceFormat(row.spec.r[0], row.spec.r[2])"
      />

      <ElTableColumn
        label="内径上公差"
        width="100"
        :formatter="row => toleranceFormat(row.spec.r[0], row.spec.r[1])"
      />

      <ElTableColumn
        label="外径下公差"
        width="100"
        :formatter="row => toleranceFormat(row.spec.R[0], row.spec.R[2])"
      />

      <ElTableColumn
        label="外径上公差"
        width="100"
        :formatter="row => toleranceFormat(row.spec.R[0], row.spec.R[1])"
      />

      <ElTableColumn
        label="平均壁厚下限"
        width="150"
        prop="wLimit"
        :formatter="row => row.wLimit[1]"
      />

      <ElTableColumn
        label="平均壁厚上限"
        width="150"
        prop="wLimit"
        :formatter="row => row.wLimit[0]"
      />

      <ElTableColumn
        label="平均壁厚下公差"
        width="140"
        :formatter="row => toleranceFormat(row.spec.w[0], row.spec.w[2])"
      />

      <ElTableColumn
        label="平均壁厚上公差"
        width="140"
        :formatter="row => toleranceFormat(row.spec.w[0], row.spec.w[1])"
      />

      <ElTableColumn label="数量">
        <template v-slot="{ row }">
          {{ row.num }} {{ ORDER_UNIT_MAP[row.unit] }}
        </template>
      </ElTableColumn>
      <ElTableColumn label="硬度" prop="hard" width="120" />
      <ElTableColumn label="特殊要求" prop="customerNote" width="220" />
      <ElTableColumn label="一般贸易" prop="normalBusiness" width="120">
        <template #="{ row }">
          {{ row.normalBusiness || '' }}
        </template>
      </ElTableColumn>
      <ElTableColumn label="要求交期" prop="deadline" width="120">
        <template #="{ row }">
          {{ isEmptyDateString(row.deadline) ? '' : moment(row.deadline).format('YYYY-MM-DD') }}
        </template>
      </ElTableColumn>
      <ElTableColumn label="状态" prop="status">
        <template v-slot="{ row }">
          <ElTag v-if="row.status === ORDER_STATUS_WAIT">处理中</ElTag>
          <ElTag v-else type="success">已完成</ElTag>
        </template>
      </ElTableColumn>
      <ElTableColumn label="操作" width="180" fixed="right">
        <template v-slot="{ row }">
          <GlAsyncButton link type="primary" :click="() => edit(row)">查看</GlAsyncButton>
          <GlAsyncButton link type="primary" :click="() => doPrint(row.id)">打印</GlAsyncButton>
          <GlAsyncButton link type="danger" :click="() => confirmDel(row)">删除</GlAsyncButton>
        </template>
      </ElTableColumn>
    </ElTable>
    <TemplateDialog ref="templateDialogRef" />
    <GlPagination class="m-t-2" :pagination="pagination" :requestHook="getList" />
    <Editor ref="editor" @success="addSuccess" />
    <GlPrintSetting v-model:visible="printSettingsShow" :model="printSettings" @submit="savePrintSettings" />
    <UploadDialog ref="uploadRef" @success="getList" />
  </div>
</template>

<style scoped lang="scss">
</style>
