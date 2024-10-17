<template>
  <div class="inner-page-container flex flex-col">
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
      <template v-slot:after>
        <Component :is="showButton" />
      </template>
    </GlFilterBar>
    <div class="flex-auto overflow-auto h-1" v-loading="pagination.paginate.loading">
      <ElTable
        :data="list"
        stripe
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
        <ElTableColumn label="内容" prop="details" :formatter="detailsFormatter" />
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
        <ElTableColumn label="操作" width="220">
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
            <GlAsyncButton
              v-if="user.isRoot"
              type="danger"
              link
              :click="() => del(row.id)"
            >
              删除
            </GlAsyncButton>
          </template>
        </ElTableColumn>
      </ElTable>
    </div>
    <GlPagination class="m-t-2" :pagination="pagination" :requestHook="getList" />
    <DialogRecord v-model:visible="showDialog" :model="dialogData" readonly />
  </div>
</template>

<script setup>
import {delStockChangeRecord, getStockRecordDetail, printReduce, stockRecordUndo, useGetStockRecord} from '@/api';
import {ElMessage, ElMessageBox} from 'element-plus';
import {reactive, ref} from 'vue';
import DialogRecord from './DialogRecord.vue';
import * as CONSTANT from '@/constant';
import {formatDatetime, map2array, usePagination} from '@/helpers';
import {chukudan} from '@/helpers/printTemplates';
import {useUser} from '@/store';
import {usePrinter} from '@/helpers/lodop';

const user = useUser();
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
const { printSettings, showButton } = usePrinter();

const detailsFormatter = (value) => {
  return value.details.map(item => {
    return `${item.goods.name}【${item.spec}】${item.num}${item.unit.name}`;
  }).join('、');
};

function getList() {
  return getStockRecord(filters)
    .then(rep => {
      list.value = rep;
    });
}

async function del(id) {
  await ElMessageBox.confirm('确定要删除吗？');
  await delStockChangeRecord(id);
  ElMessage.success('删除成功');
  getList();
}

async function showDetail(row) {
  dialogData.value = await getStockRecordDetail(row.id);
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
async function doPrint(id) {
  try {
    const data = await printReduce(id);
    LODOP.PRINT_INITA();
    LODOP.SET_PRINTER_INDEX(printSettings.value.printerIndex);
    chukudan(data, LODOP);
    LODOP.PREVIEW();
  } catch (e) {
    console.log(e);
  }
}

pagination.reset(getList);
</script>
