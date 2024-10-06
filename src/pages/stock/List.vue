<template>
  <div class="flex flex-col">
    <div class="filter-container">
      <GlFilterBar
        :model="filters"
        @search="getList"
        class="m-b-4"
        showReset
        :defaultValue="() => ({})"
      >
        <GlFilterItem
          label="所属仓库"
          prop="storehouseId"
          type="select"
          :options="storehouse"
          :controllerStyle="{ width: '120px' }"
        />
        <GlFilterItem
          label="入库日期"
          prop="warehousedAt"
          type="daterange"
          :controllerStyle="{ width: '160px' }"
        />
        <GlFilterItem
          label="库存类型"
          prop="type"
          type="select"
          :options="stockTypes"
          :controllerStyle="{ width: '120px' }"
        />
        <GlFilterItem
          label="规格"
          prop="spec"
          :controllerStyle="{ width: '120px' }"
        />
        <GlFilterItem
          label="名称"
          prop="goodsId"
          type="select"
          :controllerStyle="{ width: '120px' }"
          :options="goods"
        />
        <GlFilterItem
          label="操作时间"
          prop="updateAt"
          type="daterange"
          :controllerStyle="{ width: '160px' }"
        />
      </GlFilterBar>
    </div>
    <div class="bg-white flex-auto overflow-auto px-7 pt-6" v-loading="loading">
      <div class="mb-6">
        <ElButton @click="add" type="success" icon="plus">新增入库</ElButton>
        <ElButton @click="showDialogReduce = true" type="primary" icon="minus">领料出库</ElButton>
        <ElButton @click="printSettingsShow = true">打印设置</ElButton>
      </div>
      <ElTable :data="list" stripe>
        <ElTableColumn label="序号">
          <template v-slot="{ $index }">
            {{ $index + 1 }}
          </template>
        </ElTableColumn>
        <ElTableColumn label="所属仓库" prop="storehouse">
          <template v-slot="{ row }">
            {{ row.storehouse.name }}
          </template>
        </ElTableColumn>
        <ElTableColumn label="入库日期" prop="updatedAt">
          <template v-slot="{ row }">
            {{ row.warehousedAt?.substring(0, 10) ?? '-' }}
          </template>
        </ElTableColumn>
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
        <ElTableColumn label="操作时间" prop="updatedAt">
          <template v-slot="{ row }">
            {{ moment(row.updatedAt).format('YYYY-MM-DD HH:mm') }}
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
    <DialogReduce @success="reduceSuccess" v-model:visible="showDialogReduce" />
    <GlPrintSetting v-model:visible="printSettingsShow" :model="printSettings" @submit="savePrintSettings" />
  </div>
</template>

<script setup>
import {delStock, getOptions, getSelfStorehouse, getStock, printReduce} from '@/api';
import {ElMessage, ElMessageBox} from 'element-plus';
import { ref, reactive } from 'vue';
import Dialog from './Dialog.vue';
import {GOODS_PROCESS_TYPE_MAP, GOODS_TYPE_MAP, GOODS_TYPE_RAW, STOCK_TYPE_MAP, STOCK_TYPE_RAW} from '@/constant';
import { isStandardSpec, map2array } from '@/helpers';
import DialogReduce from '@/pages/stock/DialogReduce.vue';
import DialogProduct from '@/pages/stock/DialogProduct.vue';
import { chukudan } from '@/helpers/printTemplates';
import { useUser } from '@/store';
import moment from 'moment';

const user = useUser();
const storehouse = ref([]);
const goods = ref([]);
const stockTypes = map2array(STOCK_TYPE_MAP);
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
    details:      [],
    goodsType:    STOCK_TYPE_RAW,
    warehousedAt: moment().format('YYYY-MM-DD')
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
getOptions('storehouse,goods').then((rep) => {
  storehouse.value = rep['storehouse'];
  goods.value = rep['goods'];
});
getList();
</script>

<style lang="scss" scoped>
.filter-container{
  background-color: #fff;
  padding: 30px;
  margin-bottom: 10px;
  border-radius: 10px;
}

:deep(.gl-filter-bar){
  margin-bottom: 0;
}
</style>
