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
        <ElTableColumn label="库存类型" prop="goodsType" width="120px">
          <template v-slot="{ row }">{{ CONSTANT.GOODS_TYPE_MAP[row['goodsType']] }}</template>
        </ElTableColumn>
        <ElTableColumn label="类型" prop="type" width="120px">
          <template v-slot="{ row }">
            <span v-if="row['type'] === CONSTANT.STOCK_CHANGE_TYPE_IN" class="color-success">入库</span>
            <span v-else-if="row['type'] === CONSTANT.STOCK_CHANGE_TYPE_OUT" class="color-danger">出库</span>
            <span v-else-if="row['type'] === CONSTANT.STOCK_CHANGE_TYPE_RETURN" class="color-success">加工入库</span>
            <span v-else-if="row['type'] === CONSTANT.STOCK_CHANGE_TYPE_TRANSFER" class="color-danger">加工配料</span>
            <span v-else-if="row['type'] === CONSTANT.STOCK_CHANGE_TYPE_UNDO" class="color-warning">撤销</span>
            <span v-else class="color-info">未知</span>
          </template>
        </ElTableColumn>
        <ElTableColumn label="内容">
          <template v-slot="{ row }">
            {{ row.goodsName }}【{{ row.spec }}】
            <template v-if="row.count > 1">
              等 {{ row.count }} 件
            </template>
          </template>
        </ElTableColumn>
        <ElTableColumn label="订单" prop="orders" width="280px">
          <template v-slot="{ row }">
            <template v-if="row.orders && row.orders.length > 0">
              <ElTag v-for="(o, i) in row.orders" :key="i">{{ o.date.replace(/-/g,'/') }} - {{ o.code }} - {{ o.spec }} - {{ o.num }}KG</ElTag>
            </template>
            <template v-else>-</template>
          </template>
        </ElTableColumn>
        <ElTableColumn label="操作人" prop="showName" width="120px" />
        <ElTableColumn
          label="操作时间"
          prop="createdAt"
          width="180"
          :formatter="formatDatetime"
        />
        <ElTableColumn label="操作" width="180">
          <template v-slot="{ row }">
            <GlAsyncButton type="text" :click="() => showDetail(row)">详情</GlAsyncButton>
            <GlAsyncButton v-if="row.tableStockOutId" type="text" :click="() => doPrint(row.tableStockOutId)">打印出库单</GlAsyncButton>
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
import {getMoneyUppercase} from '@/api/helpers';
import {useUser} from '@/store';

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

const printSettings = ref(_printSettings);
async function doPrint(id) {
  try {
    const data = await printReduce(id);
    const PAGE_WIDTH = 2260;
    const PAGE_HEIGHT = 1400;
    const PAGE_PADDING = 100;
    const MAX_COUNT_PER_PAGE = 8;
    const RATIO = 0.52 / (window.devicePixelRatio ?? 1);
    LODOP.PRINT_INITA();
    LODOP.SET_PRINT_PAGESIZE(0, PAGE_WIDTH, PAGE_HEIGHT);
    LODOP.SET_PRINTER_INDEX(printSettings.value.printerIndex);
    const maxPage = Math.ceil(data.details.length / MAX_COUNT_PER_PAGE);
    for(let currentPage = 0; currentPage < maxPage; currentPage++) {
      if(currentPage > 0) {
        LODOP.NEWPAGEA();
      }
      let html = '<div>';
      html += '<div style="text-align: center;font-size: 22px; font-weight: bold">' + data.title + '</div>';
      html += '<div style="text-align: center;position: relative; margin-top: 0.5em; font-weight: bold; font-size: 16px">物资出库（送货单）' +
          '<div style="position:absolute; right: 0; top: 0;">单号.'+ data.id.toString().padStart(8, '0') +  '</div>' +
          '</div>';
      html += '<div style="position: relative; margin-top: 0.5em">接收单位：' + data.customerName +
          '<div style="position:absolute; right: 0;top: 0">' + data.date + '</div>' +
          '</div>';
      html += '<table style="margin-top: 0.5em" cellpadding="2" cellspacing="0" border="1" width="100%">';
      html += '<tr>';
      html += '<td width="15%" style="text-align: center">品名</td>';
      html += '<td width="20%" style="text-align: center">规格</td>';
      html += '<td width="10%" style="text-align: center">单位</td>';
      html += '<td width="15%" style="text-align: center">数量</td>';
      html += '<td width="15%" style="text-align: center">单价（元）</td>';
      html += '<td width="15%" style="text-align: center">金额（元）</td>';
      html += '<td width="15%" style="text-align: center">备注</td>';
      html += '</tr>';
      let amount = 0;
      for(let i = 0; i < MAX_COUNT_PER_PAGE && currentPage * MAX_COUNT_PER_PAGE + i < data.details.length; i++) {
        const item = data.details[currentPage * MAX_COUNT_PER_PAGE + i];
        html += '<tr>';
        html += `<td style="text-align: center">${item.goodsName}</td>`;
        html += `<td style="text-align: center">${item.spec}</td>`;
        html += `<td style="text-align: center">${item.unit}</td>`;
        html += `<td style="text-align: center">${item.num}</td>`;
        html += `<td style="text-align: center">${item.price}</td>`;
        html += `<td style="text-align: center">${item.total}</td>`;
        html += '<td></td>';
        html += '</tr>';
        amount += item.total;
      }
      if(currentPage === maxPage - 1) {
        for(let i = data.details.length % MAX_COUNT_PER_PAGE; i < MAX_COUNT_PER_PAGE; i++) {
          html += '<tr>';
          html += '<td>&nbsp;</td>';
          html += '<td></td>';
          html += '<td></td>';
          html += '<td></td>';
          html += '<td></td>';
          html += '<td></td>';
          html += '<td></td>';
          html += '</tr>';
        }
      }
      html += '<tr>';
      html += '<td style="text-align: center">合计金额：</td>';
      html += `<td style="" colspan="6">${getMoneyUppercase(amount, 1)}`
          + `<span style="float: right; letter-spacing: 0">￥<span style="text-decoration: underline;">&nbsp;&nbsp;${amount.toFixed(1)}&nbsp;&nbsp;</span></span>`
          + '</td>';
      html += '</table>';
      html += '</div>';
      html += '<table style="width: 100%; margin-top: 10px">';
      html += '<tr>';
      html += '<td width="12.5%">发货人：</td>';
      html += '<td width="12.5%"></td>';
      html += '<td width="12.5%">操作员：</td>';
      html += '<td width="12.5%"><td>';
      html += '<td width="12.5%">送货人：</td>';
      html += '<td width="12.5%"></td>';
      html += '<td width="12.5%">签收人：</td>';
      html += '<td width="12.5%"></td>';
      html += '</tr>';
      html += '</table>';
      html += '<div style="text-align: right">到货日期' +
          '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' +
          '年&nbsp;&nbsp;&nbsp;&nbsp;月&nbsp;&nbsp;&nbsp;&nbsp;日</div>';
      html += '<div>注：红联请买受人盖章（或签字）后带回给出卖人</div>';
      LODOP.ADD_PRINT_HTM(
        PAGE_PADDING * RATIO,
        PAGE_PADDING * RATIO,
        (PAGE_WIDTH - PAGE_PADDING * 2) * RATIO,
        (PAGE_HEIGHT - PAGE_PADDING * 2) * RATIO,
        html);
    }
    LODOP.PREVIEW();
  } catch (e) {
    console.log(e);
  }
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
