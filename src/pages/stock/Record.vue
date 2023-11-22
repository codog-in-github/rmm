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
            <span v-else class="color-danger">未知</span>
          </template>
        </ElTableColumn>
        <ElTableColumn label="出/入库成本" prop="total" />
        <ElTableColumn label="操作人" prop="username" />
        <ElTableColumn label="操作时间" prop="created_at" width="180">
          <template v-slot="{ row }">
            {{ moment(row['created_at']).format('YYYY-MM-DD hh:mm:ss') }}
          </template>
        </ElTableColumn>
        <ElTableColumn label="操作" width="180">
          <template v-slot="{ row }">
            <GlAsyncButton type="text" :click="() => showDetail(row)">详情</GlAsyncButton>
            <GlAsyncButton
              v-if="
                bitHas(
                  row['type'],
                  CONSTANT.STOCK_CHANGE_TYPE_IN
                    | CONSTANT.STOCK_CHANGE_TYPE_OUT
                )
              "
              type="text"
              :click="() => reverse(row)"
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
import { getSelfStorehouse, getStockRecordDetail, useGetStockRecordWithPagination } from '@/api';
import { ElMessage } from 'element-plus';
import { ref, reactive } from 'vue';
import Dialog from './Dialog.vue';
import * as CONSTANT from '@/constant';
import moment from 'moment';
import { usePagination } from '@/helpers/pagination';
import { bitHas } from '@/helpers';

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
