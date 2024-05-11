<template>
  <div class="flex flex-col">
    <GlFilterBar :model="filters" @search="getList" class="m-b-4">
      <GlFilterItem
        label="库存类型"
        prop="type"
        type="select"
        :options="goodsOptions"
      />
      <template v-slot:after>
        <ElButton @click="add" type="primary" icon="plus">新增入库</ElButton>
        <ElButton @click="addProduct" type="primary" icon="plus">成品入库</ElButton>
        <ElButton @click="showDialogReduce = true" type="primary" icon="plus">新增出库</ElButton>
        <ElButton icon="Setting" type="primary" @click="printSettingsShow = true">打印设置</ElButton>
      </template>
    </GlFilterBar>
    <div class="flex-auto h-1" v-loading="loading">
      <ElTable :data="list" border height="100%">
        <ElTableColumn label="库存类型" prop="goodsType">
          <template v-slot="{ row }">
            <template v-if="row.processType === 0">
              {{ GOODS_TYPE_MAP[row.goodsType] }}
            </template>
            <template v-else>
              {{ GOODS_PROCESS_TYPE_MAP[row.processType] }}
            </template>
          </template>
        </ElTableColumn>
        <ElTableColumn label="名称" prop="goodsName" />
        <ElTableColumn label="规格" prop="spec" :formatter="specContent" />
        <ElTableColumn label="库存总数" prop="goodsNum">
          <template v-slot="{ row }">
            <div class="flex justify-between">
              <span>{{ formatNum(row.goodsNum) }}</span>
              <span v-if="row.baseUnitName">（{{ row.baseUnitName }}）</span>
            </div>
          </template>
        </ElTableColumn>
      </ElTable>
    </div>
    <Dialog v-model:visible="showDialog" :model="dialogData" @success="getList" />
    <DialogProduct v-model:visible="showDialogProduct" :model="productDialogData" @success="getList" />
    <DialogReduce @success="reduceSuccess" :storehouseId="storehouseId" v-model:visible="showDialogReduce" />
    <GlPrintSetting v-model:visible="printSettingsShow" :model="printSettings" @submit="savePrintSettings" />
  </div>
</template>

<script setup>
import {getSelfStorehouse, getStock, printReduce} from '@/api';
import {ElMessage, ElMessageBox} from 'element-plus';
import { ref, reactive } from 'vue';
import Dialog from './Dialog.vue';
import { GOODS_PROCESS_TYPE_MAP, GOODS_TYPE_MAP, GOODS_TYPE_RAW, STOCK_TYPE_MAP } from '@/constant';
import { isStandardSpec, map2array } from '@/helpers';
import DialogReduce from '@/pages/stock/DialogReduce.vue';
import {useUser} from '@/store';
import DialogProduct from '@/pages/stock/DialogProduct.vue';

const goodsOptions = map2array(STOCK_TYPE_MAP);
const storehouseId = ref(null);
const list = ref([]);
const filters = reactive({
  type: GOODS_TYPE_RAW
});
const loading = ref(false);
const showDialog = ref(false);
const showDialogProduct = ref(false);
const showDialogReduce = ref(false);
const dialogData = ref(null);
const productDialogData = ref(null);
function add() {
  dialogData.value = {
    storehouseId: storehouseId.value,
    details:      [],
    comment:      ''
  };
  showDialog.value  = true;
}
function addProduct() {
  productDialogData.value = {
    storehouseId: storehouseId.value,
    goodsType:    GOODS_TYPE_RAW,
    details:      [],
    comment:      ''
  };
  showDialogProduct.value  = true;
}
function specContent(row, _, value) {
  let content = '';
  if(row.subSpec) {
    content = `【${row.subSpec}】`;
  }
  content += value;
  if(isStandardSpec(value)) {
    content += '(mm)';
  } 
  return content;
}

