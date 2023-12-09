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
        <ElTableColumn label="库存类型" prop="goodsType">
          <template v-slot="{ row }">{{ CONSTANT.GOODS_TYPE_MAP[row['goodsType']] }}</template>
        </ElTableColumn>
        <ElTableColumn label="类型" prop="type">
          <template v-slot="{ row }">
            <span v-if="row['type'] === CONSTANT.STOCK_CHANGE_TYPE_IN" class="color-success">入库</span>
            <span v-else-if="row['type'] === CONSTANT.STOCK_CHANGE_TYPE_OUT" class="color-danger">出库</span>
            <span v-else-if="row['type'] === CONSTANT.STOCK_CHANGE_TYPE_RETURN" class="color-success">加工入库</span>
            <span v-else-if="row['type'] === CONSTANT.STOCK_CHANGE_TYPE_TRANSFER" class="color-danger">加工配料</span>
            <span v-else-if="row['type'] === CONSTANT.STOCK_CHANGE_TYPE_UNDO" class="color-warning">撤销</span>
            <span v-else class="color-info">未知</span>
          </template>
        </ElTableColumn>
        <ElTableColumn label="操作人" prop="showName" />
        <ElTableColumn
          label="操作时间"
          prop="createdAt"
          width="180"
          :formatter="formatDate"
        />
        <ElTableColumn label="操作" width="180">
          <template v-slot="{ row }">
            <GlAsyncButton type="text" :click="() => showDetail(row)">详情</GlAsyncButton>
            <GlAsyncButton
              v-if="[
                CONSTANT.STOCK_CHANGE_TYPE_IN,
                CONSTANT.STOCK_CHANGE_TYPE_OUT
              ].includes(row.type) && !row.undidAt"
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
  useGetStockRecordWithPagination,
  stockRecordUndo
} from '@/api';
import { ElMessage, ElMessageBox } from 'element-plus';
import { ref, reactive } from 'vue';
import Dialog from './Dialog.vue';
import * as CONSTANT from '@/constant';
import { usePagination, formatDate, map2array } from '@/helpers';

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
const getStockRecord = useGetStockRecordWithPagination(pagination);

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
