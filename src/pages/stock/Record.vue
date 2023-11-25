<template>
  <div class="flex flex-col">
    <GlFilterBar :model="filters" @search="pagination.reset(getList)" class="m-b-4" />
    <div class="flex-auto" v-loading="pagination.paginate.loading">
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
            <span v-else-if="row['type'] === CONSTANT.STOCK_CHANGE_TYPE_OUT" class="color-warning">出库</span>
            <span v-else-if="row['type'] === CONSTANT.STOCK_CHANGE_TYPE_UNDO" class="color-danger">反冲</span>
            <span v-else class="color-danger">未知</span>
          </template>
        </ElTableColumn>
        <ElTableColumn label="出/入库成本（元）" prop="total" />
        <ElTableColumn label="操作人" prop="showName" />
        <ElTableColumn label="操作时间" prop="createdAt" width="180">
          <template v-slot="{ row }">
            {{ moment(row.createdAt).format('YYYY-MM-DD hh:mm') }}
          </template>
        </ElTableColumn>
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
              反冲
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
import moment from 'moment';
import { usePagination } from '@/helpers/pagination';

const storehouseId = ref(null);
const list = ref([]);
const filters = reactive({});
const showDialog = ref(false);
const dialogData = ref(null);
const pagination = usePagination();
const getStockRecord = useGetStockRecordWithPagination(pagination);

function getList() {
  return getStockRecord(storehouseId.value)
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
    const { value: comment } = await ElMessageBox.prompt('请输入原因', '确定要反冲吗？', {
      inputPattern:      /^[\u4e00-\u9fa5\w\s]{1,20}$/,
      inputErrorMessage: '请输入1-20个字符'
    });
    await stockRecordUndo(id, comment);
    ElMessage.success('反冲成功');
    getList();
  } catch (error) {
    //
  }
}

getSelfStorehouse()
  .then(storehouseList => {
    if(storehouseList.length > 0) {
      storehouseId.value = storehouseList[0].id;
      return pagination.reset(getList);
    }
    const errMsg = '您的账号未绑定仓库，请联系管理员添加';
    ElMessage.error(errMsg);
    throw Error(errMsg);
  });
</script>
