<template>
  <ElDialog v-model="visibleChanger" :title="props.readonly ? '详情' : '新增'" width="1200px">
    <template v-if="localValue">
      <ElForm
        labelWidth="6em"
        class="p-r-8"
        :disabled="props.readonly"
        size="small"
      >
        <ElFormItem label="出库类型">
          <ElSelectV2 v-model="localValue.goodsType" :options="goodsTypeList" @change="changeGoodsType" />
        </ElFormItem>
        <ElFormItem label="明细">
          <ElTable :data="localValue.details" border>
            <ElTableColumn label="名称">
              <template v-slot="{ row }">
                <ElSelectV2
                  :options="options.goods"
                  v-model="row.goodsId"
                  @change="changeGoods(row, $event)"
                />
              </template>
            </ElTableColumn>
            <ElTableColumn label="规格" width="220px">
              <template v-slot="{ row }">
                <ElSelectV2
                  filterable
                  v-model="row.spec"
                  :options="options.specs.value(row.goodsId)"
                  @change="setMaxTotal(row)"
                />
              </template>
            </ElTableColumn>
            <ElTableColumn label="出库数量">
              <template v-slot="{ row }">
                <ElInputNumber
                  controlsPosition="right"
                  v-model.lazy="row.num"
                  @change="numChange(row, $event)"
                />
              </template>
            </ElTableColumn>
            <ElTableColumn label="实际数量">
              <template v-slot="{ row }">
                <ElInputNumber
                  controlsPosition="right"
                  v-model.lazy="row.realNum"
                />
              </template>
            </ElTableColumn>
            <ElTableColumn label="单位" porp="unitId">
              <template v-slot="{ row }">
                <ElSelectV2
                  :options="options.units.value(row.goodsId)"
                  v-model="row.unitId"
                />
              </template>
            </ElTableColumn>
            <ElTableColumn label="单价（元/单位）" prop="price">
              <template v-slot="{ row }">
                <ElInputNumber
                  controlsPosition="right"
                  v-model.lazy="row.price"
                  :min="0"
                  @change="priceChange(row, $event)"
                />
              </template>
            </ElTableColumn>
            <ElTableColumn label="总价（元）" prop="total">
              <template v-slot="{ row }">
                <ElInputNumber
                  controlsPosition="right"
                  v-model.lazy="row.total"
                  @change="totalChange(row, $event)"
                />
              </template>
            </ElTableColumn>
            <ElTableColumn label="操作" v-if="!props.readonly">
              <template v-slot="{ $index }">
                <ElButton
                  size="small"
                  type="text"
                  icon="delete"
                  @click="remove($index)"
                >
                  删除
                </ElButton>
              </template>
            </ElTableColumn>
          </ElTable>
          <div class="w-full text-right m-t-2">
            <ElButton
              size="small"
              type="primary"
              icon="plus"
              @click="add"
              v-show="!props.readonly"
              :disabled="!localValue.goodsType"
            >
              添加
            </ElButton>
          </div>
        </ElFormItem>
        <ElFormItem label="完成订单">
          <OrderSelect v-model="localValue.orders"  ref="orderSelectRef" />
        </ElFormItem>
        <ElFormItem label="抬头">
          <ElAutocomplete class="w-full" v-model="localValue.fromName" :fetchSuggestions="getTitle" />
        </ElFormItem>
        <ElFormItem label="接收单位">
          <ElAutocomplete v-model="localValue.toName" :fetchSuggestions="fetchCustomers" class="w-full" />
        </ElFormItem>
        <ElFormItem label="备注">
          <ElInput type="textarea" v-model="localValue.comment"  />
        </ElFormItem>
      </ElForm>
    </template>
    <template v-slot:footer>
      <ElButton type="primary" @click="doAdd" v-show="!props.readonly">确定</ElButton>
      <ElButton @click="visibleChanger = false">关闭</ElButton>
    </template>
  </ElDialog>
</template>

<script setup>
import { STOCK_TYPE_MAP, STOCK_TYPE_PRODUCT } from '@/constant';
import { map2array } from '@/helpers/utils';
import { ElMessage } from 'element-plus';
import {ref, watch, computed, nextTick} from 'vue';
import {getItemStock, getMapping, getOptions, getStockReduceOptions, stockReduce} from '@/api';
import OrderSelect from '@/pages/stock/OrderSelect.vue';

let goodsDefaultUnitMapping = {};
const optionsOrigin = ref({});
const orderSelectRef = ref(null);
function emptyData() {
  return {
    goodsType:    STOCK_TYPE_PRODUCT,
    storehouseId: props.storehouseId,
    details:      [
      emptyRow()
    ],
    orders:   [],
    comment:  '',
    fromName: '',
    toName:   ''
  };
}

function getTitle(_, cb) {
  cb([{
    value: '慈溪市金铭金属制品有限公司'
  }, {
    value: '宁波泓宝铜业有限公司'
  }]);
}

