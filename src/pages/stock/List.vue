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
        <GlFilterItem label="所属仓库">
          <ElCascader
            v-model="filters.belong"
            clearable
            :options="stockTypes"
            :props="{
              checkStrictly: true,
            }"
          />
        </GlFilterItem>
        <GlFilterItem
          label="入库日期"
          prop="warehousedAt"
          type="daterange"
          :controllerStyle="{ width: '160px' }"
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
      <div class="mb-6" v-if="user.can('stock.edit')">
        <ElButton @click="add" type="success" icon="plus">新增入库</ElButton>
        <ElButton @click="showDialogReduce = true" type="primary" icon="minus">领料出库</ElButton>
        <ElButton @click="printSettingsShow = true">打印设置</ElButton>
      </div>
      <ElTable
        :data="list"
        stripe
      >
        <ElTableColumn label="序号" width="80px">
          <template v-slot="{ $index }">
            {{ $index || '结存' }}
          </template>
        </ElTableColumn>
        <ElTableColumn label="所属仓库" prop="storehouseName" width="160px" />
        <ElTableColumn label="入库日期" prop="updatedAt" width="160px">
          <template v-slot="{ row }">
            {{ row.warehousedAt?.substring(0, 10) ?? '-' }}
          </template>
        </ElTableColumn>
        <ElTableColumn label="库存类型" prop="goodsType" width="120px">
          <template v-slot="{ row }">
            <template v-if="row.processType === 0">
              {{ GOODS_TYPE_MAP[row.goodsType] }}
            </template>
            <template v-else>
              {{ GOODS_PROCESS_TYPE_MAP[row.processType] }}
            </template>
          </template>
        </ElTableColumn>
        <ElTableColumn label="名称" prop="goodsName" width="120px" />
        <ElTableColumn
          label="规格(MM)"
          prop="spec"
          :formatter="specContent"
          width="160px"
        />
        <ElTableColumn
          label="库存总数"
          prop="goodsNum"
          width="160px"
          align="right"
        >
          <template v-slot="{ row }">
            <div>
              <span>{{ formatNum(row.goodsNum) }}</span>
              <span v-if="row.baseUnitName">（{{ row.baseUnitName }}）</span>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn width="20px" />
        <ElTableColumn label="操作时间" prop="updatedAt" width="180px">
          <template v-slot="{ row, $index }">
            {{  $index > 0 ? moment(row.updatedAt).format('YYYY-MM-DD HH:mm') : '' }}
          </template>
        </ElTableColumn>
        <ElTableColumn label="操作" width="232px" v-if="user.can('stock.edit')">
          <template v-slot="{ row, $index }">
            <template v-if="$index > 0">
              <ElButton type="primary" link @click="showOut(row)">
                出库
              </ElButton>
              <ElButton type="primary" link @click="showTransfer(row)">
                移仓
              </ElButton>
              <ElButton
                v-if="user.isRoot"
                type="danger"
                link
                @click="del(row)"
              >
                删除
              </ElButton>
            </template>
          </template>
        </ElTableColumn>
      </ElTable>
    </div>
    <Dialog v-model:visible="showDialog" :model="dialogData" @success="getList" />
    <DialogProduct v-model:visible="showDialogProduct" :model="productDialogData" @success="getList" />
    <DialogReduce ref="reduceRef" @success="reduceSuccess" v-model:visible="showDialogReduce" />
    <GlPrintSetting v-model:visible="printSettingsShow" :model="printSettings" @submit="savePrintSettings" />
    <ElDialog
      title="移仓"
      v-model="trasVisible"
      width="300px"
    >
      <ElForm :model="trasData" labelWidth="80px">
        <ElFormItem label="移仓仓库" prop="to" required>
          <ElSelectV2
            v-model="trasData.to"
            placeholder="请选择移仓仓库"
            :options="trasData.storehouses"
          />
        </ElFormItem>
        <ElFormItem label="移仓数量" prop="num" required>
          <ElInput
            type="number"
            v-model="trasData.num"
            :min="0"
            :max="trasData.total"
          >
            <template v-slot:append>{{ trasData.unit }}</template>
          </ElInput>
        </ElFormItem>
      </ElForm>
      <template v-slot:footer>
        <ElButton @click="trasVisible = false">取消</ElButton>
        <ElButton type="primary" @click="tras">确定</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup>
