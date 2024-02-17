<script setup>
import { reactive, ref } from 'vue';
import {formatDate, formatDatetime, map2array, usePagination} from '@/helpers';
import {futuresDel, futuresStock, useGetFutures} from '@/api';
import Editor from './Editor.vue';
import moment from 'moment';
import {FUTURES_TYPE_MAP, FUTURES_TYPE_NORMAL, FUTURES_TYPE_SPOT} from '@/constant';
import {ElMessage, ElMessageBox} from 'element-plus';
const filters = reactive({
  date: [
    moment().startOf('year').format('YYYY-MM-DD'),
    moment().format('YYYY-MM-DD')
  ],
  type:         null,
  businessType: null
});
const types = map2array(FUTURES_TYPE_MAP);
const total = ref(0);
const earning = ref(0);
const pagination = usePagination();
const getListApi = useGetFutures(pagination);
const showEdit = ref(false);
const list = ref([]);
async function delClick({ id }) {
  await ElMessageBox.confirm('该操作不可恢复，确定删除？');
  await futuresDel(id);
  ElMessage.success('删除成功');
  getList();
}
const getList = function() {
  futuresStock(filters.date).then(res => {
    total.value = res.total;
    earning.value = res.earning;
  });
  getListApi(filters).then(res => {
    list.value = res;
  });
};
getList();
</script>

<template>
  <div class="h-full flex flex-col">
    <GlFilterBar :model="filters" @search="getList">
      <GlFilterItem
        label="类型"
        type="select"
        :options="types"
        clearable
        prop="type"
      />
      <GlFilterItem
        label="交易类型"
        clearable
        type="select"
        :options="[{
          label: '买入', value: 1,
        },{
          label: '卖出', value: 2,
        }]"
        prop="businessType"
      />
      <GlFilterItem label="交易时间" type="daterange" prop="date" />
      <template v-slot:after>
        <ElButton type="primary" icon="Plus" @click="showEdit = true">新增交易</ElButton>
      </template>
    </GlFilterBar>
    <div class="flex gap-2 p-t-2 p-b-2">
      <div class="card">
        <div class="title">总收益</div>
        <div class="num">
          {{ -earning[FUTURES_TYPE_NORMAL] - earning[FUTURES_TYPE_SPOT] }}<span class="sub">元</span>
        </div>
      </div>
      <div class="card">
        <div class="title">期货收益</div>
        <div class="num">
          {{ -earning[FUTURES_TYPE_NORMAL] }}<span class="sub">元</span>
        </div>
      </div>
      <div class="card">
        <div class="title">期货库存</div>
        <div class="num">
          {{ total[FUTURES_TYPE_NORMAL] }}<span class="sub">T</span>
        </div>
      </div>
      <div class="card">
        <div class="title">现货收益</div>
        <div class="num">
          {{ -earning[FUTURES_TYPE_SPOT] }}<span class="sub">元</span>
        </div>
      </div>
      <div class="card">
        <div class="title">现货库存</div>
        <div class="num">
          {{ total[FUTURES_TYPE_SPOT] }}<span class="sub">T</span>
        </div>
      </div>
    </div>
    <ElTable
      v-loading="pagination.paginate.loading"
      class="flex-1 m-t-2"
      height="100%"
      :data="list"
    >
      <ElTableColumn label="类型">
        <template v-slot="{row}">
          <span v-if="row.type === FUTURES_TYPE_NORMAL">期货</span>
          <span v-else>现货</span>
        </template>
      </ElTableColumn>
      <ElTableColumn label="交易类型">
        <template v-slot="{row}">
          <span v-if="row.total > 0" class="color-success">买入</span>
          <span v-else class="color-danger">卖出</span>
        </template>
      </ElTableColumn>
      <ElTableColumn label="单价（元）" prop="price" />
      <ElTableColumn label="数量（T）" prop="num" :formatter="(_, __, val) => Math.abs(val)" />
      <ElTableColumn label="总价（元）" prop="total" :formatter="(_, __, val) => Math.abs(val)" />
      <ElTableColumn label="交易后库存(T)" prop="stock" />
      <ElTableColumn
        label="交易日期"
        prop="businessDate"
        width="120px"
        :formatter="formatDate"
      />
      <ElTableColumn
        label="创建时间"
        prop="createdAt"
        width="180px"
        :formatter="formatDatetime"
      />
      <ElTableColumn label="操作">
        <template v-slot="{row}">
          <GlAsyncButton type="primary" link :click="() => delClick(row)">删除</GlAsyncButton>
        </template>
      </ElTableColumn>
    </ElTable>
    <GlPagination class="m-t-2" :pagination="pagination" :requestHook="getList" />
    <Editor v-model:show="showEdit" :total="total" @success="getList" />
  </div>
</template>

<style scoped lang="scss">
.card{
  width: 180px;
  height: 100px;
  background: var(--el-color-primary-light-8);
  border-radius: 0.25rem;
  padding-left: 1rem;
  display: flex;
  gap: 0.125rem;
  flex-direction: column;
  justify-content: center;

  .num{
    font-size: 2rem;
  }

  .sub{
    font-size: 0.8rem;
    margin-left: 0.5rem;
  }
}
</style>
