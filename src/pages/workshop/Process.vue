<template>
  <div class="flex flex-col">
    <GlFilterBar class="m-b-2" :model="filters" />
    <ElTable
      :data="list"
      border
      height="100%"
      v-loadng="pagination.paginate.loading"
    >
      <ElTableColumn label="库存类型" prop="goodsType">
        <template v-slot="{ row }">{{ row['goodsType'] }}</template>
      </ElTableColumn>
    </ElTable>
    <GlPagination class="m-t-2" :pagination="pagination" :requestHook="getList" />
  </div>
</template>
<script setup>
import { reactive, ref } from 'vue';
import { getSelfWorkshop } from '@/api';
import { usePagination } from '@/helpers';
import { ElMessage } from 'element-plus';

const workshopId = ref(null);
const filters = reactive({});
const pagination = usePagination();
const list = ref([]);

async function getList() {
  // return const list = await getStock(workshopId.value);
  // list.value = list;
}
async function init() {
  const rep = await getSelfWorkshop();
  if(!rep || rep.length < 1) {
    ElMessage.error('您的账号未绑定车间，请联系管理员添加');
    return;
  }
  workshopId.value = rep[0].id;
}
init();

</script>
