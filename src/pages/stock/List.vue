<template>
  <div>stock list</div>
</template>

<script setup>
import { getSelfStorehouse, getStock } from '@/api';
import { ElMessage } from 'element-plus';
import { ref } from 'vue';

const storehouseId = ref(null);

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
