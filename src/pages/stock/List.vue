<template>
  <div class="flex flex-col">
    <GlFilterBar :model="filters" @search="getList" class="m-b-4">
      <template v-slot:after>
        <ElButton @click="add">新增入库</ElButton>
      </template>
    </GlFilterBar>
    <div class="flex-auto" v-loading="loading">
      <ElTable :data="list" border height="100%">
        <ElTableColumn label="测试" prop="name" />
      </ElTable>
    </div>
    <Dialog v-model:visible="showDialog" :model="dialogData" />
  </div>
</template>

<script setup>
import { getSelfStorehouse, getStock } from '@/api';
import { ElMessage } from 'element-plus';
import { ref, reactive } from 'vue';
import Dialog from './Dialog.vue';

const storehouseId = ref(null);
const list = ref([]);
const filters = reactive({});
const loading = ref(false);
const showDialog = ref(false);
const dialogData = ref(null);
function add() {
  dialogData.value = {
    id: null
  };
  showDialog.value  = true;
}

function getList() {
  loading.value = true;
  getStock(storehouseId.value)
    .then(list => {list.value = list;})
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