const options = {
  goods: computed(() => {
    if (localValue.value?.goodsType && optionsOrigin.value.stocks[localValue.value.goodsType]) {
      const options = [];
      for(const [id, rows] of Object.entries(optionsOrigin.value.stocks[localValue.value.goodsType])) {
        options.push({
          label: rows[0].goodsName,
          value: Number(id)
        });
      }
      return options;
    }
    return [];
  }),
  specs: computed(() => {
    return function(goodsId) {
      if (goodsId && optionsOrigin.value.stocks?.[localValue.value.goodsType]?.[goodsId]) {
        return optionsOrigin.value.stocks[localValue.value.goodsType]?.[goodsId].map(item => ({
          label: item.spec,
          value: item.id
        }));
      }
      return [];
    };
  }),
  units: computed(() => {
    return function(goodsId) {
      if (goodsId && optionsOrigin.value.units[goodsId]) {
        return optionsOrigin.value.units[goodsId];
      }
      return [];
    };
  })
};
const goodsTypeList = map2array(STOCK_TYPE_MAP);
const props = defineProps({
  visible: {
    required: true,
    type:     Boolean
  },
  model: {
    type: Object
  },
  readonly: {
    type:    Boolean,
    default: false
  },
  storehouseId: {
    type: Number
  }
});
const localValue = ref(emptyData());
const emit = defineEmits(['update:visible', 'success']);

defineExpose({
  show(goodsType, goodsId, stockId, num, unitId) {
    visibleChanger.value = true;
    nextTick(() => {
      const data = emptyData();
      data.goodsType = goodsType;
      data.details[0].goodsId = goodsId;
      data.details[0].spec = stockId;
      data.details[0].num = num;
      data.details[0].realNum = num;
      data.details[0].unitId = unitId;
      localValue.value = data;
    });
  }
});

const visibleChanger = computed({
  get() {
    return props.visible;
  },
  set(val) {
    emit('update:visible', val);
  }
});

function emptyRow() {
  return {
    goodsId:   null,
    goodsType: null,
    spec:      '',
    num:       null,
    realNum:   null,
    unitId:    null,
    price:     null,
    total:     null
  };
}
async function setMaxTotal(row) {
  const rep = await getItemStock(row.spec);
  row.num = rep.num;
  row.realNum = rep.num;
  row.unitId = rep.unitId;
}
function changeGoodsType(goodsType) {
  if (goodsType) {
    localValue.value.details = [emptyRow()];
  } else {
    localValue.value.details = [];
  }
}

function changeGoods(row, goodsId) {
  if (goodsId) {
    row.spec = null;
    row.unitId = goodsDefaultUnitMapping[goodsId] ?? null;
    row.price = null;
    row.total = null;
  }
}

function numChange(row, num) {
  if (num) {
    if (row.price) {
      row.total = num * row.price;
    } else if (row.total) {
      row.price = row.total / num;
    }
  }
  row.realNum = num;
}

function totalChange(row, total) {
  if (total && row.num) {
    row.price = total / row.num;
  }
}

function priceChange(row, price) {
  if (price && row.num) {
    row.total = price * row.num;
  }
}

function remove(index) {
  if (localValue.value.details.length === 1) {
    ElMessage.warning('至少保留一条明细');
    localValue.value.details = [emptyRow()];
  } else {
    localValue.value.details.splice(index, 1);
  }
}

function add() {
  if (!localValue.value.goodsType) {
    ElMessage.warning('请选择商品类型');
    return;
  }
  if (localValue.value.details.length >= 10) {
    ElMessage.warning('最多添加10条明细');
    return;
  }
  localValue.value.details.push(emptyRow());
}

watch(() => props.visible, val => {
  if (val) {
    localValue.value = props.model || emptyData();
    localValue.value.details[0].goodsId = 2;
    nextTick(() => {
      orderSelectRef.value.setText('');
    });
  }
});

getStockReduceOptions().then(data => {
  optionsOrigin.value = data;
});
getMapping('goods').then(({ goods }) => {
  for (const id in goods) {
    if (goods[id].baseUnitId) {
      goodsDefaultUnitMapping[id] = goods[id].baseUnitId;
    }
  }
});

async function doAdd() {
  if(!localValue.value.details.length) {
    ElMessage.warning('请添加明细');
    return;
  }
  if(localValue.value.details.some(item => !item.goodsId || !item.spec || !item.num || !item.unitId)) {
    ElMessage.warning('请填写完整明细');
    return;
  }
  const { id } = await stockReduce(localValue.value);
  ElMessage.success('保存成功');
  emit('update:visible', false);
  emit('success', id);
}

async function fetchCustomers(input, cb) {
  const { customer } = await getOptions('customer');
  let suggestions =  customer.map(item => ({ value: item.label }));
  if(input) {
    suggestions = suggestions.filter(item => item.value.includes(input));
  }
  cb(suggestions);
}

</script>

<style lang="scss" scoped>
.el-form-item,
.el-input-number,
.el-select-v2 {
  width: 100%;
}

</style>
