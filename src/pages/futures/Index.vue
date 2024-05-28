<script setup>
import { reactive, ref } from 'vue';
import {formatDate, formatDatetime, map2array, usePagination} from '@/helpers';
import {futuresDel, useGetFutures} from '@/api';
import Editor from './Editor.vue';
import {FUTURES_TYPE_MAP, FUTURES_TYPE_NORMAL, FUTURES_TYPE_SPOT} from '@/constant';
import {ElMessage, ElMessageBox} from 'element-plus';
const filters = reactive({
  date:         [],
  type:         null,
  businessType: null
});
const types = map2array(FUTURES_TYPE_MAP);
const total = ref(0);
const stock = ref({
  [FUTURES_TYPE_NORMAL]: {},
  [FUTURES_TYPE_SPOT]:   {}
});
const pagination = usePagination({
  dataHook(data) {
    stock.value = data.stock;
  }
});
const getListApi = useGetFutures(pagination);
const showEdit = ref(false);
const list = ref([]);

function spanMethod({ column, row }) {
  if(['businessDate', 'type', 'totalEarn', 'natureEarn', 'optEarn'].includes(column.property)) {
    return [row.rowSpan, 1];
  }
}
async function delClick({ id }) {
  await ElMessageBox.confirm('该操作不可恢复，确定删除？');
  await futuresDel(id);
  ElMessage.success('删除成功');
  getList();
}
const getList = function() {
  getListApi(filters).then(res => {
    list.value = res;
  });
};
function clearFilters() {
  filters.date = [];
  filters.type = null;
  filters.businessType = null;
  getList();
}
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
        <ElButton type="primary" icon="Refresh" @click="clearFilters">重置筛选</ElButton>
        <ElButton type="primary" icon="Plus" @click="showEdit = true">新增交易</ElButton>
      </template>
    </GlFilterBar>
    <div class="flex gap-2 p-t-2 p-b-2">
      <div class="card">
        <div class="title">总收益</div>
        <div class="num">
          {{ (stock[FUTURES_TYPE_NORMAL].totalEarn + stock[FUTURES_TYPE_SPOT].totalEarn)?.toFixed(2) }}<span class="sub">元</span>
        </div>
      </div>
      <div class="card">
        <div class="title">期货收益</div>
        <div class="num">
          {{ stock[FUTURES_TYPE_NORMAL].totalEarn?.toFixed(2) }}<span class="sub">元</span>
        </div>
      </div>
      <div class="card">
        <div class="title">期货库存</div>
        <div class="num">
          {{ stock[FUTURES_TYPE_NORMAL].total?.toFixed(2) }}<span class="sub">T</span>
        </div>
      </div>
      <div class="card">
        <div class="title">现货收益</div>
        <div class="num">
          {{ stock[FUTURES_TYPE_SPOT].totalEarn?.toFixed(2) }}<span class="sub">元</span>
        </div>
      </div>
      <div class="card">
        <div class="title">现货库存</div>
        <div class="num">
          {{ stock[FUTURES_TYPE_SPOT].total?.toFixed(2) }}<span class="sub">T</span>
        </div>
      </div>
    </div>
    <div class="m-t-2 h-10 overflow-hidden" style="flex: 1 1 auto">
      <ElTable
        v-loading="pagination.paginate.loading"
        height="100%"
        :data="list"
        :spanMethod="spanMethod"
        border
      >
        <ElTableColumn
          label="交易日期"
          prop="businessDate"
          width="120px"
          :formatter="formatDate"
        >
          <template v-slot="{row}">
            <ElPopover
              placement="right-start"
              :width="200"
              trigger="hover"
            >
              <div style="width: 240px" v-if="stock?.earnTotal[row.type]">
                <div>买入</div>
                <div>总数量： {{ stock.earnTotal[row.type].buy.num.toFixed(2) }} T</div>
                <div>总金额： {{ stock.earnTotal[row.type].buy.total.toFixed(2) }} 元</div>
                <div>均价： {{ stock.earnTotal[row.type].buy.avg.toFixed(2) }} 元</div>
                <ElDivider />
                <div>卖出</div>
                <div>总数量： {{ (-stock.earnTotal[row.type].sale.num).toFixed(2) }} T</div>
                <div>总金额： {{ (-stock.earnTotal[row.type].sale.total).toFixed(2) }} 元</div>
                <div>均价： {{ stock.earnTotal[row.type].sale.avg.toFixed(2) }} 元</div>
                <ElDivider />
                <div>利润计算</div>
                <div>卖出总数量： {{ stock.earnTotal[row.type].earn.saleNum.toFixed(2) }} T</div>
                <div>卖出均价： {{ stock.earnTotal[row.type].earn.saleAvg.toFixed(2) }} 元</div>
                <div>买入总数量： {{ stock.earnTotal[row.type].earn.buyNum.toFixed(2) }} T</div>
                <div>买入均价： {{ stock.earnTotal[row.type].earn.buyAvg.toFixed(2) }} 元</div>
                <div v-if="stock.earnTotal[row.type].earn.addPrice">
                  补足单价： {{ stock.earnTotal[row.type].earn.addPrice.toFixed(2) }} 元
                </div>
                <div>利润： {{ stock.earnTotal[row.type].earn.total.toFixed(2) }} 元</div>
              </div>
              <template #reference>
                <div>{{ formatDate(null, null, row.businessDate) }}</div>
              </template>
            </ElPopover>
          </template>
        </ElTableColumn>
        <ElTableColumn label="类型" prop="type" width="80px">
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
        <ElTableColumn label="交易后库存(T)" prop="stock"  :formatter="(_, __, val) => val?.toFixed(3)" />
        <ElTableColumn label="交易后均价(元)" prop="totalAvgPrice"  :formatter="(_, __, val) => val?.toFixed(3)" />
        <ElTableColumn label="自然盈亏(元)" prop="natureEarn" :formatter="(_, __, val) => val?.toFixed(2)">
          <template v-slot="{row}">
            <span  :class="{ 'color-success': row.natureEarn < 0, 'color-danger': row.natureEarn > 0 }">{{ row.natureEarn?.toFixed(2) }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn label="操作盈亏(元)" prop="optEarn" :formatter="(_, __, val) => val?.toFixed(2)">
          <template v-slot="{row}">
            <span :class="{ 'color-success': row.optEarn < 0, 'color-danger': row.optEarn > 0 }">{{ row.optEarn?.toFixed(2) }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn label="合计盈利(元)" prop="totalEarn" :formatter="(_, __, val) => val?.toFixed(2)">
          <template v-slot="{row}">
            <span :class="{ 'color-success': row.totalEarn < 0, 'color-danger': row.totalEarn > 0 }">{{ row.totalEarn?.toFixed(2) }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn
          label="创建时间"
          prop="createdAt"
          width="180px"
          :formatter="formatDatetime"
        />
        <ElTableColumn label="操作">
          <template v-slot="{row}">
            <GlAsyncButton type="danger" link :click="() => delClick(row)">删除</GlAsyncButton>
          </template>
        </ElTableColumn>
      </ElTable>
    </div>
    <GlPagination class="m-t-2" :pagination="pagination" :requestHook="getList" />
    <Editor v-model:show="showEdit" :total="total" @success="getList" />
  </div>
</template>

<style scoped lang="scss">
.card{
  height: 100px;
  background: var(--el-color-primary-light-8);
  border-radius: 0.25rem;
  padding: 0 1rem;
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
