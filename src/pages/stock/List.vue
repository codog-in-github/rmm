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
        <ElTableColumn label="操作" v-if="user.isRoot">
          <template v-slot="{ row }">
            <ElButton type="danger" link @click="del(row)">
              删除
            </ElButton>
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
import {delStock, getSelfStorehouse, getStock, printReduce} from '@/api';
import {ElMessage, ElMessageBox} from 'element-plus';
import { ref, reactive } from 'vue';
import Dialog from './Dialog.vue';
import { GOODS_PROCESS_TYPE_MAP, GOODS_TYPE_MAP, GOODS_TYPE_RAW, STOCK_TYPE_MAP } from '@/constant';
import { isStandardSpec, map2array } from '@/helpers';
import DialogReduce from '@/pages/stock/DialogReduce.vue';
import DialogProduct from '@/pages/stock/DialogProduct.vue';
import {chukudan} from '@/helpers/printTemplates';
import { useUser } from '@/store';
const user = useUser();

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
async function del(row) {
  await ElMessageBox.confirm('确定删除该库存？');
  await delStock(row.id);
  ElMessage.success('删除成功');
  getList();
}
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
  LODOP.SET_PRINTER_INDEX(printSettings.value.printerIndex);
  chukudan(data, LODOP);
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
