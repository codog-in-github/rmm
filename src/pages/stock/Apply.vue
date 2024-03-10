<template>
  <div class="flex flex-col">
    <GlFilterBar class="m-b-2" :model="filters" @search="pagnation.reset(getList)" />
    <div class="flex-auto h-1">
      <ElTable :data="list" height="100%" v-loading="pagnation.paginate.loading">
        <ElTableColumn label="名称" prop="name" />
        <ElTableColumn label="申请状态">
          <template v-slot="{ row }">
            <GlStockApplyStatusContent :status="row.status" :type="row.type" />
          </template>
        </ElTableColumn>
        <ElTableColumn label="申请车间" prop="workshopName" />
        <ElTableColumn label="申请时间" prop="createdAt" :formatter="formatDatetime" />
        <ElTableColumn label="申请人" prop="applyUserName" />
        <ElTableColumn label="操作">
          <template v-slot="{ row }">
            <ElButton type="text" @click="showDetail(row.id)">详情</ElButton>
          </template>
        </ElTableColumn>
      </ElTable>
    </div>
    <GlPagination class="m-t-2" :pagination="pagnation" :requestHook="getList" />
    <ApplyDetail v-model:visible="detailVisible" :model="detailData" @submit="submitHandler" />
  </div>
</template>
<script setup>
import {doApply, getApplyDetail, getSelfStorehouse, useGetApplyList} from '@/api';
import {formatDatetime, usePagination} from '@/helpers';
import {ElMessage} from 'element-plus';
import {ref} from 'vue';
import * as CONSTANT from '@/constant';
import ApplyDetail from './ApplyDetail.vue';

const pagnation = usePagination();
const getApplyList =  useGetApplyList(pagnation);
const storehouseId = ref(null);
const list = ref([]);
const detailVisible = ref(false);
const detailData = ref(null);

async function getList() {
  list.value = await getApplyList(storehouseId.value);
}
async function init() {
  pagnation.paginate.loading = true;
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
  detailVisible.value = true;
  detailData.value = rep;
}

async function submitHandler(id, realNums) {
  try {
    await doApply(id, realNums);
    ElMessage.success('操作成功');
    const item = list.value.find(item => item.id === id);
    if(item.type === CONSTANT.STOCK_APPLY_TYPE_IN) {
      item.status = CONSTANT.STOCK_APPLY_STATUS_FINISH;
    } else {
      item.status = CONSTANT.STOCK_APPLY_STATUS_PASS;
    }
    detailVisible.value = false;
    detailData.value = null;
  } catch (none) {
    //
  }
}
</script>