function formatNum(val) {
  return val.toFixed(4).replace(/\.?0+$/, '');
}
function getList() {
  loading.value = true;
  getStock(storehouseId.value, filters)
    .then(rep => {
      list.value = rep;
    })
    .finally(() => {
      loading.value = false;
    });
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
const canPrint = Boolean(LODOP);
async function reduceSuccess(id) {
  if(canPrint) {
    try {
      await ElMessageBox.confirm('出库成功，是否打印？');
      doPrint(id);
    } catch (none) {
      //
    }
  }
  getList();
}

async function doPrint(id) {
  const data = await printReduce(id);
  LODOP.PRINT_INITA();
  LODOP.SET_PRINT_PAGESIZE(1, 0 ,0, 'A5');
  LODOP.SET_PRINTER_INDEX(printSettings.value.printerIndex);
  let html = '<div>';
  html += '<div style="text-align: center;font-size: 18px; font-weight: bold">' + data.title + '</div>';
  html += '<div style="text-align: center;position: relative; margin-top: 0.5em; font-weight: bold">物资出库（送货单）' +
      '<div style="position:absolute; right: 0;top: 0;">单号.'+ data.id.toString().padStart(8, '0') +  '</div>' +
      '</div>';
  html += '<div style="position: relative; margin-top: 0.5em">单据类型：销售发货'+
      '<div style="position:absolute; right: 0;top: 0">' + data.date + '</div>' +
      '</div>';
  html += '<div style="position: relative; margin-top: 0.5em">接收单位：' + data.customerName + '</div>';
  html += '<table style="margin-top: 0.5em" cellpadding="2" cellspacing="1" border="1" width="100%">';
  html += '<tr>';
  html += '<td>品名</td>';
  html += '<td>规格</td>';
  html += '<td>单位</td>';
  html += '<td>数量</td>';
  html += '<td>单价（元）</td>';
  html += '<td>金额（元）</td>';
  html += '<td>备注</td>';
  html += '</tr>';
  let amount = 0;
  for(let i = 0; i < data.details.length; i++) {
    const item = data.details[i];
    html += '<tr>';
    html += `<td>${item.goodsName}</td>`;
    html += `<td>${item.spec}</td>`;
    html += `<td>${item.unit}</td>`;
    html += `<td>${item.num}</td>`;
    html += `<td>${item.price}</td>`;
    html += `<td>${item.total}</td>`;
    html += '<td></td>';
    html += '</tr>';
    amount += item.total;
  }
  html += '<tr>';
  html += '<td>合计</td>';
  html += '<td></td>';
  html += '<td></td>';
  html += '<td></td>';
  html += '<td></td>';
  html += `<td>${amount}</td>`;
  html += '<td></td>';
  html += '</table>';
  html += '</div>';
  html+= '<table style="width: 100%; font-size: 12px; margin-top: 10px">';
  html+= '<tr>';
  html+= '<td width="12.5%">发货人：</td>';
  html+= '<td width="12.5%"></td>';
  html+= '<td width="12.5%">操作员：</td>';
  html+= `<td width="12.5%">${useUser().name}</td>`;
  html+= '<td width="12.5%">送货人：</td>';
  html+= '<td width="12.5%"></td>';
  html+= '<td width="12.5%">签收人：</td>';
  html+= '<td width="12.5%"></td>';
  html+= '</tr>';
  html += '</table>';
  html += '<div style="text-align: right">到货日期' +
      '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' +
      '年&nbsp;&nbsp;&nbsp;&nbsp;月&nbsp;&nbsp;&nbsp;&nbsp;日</div>';
  html += '<div>注：红联请买受人盖章（或签字）后带回给出卖人</div>';
  LODOP.ADD_PRINT_HTM(10, 10, 500, 500, html);
  LODOP.PREVIEW();
}
getSelfStorehouse()
  .then(storehouseList => {
    loading.value = true;
    if(storehouseList.length > 0) {
      storehouseId.value = storehouseList[0].id;
      return getList();
    }
    loading.value = false;
    const errMsg = '您的账号未绑定仓库，请联系管理员添加';
    ElMessage.error(errMsg);
    throw Error(errMsg);
  });
</script>
