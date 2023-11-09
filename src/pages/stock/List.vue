<template>
  <div class="flex flex-col">
    <GlFilterBar :model="filters" @search="onSearch" class="m-b-4">
      <GlFilterItem label="id" prop="id" />
      <template v-slot:after>
        <ElButton>新增入库</ElButton>
      </template>
    </GlFilterBar>
    <div class="flex-auto">
      <ElTable :data="list" border height="100%">
        <ElTableColumn label="测试" prop="name" />
      </ElTable>
    </div>
  </div>
</template>

<script setup>
import { getSelfStorehouse, getStock } from '@/api';
import { ElMessage } from 'element-plus';
import { ref, reactive } from 'vue';

const storehouseId = ref(null);
const list = ref([]);
const filters = reactive({});

getSelfStorehouse()
  .then(storehouseList => {
    if(storehouseList.length > 0) {
      const id = storehouseId.value = storehouseList[0].id;
      return getStock(id);
    }
    const errMsg = '您的账号未绑定仓库，请联系管理员添加';
    ElMessage.error(errMsg);
    throw Error(errMsg);
  })
  .then(data => {
    console.log('data', data);
  })
  .catch(() => {});
</script>
