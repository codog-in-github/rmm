<template>
  <div class="flex flex-col">
    <GlFilterBar @search="pagnation.reset(getList)" />
    <div class="flex-auto">
      <ElTable :data="list" v-loading="pagnation.paginate.loading">
        <ElTableColumn label="加工名称" prop="name" />
        <ElTableColumn label="成品率" prop="rate" :formatter="(_, __, value) => (value * 100).toFixed(2)+'%'" />
        <ElTableColumn label="时间" prop="createdAt" :formatter="formatDate" />
      </ElTable>
    </div>
    <GlPagination :pagination="pagnation" :requestHook="getList" />
  </div>
</template>
<script setup>
import { formatDate, usePagination } from '@/helpers';
import { useReportProcessWithPagination } from '@/api';
import { ref } from 'vue';

const pagnation = usePagination();
const api = useReportProcessWithPagination(pagnation);
const list = ref([]);
async function getList() {
  const rep = await api();
  list.value = rep; 
}

getList();
</script>
