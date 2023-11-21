<template>
  <div class="flex flex-col">
    <GlFilterBar :model="filters" @search="getList" class="m-b-4">
      <template v-slot:after>
        <ElButton @click="add">新增入库</ElButton>
      </template>
    </GlFilterBar>
    <div class="flex-auto" v-loading="loading">
      <ElTable :data="list" border height="100%">
        <ElTableColumn label="库存类型" prop="goods_type">
          <template v-slot="{ row }">{{ GOODS_TYPE_MAP[row['goods_type']] }}</template>
        </ElTableColumn>
        <ElTableColumn label="库存名称" prop="goods_name" />
        <ElTableColumn label="规格" prop="goods_specification_name" />
        <ElTableColumn label="库存总数" prop="goods_num" />
        <ElTableColumn label="库存总价" prop="goods_total" />
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
import { GOODS_TYPE_MAP } from '@/constant';

const storehouseId = ref(null);
const list = ref([]);
const filters = reactive({});
const loading = ref(false);
const showDialog = ref(false);
const dialogData = ref(null);
function add() {
  dialogData.value = {
    storehouseId: storehouseId.value,
    records:      [],
    comment:      ''
  };
  showDialog.value  = true;
}

function getList() {
  loading.value = true;
  getStock(storehouseId.value)
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
