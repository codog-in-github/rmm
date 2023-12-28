<template>
  <div class="flex flex-col">
    <GlFilterBar @search="pagnation.reset(getList)" />
    <div class="flex-auto">
      <ElTable :data="list" v-loading="pagnation.paginate.loading">
        <ElTableColumn label="加工名称" prop="name" />
        <ElTableColumn label="成品率" prop="rate" :formatter="(_, __, value) => (value * 100).toFixed(2)+'%'" />
        <ElTableColumn label="时间" prop="createdAt" :formatter="formatDate" />
        <!-- <ElTableColumn label="操作">
          <template v-slot="{ row }">
            <ElButton type="primary" link @click="showDetail(row.id)">详情</ElButton>
          </template>
        </ElTableColumn> -->
      </ElTable>
    </div>
    <GlPagination :pagination="pagnation" :requestHook="getList" />
    <ProcessDialog :storehouses="storehouses" :model="detail" :visible="show" />
  </div>
</template>
<script setup>
import { formatDate, usePagination } from '@/helpers';
import { getProcessDetail, useReportProcess } from '@/api';
import { ref } from 'vue';
import ProcessDialog from './ProcessDialog.vue';
import { ElMessage } from 'element-plus';
const detail = ref(null);
const show = ref(false);
const pagnation = usePagination();
const api = useReportProcess(pagnation);
const list = ref([]);
async function getList() {
  const rep = await api();
  list.value = rep; 
}

async function showDetail(id) {
  if(id) {
    const rep = await getProcessDetail(id);
    if(rep) {
      show.value = true;
      detail.value = rep;
    } else {
      ElMessage.error('未找到该加工');
    }
  }
}

getList();
</script>
