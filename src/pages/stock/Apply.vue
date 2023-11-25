<template>
  <div class="flex flex-col">
    <GlFilterBar @search="pagnation.reset(getList)" />
    <div class="flex-auto">
      <ElTable :data="list" v-loading="pagnation.paginate.loading">
        <ElTableColumn label="申请编号" prop="id" />
        <ElTableColumn label="申请车间" prop="workshopName" />
        <ElTableColumn label="申请时间" prop="createdAt" :formatter="formatDate" />
        <ElTableColumn label="申请人" prop="applyUserName" />
        <ElTableColumn label="操作">
          <template v-slot="{ row }">
            <ElButton type="text" @click="showDetail(row.id)">详情</ElButton>
          </template>
        </ElTableColumn>
      </ElTable>
    </div>
    <GlPagination :pagination="pagnation" :requestHook="getList" />
    <ApplyDetail v-model:visible="detailVisible" :model="detailData" @submit="submitHandler" />
  </div>
</template>
<script setup>
import { getSelfStorehouse, useGetApplyListWithPagination, getApplyDetail, doApply } from '@/api';
import { usePagination, formatDate } from '@/helpers';
import { ElMessage } from 'element-plus';
import { ref } from 'vue';
import ApplyDetail from './ApplyDetail.vue';

const pagnation = usePagination();
const getApplyList =  useGetApplyListWithPagination(pagnation);
const storehouseId = ref(null);
const list = ref([]);
const detailVisible = ref(false);
const detailData = ref(null);

async function getList() {
  const rep = await getApplyList(storehouseId.value);
  list.value = rep;
}
async function init() {
  const storehouseList = await getSelfStorehouse();
  if(storehouseList.length > 0) {
    storehouseId.value = storehouseList[0].id;
    return pagnation.reset(getList);
  }
  ElMessage.error('您的账号未绑定仓库，请联系管理员添加');
}
init();

async function showDetail(id) {
  const rep = await getApplyDetail(id);
  console.log('rep', rep);
  detailVisible.value = true;
  detailData.value = rep;
}

async function submitHandler(id) {
  try {
    const rep = await doApply(id);
    console.log('rep', rep);
    detailVisible.value = false;
    detailData.value = null;
  } catch (error) {
    console.log('error', error);
  }
}
</script>