import {delStock, getOptions, getStock, printReduce} from '@/api';
import {ElMessage, ElMessageBox} from 'element-plus';
import { ref, reactive } from 'vue';
import Dialog from './Dialog.vue';
import {
  GOODS_PROCESS_TYPE_MAP,
  GOODS_TYPE_MAP,
  STOCK_TYPE_RAW, STOCK_TYPE_STOREHOUSE_ALIAS
} from '@/constant';
import DialogReduce from '@/pages/stock/DialogReduce.vue';
import DialogProduct from '@/pages/stock/DialogProduct.vue';
import { chukudan } from '@/helpers/printTemplates';
import { useUser } from '@/store';
import moment from 'moment';
import {makeRequest, pluck} from '@/api/helpers';

const user = useUser();
const storehouse = ref([]);
const goods = ref([]);
const list = ref([]);
const filters = reactive({
  belong: ''
});
const loading = ref(false);
const showDialog = ref(false);
const showDialogProduct = ref(false);
const showDialogReduce = ref(false);
const dialogData = ref(null);
const productDialogData = ref(null);
const reduceRef = ref(null);
const stockTypes = ref([]);
makeRequest('/storehouse/tree')().then(rep => {
  stockTypes.value = Object.keys(rep).map(key => {
    return {
      label:    STOCK_TYPE_STOREHOUSE_ALIAS[key],
      value:    ~~key,
      children: rep[key].map(item => ({
        label: item.name,
        value: item.id
      }))
    };
  });
});
const getTransferInitData = makeRequest('/getTransferInitData', 'id');
const stockTransfer = makeRequest('/stockTransfer');
const trasVisible = ref(false);
const trasData = ref({
  from:        null,
  to:          null,
  num:         0,
  total:       0,
  unit:        '',
  storehouses: []
});

const getSummaries = (data) => {
  const totalProperty = 'goodsNum';
  let total = 0;
  if(!data || !data.length) {
    return [{
      [totalProperty]: total
    }];
  }

  const unit = data[0].baseUnitName;
  const totalRow = {};
  if(data.some(item => item.baseUnitName !== unit)) {
    totalRow[totalProperty] = 'N/A';
    totalRow.baseUnitName = '';
  } else {
    totalRow[totalProperty] = data.reduce((acc, cur) => acc + cur.goodsNum, 0);
    totalRow.baseUnitName = unit;
  }
  return [totalRow].concat(data);
};

async function showTransfer(row) {
  const data = await getTransferInitData(row.id);
  trasVisible.value = true;
  trasData.value = {
    to:          null,
    from:        row.id,
    num:         data.total,
    total:       data.total,
    unit:        row.baseUnitName,
    storehouses: data.storehouses.map(item => ({
      label: item.name,
      value: item.id
    }))
  };
}

async function tras() {
  const data = pluck(trasData.value, 'from', 'to', 'num');
  if(!data.to) {
    ElMessage.error('请选择移仓仓库');
    return;
  }
  if(data.num <= 0 || data.num > trasData.value.total) {
    ElMessage.error('移仓数量有误');
    return;
  }
  await stockTransfer(data);
  ElMessage.success('移仓成功');
  trasVisible.value = false;
  getList();
}

async function del(row) {
  await ElMessageBox.confirm('确定删除该库存？');
  await delStock(row.id);
  ElMessage.success('删除成功');
  getList();
}


function add() {
  dialogData.value = {
    details:      [{}],
    goodsType:    STOCK_TYPE_RAW,
    warehousedAt: moment().format('YYYY-MM-DD')
  };
  showDialog.value  = true;
}
function specContent(row, _, value) {
  if(!value) {
    return '';
  }
  let content = '';
  if(row.subSpec) {
    content = `【${row.subSpec}】`;
  }
  content += value;
  return content;
}

const showOut = (row) => {
  reduceRef.value.show(row.goodsType, row.goodsId, row.id, row.goodsNum, row.unitId);
};

function formatNum(val) {
  return val?.toFixed(4).replace(/\.?0+$/, '');
}
function getList() {
  loading.value = true;
  getStock(filters)
    .then(rep => {
      list.value = getSummaries(rep);
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
