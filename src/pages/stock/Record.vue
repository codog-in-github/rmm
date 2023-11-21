<template>
  <div class="flex flex-col">
    <GlFilterBar :model="filters" @search="pagination.reset(getList)" class="m-b-4" />
    <div class="flex-auto" v-loading="pagination.paginate.loading">
      <ElTable
        :data="list"
        border
        height="100%"
      >
        <ElTableColumn label="库存类型" prop="goods_type">
          <template v-slot="{ row }">{{ GOODS_TYPE_MAP[row['goods_type']] }}</template>
        </ElTableColumn>
        <ElTableColumn label="类型" prop="type">
          <template v-slot="{ row }">
            <span v-if="row['type'] === 1" class="color-success">入库</span>
            <span v-else class="color-warning">出库</span>
          </template>
        </ElTableColumn>
        <ElTableColumn label="库存名称" prop="goods_name" />
        <ElTableColumn label="规格" prop="goods_specification_name" />
        <ElTableColumn label="数量" prop="num" />
        <ElTableColumn label="价值" prop="total" />
        <ElTableColumn label="操作人" prop="username" />
        <ElTableColumn label="操作时间" prop="created_at" width="180">
          <template v-slot="{ row }">
            {{ moment(row['created_at']).format('YYYY-MM-DD hh:mm:ss') }}
          </template>
        </ElTableColumn>
      </ElTable>
    </div>
    <div class="m-t-2">
      <GlPagination :pagination="pagination" :requestHook="getList" />
    </div>
    <Dialog v-model:visible="showDialog" :model="dialogData" @success="getList" />
  </div>
</template>

<script setup>
import { getSelfStorehouse, useGetStockRecordWithPagination } from '@/api';
import { ElMessage } from 'element-plus';
import { ref, reactive } from 'vue';
import Dialog from './Dialog.vue';
import { GOODS_TYPE_MAP } from '@/constant';
import moment from 'moment';
import { usePagination } from '@/helpers/pagination';

const storehouseId = ref(null);
const list = ref([]);
const filters = reactive({});
const loading = ref(false);
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