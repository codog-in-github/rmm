<template>
  <div class="inner-page-container flex flex-col">
    <GlFilterBar @search="pagnation.reset(getList)" />
    <div class="flex-auto">
      <ElTable :data="list" v-loading="pagnation.paginate.loading" stripe>
        <ElTableColumn label="加工名称" prop="name" />
        <ElTableColumn label="理论成品率" prop="rate" :formatter="(_, __, value) => (value * 100).toFixed(2)+'%'" />
        <ElTableColumn label="实际成品率" prop="realRate" :formatter="(_, __, value) => value ?  ((value * 100).toFixed(2)+'%') : '-'" />
        <ElTableColumn label="时间" prop="createdAt" :formatter="formatDatetime" />
      </ElTable>
    </div>
    <GlPagination :pagination="pagnation" :requestHook="getList" />
    <ProcessDialog :storehouses="storehouses" :model="detail" :visible="show" />
  </div>
</template>
<script setup>
import { formatDatetime, usePagination } from '@/helpers';
import { useReportProcess } from '@/api';
import { ref } from 'vue';
import ProcessDialog from './ProcessDialog.vue';
const detail = ref(null);
const show = ref(false);
const pagnation = usePagination();
const api = useReportProcess(pagnation);
const list = ref([]);
async function getList() {
  const rep = await api();
  list.value = rep;
}

getList();
</script>
