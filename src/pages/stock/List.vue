<template>
  <div class="flex flex-col">
    <GlFilterBar :model="filters" @search="getList" class="m-b-4">
      <GlFilterItem
        label="库存类型"
        prop="type"
        type="select"
        :options="goodsOptions"
      />
      <template v-slot:after>
        <ElButton @click="add" type="primary" icon="plus">新增入库</ElButton>
      </template>
    </GlFilterBar>
    <div class="flex-auto h-1" v-loading="loading">
      <ElTable :data="list" border height="100%">
        <ElTableColumn label="库存类型" prop="goodsType">
          <template v-slot="{ row }">
            <template v-if="row.processType === 0">
              {{ GOODS_TYPE_MAP[row.goodsType] }}
            </template>
            <template v-else>
              {{ GOODS_PROCESS_TYPE_MAP[row.processType] }}
            </template>
          </template>
        </ElTableColumn>
        <ElTableColumn label="名称" prop="goodsName" />
        <ElTableColumn label="规格" prop="specification" :formatter="specificationContent" />
        <ElTableColumn label="库存总数" prop="goodsNum">
          <template v-slot="{ row }">
            <div class="flex justify-between">
              <span>{{ formatNum(row.goodsNum) }}</span>
              <span v-if="row.baseUnitName">（{{ row.baseUnitName }}）</span>
            </div>
          </template>
        </ElTableColumn>
      </ElTable>
    </div>
    <Dialog v-model:visible="showDialog" :model="dialogData" @success="getList" />
  </div>
</template>

<script setup>
import { getSelfStorehouse, getStock } from '@/api';
import { ElMessage } from 'element-plus';
import { ref, reactive } from 'vue';
import Dialog from './Dialog.vue';
import { GOODS_PROCESS_TYPE_MAP, GOODS_TYPE_MAP, GOODS_TYPE_RAW, STOCK_TYPE_MAP } from '@/constant';
import { isStandardSpecification, map2array } from '@/helpers';
const goodsOptions = map2array(STOCK_TYPE_MAP);
const storehouseId = ref(null);
const list = ref([]);
const filters = reactive({
  type: GOODS_TYPE_RAW
});
const loading = ref(false);
const showDialog = ref(false);
const dialogData = ref(null);
function add() {
  dialogData.value = {
    storehouseId: storehouseId.value,
    details:      [],
    comment:      ''
  };
  showDialog.value  = true;
}
function specificationContent(row, _, value) {
  let content = '';
  if(row.subSpecification) {
    content = `【${row.subSpecification}】`;
  }
  content += value;
  if(isStandardSpecification(value)) {
    content += '(mm)';
  } 
  return content;
}

function formatNum(val) {
  return val.toFixed(4).replace(/\.?0+$/, '');
}
function getList() {
  loading.value = true;
  getStock(storehouseId.value, filters)
    .then(rep => {
      list.value = rep;
    })
    .finally(() => {
      loading.value = false;
    });
}

getSelfStorehouse()
  .then(storehouseList => {
    loading.value = true;
    if(storehouseList.length > 0) {
      storehouseId.value = storehouseList[0].id;
      return getList();
    }
    loading.value = false;
    const errMsg = '您的账号未绑定仓库，请联系管理员添加';
    ElMessage.error(errMsg);
    throw Error(errMsg);
  });
</script>
