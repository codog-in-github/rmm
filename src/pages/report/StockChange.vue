<template>
  <div class="inner-page-container flex flex-col">
    <GlFilterBar @search="getList" :model="filters">
      <GlFilterItem
        label="原材料类型"
        prop="processType"
        type="select"
        :disabled="filters.stockChangeType !== STOCK_CHANGE_TYPE_RETURN"
        :options="typeOptions"
      />
      <GlFilterItem
        label="出入库类型"
        prop="stockChangeType"
        type="select"
        :options="stockChangeType"
        @change="stockChangeTypeChange"
      />
      <GlFilterItem
        label="时间"
        type="daterange"
        prop="date"
        :clearable="false"
      />
    </GlFilterBar>
    <div class="flex-auto">
      <ElTable :data="list" v-loading="loading">
        <ElTableColumn label="名称" prop="goodsName" />
        <ElTableColumn label="规格（MM）">
          <template v-slot="{ row }">
            <template v-if="row.subSpec">【{{ row.subSpec }}】</template>
            {{ row.spec }}
          </template>
        </ElTableColumn>
        <ElTableColumn label="数量（KG）" prop="num"  />
      </ElTable>
    </div>
  </div>
</template>
<script setup>
import moment from 'moment';
import { map2array } from '@/helpers';
import { getStockChange } from '@/api';
import { reactive, ref } from 'vue';
import {
  GOODS_PROCESS_TYPE_MAP,
  GOODS_PROCESS_TYPE_PRODUCT, GOODS_PROCESS_TYPE_RAW, STOCK_CHANGE_TYPE_IN,
  STOCK_CHANGE_TYPE_MAP, STOCK_CHANGE_TYPE_OUT,
  STOCK_CHANGE_TYPE_RETURN, STOCK_CHANGE_TYPE_TRANSFER,
  STOCK_CHANGE_TYPE_UNDO
} from '@/constant';

const list = ref([]);
const loading = ref(false);
const filters = reactive({
  processType:     GOODS_PROCESS_TYPE_PRODUCT,
  stockChangeType: STOCK_CHANGE_TYPE_RETURN,
  date:            [
    moment().startOf('month').format('YYYY-MM-DD'),
    moment().endOf('month').format('YYYY-MM-DD')
  ]
});
const typeOptions = map2array(GOODS_PROCESS_TYPE_MAP);
const stockChangeType = map2array(STOCK_CHANGE_TYPE_MAP, STOCK_CHANGE_TYPE_UNDO);
async function getList() {
  loading.value = true;
  try {
    list.value = await getStockChange(filters);
  } finally {
    loading.value = false;
  }
}

function stockChangeTypeChange(value) {
  switch (value) {
  case STOCK_CHANGE_TYPE_TRANSFER:
  case STOCK_CHANGE_TYPE_IN:
    filters.processType = GOODS_PROCESS_TYPE_RAW;
    break;
  case STOCK_CHANGE_TYPE_OUT:
    filters.processType = GOODS_PROCESS_TYPE_PRODUCT;
    break;
  }
}

getList();
</script>
