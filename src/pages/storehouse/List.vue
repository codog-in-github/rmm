<template>
  <div class="flex flex-col overflow-hidden">
    <div class="filter-container">
      <GlFilterBar
        :model="filters"
        @search="getList"
        class="m-b-4"
        showReset
        :defaultValue="() => ({})"
      >
        <GlFilterItem
          label="所属仓库"
          prop="storehouseId"
          type="select"
          :options="storehouse"
          :controllerStyle="{ width: '120px' }"
        />
        <GlFilterItem
          label="类型"
          prop="type"
          :options="stockTypes"
          type="button"
        />
        <GlFilterItem
          label="规格"
          prop="spec"
          :controllerStyle="{ width: '120px' }"
        />
        <GlFilterItem
          label="名称"
          prop="goodsId"
          type="select"
          :controllerStyle="{ width: '120px' }"
          :options="goods"
        />
      </GlFilterBar>
    </div>
    <div class="bg-white flex-auto overflow-auto px-7 pt-6" v-loading="loading">
      <div class="mb-6">
        <ElButton @click="add" type="success" icon="plus">新增仓库</ElButton>
      </div>
      <ElTable :data="list" stripe>
        <ElTableColumn label="序号">
          <template v-slot="{ $index }">
            {{ $index + 1 }}
          </template>
        </ElTableColumn>
        <ElTableColumn label="所属仓库" prop="storehouseName" />
        <ElTableColumn label="库存类型" prop="goodsType">
          <template v-slot="{ row }">
            {{ STOCK_TYPE_MAP[row.type] }}
          </template>
        </ElTableColumn>
        <ElTableColumn label="名称" prop="goodsName" />
        <ElTableColumn label="规格" prop="spec" />
        <ElTableColumn label="操作">
          <template v-slot="{ row }">
            <ElButton type="primary" link @click="edit(row)">
              编辑
            </ElButton>
            <ElButton type="danger" link @click="del(row)">
              删除
            </ElButton>
          </template>
        </ElTableColumn>
      </ElTable>
      <GlPagination class="m-t-2" :pagination="pagination" :requestHook="getList" />
    </div>
    <Dialog v-model:visible="showDialog" :model="dialogData" @success="getList" />
  </div>
</template>

<script setup>
import {delStock, getOptions, storehouseDel, storehouseDetail, useGetStorehouse} from '@/api';
import {ElMessage, ElMessageBox} from 'element-plus';
import { ref, reactive } from 'vue';
import Dialog from './Dialog.vue';
import { GOODS_TYPE_RAW, STOCK_TYPE_MAP, STOCK_TYPE_RAW} from '@/constant';
import {isStandardSpec, map2array, usePagination} from '@/helpers';
import { useUser } from '@/store';
import moment from 'moment';
const pagination = usePagination();
const getStorehouse = useGetStorehouse(pagination);

const user = useUser();
const storehouse = ref([]);
const goods = ref([]);
const stockTypes = map2array(STOCK_TYPE_MAP);
const list = ref([]);
const filters = reactive({

});
const loading = ref(false);
const showDialog = ref(false);
const dialogData = ref(null);
async function del(row) {
  await ElMessageBox.confirm('确定删除该仓库？');
  await storehouseDel(row.storehouseId);
  ElMessage.success('删除成功');
  getList();
}
function add() {
  dialogData.value = {
    details: [],
    type:    STOCK_TYPE_RAW,
    name:    ''
  };
  showDialog.value  = true;
}
async function edit(row) {
  const data = await storehouseDetail(row.storehouseId);
  dialogData.value = {
    details: data.goods,
    type:    data.type,
    name:    data.name,
    id:      data.id
  };
  showDialog.value  = true;
}
function getList() {
  loading.value = true;
  getStorehouse(filters)
    .then(rep => {
      list.value = rep;
    })
    .finally(() => {
      loading.value = false;
    });
}

let _printSettings = JSON.parse(
  localStorage.getItem('printSettings')
);
if(!_printSettings) {
  _printSettings = {
    printerIndex:   null,
    paperSizeIndex: null
  };
}
const printSettings = ref(_printSettings);


getOptions('storehouse,goods').then((rep) => {
  storehouse.value = rep['storehouse'];
  goods.value = rep['goods'];
});

getList();
</script>

<style lang="scss" scoped>
.filter-container{
  background-color: #fff;
  padding: 30px;
  margin-bottom: 10px;
  border-radius: 10px;
}

:deep(.gl-filter-bar){
  margin-bottom: 0;
}
</style>
