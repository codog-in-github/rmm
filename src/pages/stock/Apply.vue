<template>
  <div class="flex flex-col">
    <GlFilterBar class="m-b-2" :model="filters" @search="pagnation.reset(getList)">
      <template v-slot:after>
        <Component :is="showButton" />
      </template>
    </GlFilterBar>
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
            <ElButton type="primary" link @click="showDetail(row.id)">详情</ElButton>
            <ElButton
              v-if="row.type === STOCK_APPLY_TYPE_OUT"
              link
              type="primary"
              @click="print(row.id)"
            >
              打印
            </ElButton>
            <ElButton
              type="danger"
              link
              v-if="user.isRoot"
              @click="del(row.id)"
            >
              删除
            </ElButton>
          </template>
        </ElTableColumn>
      </ElTable>
    </div>
    <GlPagination class="m-t-2" :pagination="pagnation" :requestHook="getList" />
    <ApplyDetail v-model:visible="detailVisible" :model="detailData" @submit="submitHandler" />
  </div>
</template>
<script setup>
import {delApply, doApply, getApplyDetail, getSelfStorehouse, printApplyRaw, useGetApplyList} from '@/api';
import {formatDatetime, usePagination} from '@/helpers';
import {ElMessage, ElMessageBox} from 'element-plus';
import {ref} from 'vue';
import * as CONSTANT from '@/constant';
import ApplyDetail from './ApplyDetail.vue';
import { useUser } from '@/store';
import {STOCK_APPLY_TYPE_OUT} from '@/constant';
import { usePrinter } from '@/helpers/lodop';
import { peiliaoShenqing } from '@/helpers/printTemplates';

const pagnation = usePagination();
const getApplyList =  useGetApplyList(pagnation);
const storehouseId = ref(null);
const list = ref([]);
const detailVisible = ref(false);
const detailData = ref(null);
const user = useUser();
const { printSettings, showButton } = usePrinter();
async function print(id) {
  const data = await printApplyRaw(id);
  if(!LODOP) {
    ElMessage.error('请先安装LODOP插件');
  }
  LODOP.PRINT_INITA();
  LODOP.SET_PRINTER_INDEX(printSettings.value.printerIndex);
  peiliaoShenqing(data, LODOP);
  LODOP.PREVIEW();
}
async function del(id) {
  await ElMessageBox.confirm('确定删除吗？');
  await delApply(id);
  ElMessage.success('删除成功');
  getList();
}
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
