<template>
  <div class="flex flex-col">
    <GlFilterBar @search="pagnation.reset(getList)" />
    <div class="flex-auto h-1">
      <ElTable :data="list" height="100%" v-loading="pagnation.paginate.loading">
        <ElTableColumn label="类型">
          <template v-slot="{ row }">
            {{ PROFIT_TYPE_MAP[row.type] }}
          </template>
        </ElTableColumn>
        <ElTableColumn label="金额（元）" prop="value" :formatter="(_, __, value) => value?.toFixed(2)" />
        <ElTableColumn label="时间" prop="createdAt" :formatter="formatDatetime" />
      </ElTable>
    </div>
    <GlPagination class="m-t-2" :pagination="pagnation" :requestHook="getList" />
  </div>
</template>
<script setup>
import { formatDatetime, usePagination } from '@/helpers';
import { useReportProfit } from '@/api';
import { PROFIT_TYPE_MAP } from '@/constant';
import { ref } from 'vue';

const pagnation = usePagination();
const api = useReportProfit(pagnation);
const list = ref([]);
async function getList() {
  list.value = await api();
}

getList();
</script>
