<template>
  <ElDialog v-model="visibleChanger" title="新增入库" width="1000px">
    <template v-if="localValue">
      <ElForm
        labelWidth="6em"
        label
        class="p-r-8"
        :disabled="props.readonly"
      >
        <div class="flex justify-between">
          <div class="flex items-center">
            <label class="block w-18 mr-2">入库类型</label>
            <GlStockTypeRadioButton v-model="localValue.goodsType"  @change="changeGoodsType" />
          </div>
          <div class="flex items-center">
            <label class="block w-18 mr-2">入库时间</label>
            <ElDatePicker
              v-model="localValue.warehousedAt"
              style="width: 160px"
              :clearable="false"
            />
          </div>
        </div>
        <label class="block my-4">入库信息</label>
        <div class="p-4 bg-gray-100">
          <ElTable :data="localValue.details">
            <ElTableColumn label="名称" width="120">
              <template v-slot="{ row }">
                <ElSelectV2
                  :options="options.goods"
                  v-model="row.goodsId"
                  @change="changeGoods(row, $event)"
                />
              </template>
            </ElTableColumn>
            <ElTableColumn label="规格(MM)">
              <template v-slot="{ row }">
                <ElAutocomplete
                  v-model="row.spec"
                  @blur="setDefStorehouse(row)"
                  :fetchSuggestions="useQuerySearch(row.goodsId)"
                >
                  <template v-slot:suffix>
                    <template v-if="isStandardSpec(row.spec)">mm</template>
                  </template>
                </ElAutocomplete>
              </template>
            </ElTableColumn>
            <ElTableColumn
              align="center"
              width="80px"
              label="矫直"
              v-if="localValue.goodsType === STOCK_TYPE_PRODUCT"
            >
              <template v-slot="{ row }">
                <ElCheckbox
                  v-model="row.subSpec"
                  :activeValue="GOODS_SUB_SPEC_JIAOZHI"
                  inactiveValue=""
                />
              </template>
            </ElTableColumn>
            <ElTableColumn label="所属仓库" width="140">
              <template v-slot="{ row }">
                <ElSelectV2 v-model="row.storehouseId" filterable :options="currentStorehouse" />
              </template>
            </ElTableColumn>
            <ElTableColumn label="数量">
              <template v-slot="{ row }">
                <ElInput
                  type="number"
                  v-model.lazy="row.num"
                  @change="numChange(row, $event)"
                >
                  <template v-slot:append>
                    <ElSelect
                      class="no-arrow"
                      placeholder="&nbsp;"
                      v-model="row.unitId"
                      style="width: 50px"
                    >
                      <ElOption
                        v-for="item in options.units.value(row.goodsId)"
                        :key="item.id"
                        :label="item.label"
                        :value="item.value"
                      />
                    </ElSelect>
                  </template>
                </ElInput>
              </template>
            </ElTableColumn>
            <ElTableColumn label="备注">
              <template v-slot="{ row }">
                <ElInput v-model="row.comment" />
              </template>
            </ElTableColumn>`
            <ElTableColumn label="操作" v-if="!props.readonly" width="80px">
              <template v-slot="{ $index }">
                <ElButton
                  type="danger"
                  link
                  @click="remove($index)"
                >
                  删除
                </ElButton>
              </template>
            </ElTableColumn>
          </ElTable>
          <div
            class="leading-loose bg-white"
            style="text-align: center"
            v-show="!props.readonly"
            @click="localValue.goodsType && add()"
          >
            <span>
              <ElIcon><CirclePlus /></ElIcon>
              添加
            </span>
          </div>
        </div>
      </ElForm>
    </template>
    <template v-slot:footer>
      <ElButton type="primary" @click="doAdd" v-show="!props.readonly">确定</ElButton>
      <ElButton @click="visibleChanger = false">关闭</ElButton>
    </template>
  </ElDialog>
</template>

<script setup>
import {
  GOODS_SUB_SPEC_JIAOZHI,
  GOODS_TYPE_MAP,
  GOODS_TYPE_RAW,
  GOODS_TYPE_USE,
  STOCK_CHANGE_TYPE_OUT, STOCK_TYPE_PRODUCT,
  STOCK_TYPE_RAW,
  STOCK_TYPE_USE
} from '@/constant';
import { map2array } from '@/helpers/utils';
import { ElMessage } from 'element-plus';
import { cloneDeep } from 'lodash';
import { ref, watch, computed } from 'vue';
import {getDefaultStorehouse, getMapping, getOptions, getSpecOptions, getStockAddOptions, stockAdd} from '@/api';
import { isStandardSpec } from '@/helpers';
import { GOODS_SPEC_SCENES_STOREHOUSE } from '@/constant';
import GlStockTypeRadioButton from '@/components/GlStockTypeRadioButton.vue';
let goodsDefaultUnitMapping = {};
const storehouses = ref([]);
const optionsById = ref({
  goods: {},
  units: {}
});

const currentStorehouse = computed(() => {
  return storehouses.value.filter(item => item.origin.type === localValue.value.goodsType);
});

getOptions('storehouse').then(rep => {
  storehouses.value = rep.storehouse;
});

const options = {
  goods: computed(() => {
    const stockType = localValue.value?.goodsType;
    let goodsType;
    if(stockType === STOCK_TYPE_USE) {
      goodsType = GOODS_TYPE_USE;
    } else {
      goodsType = GOODS_TYPE_RAW;
    }
    if(goodsType && optionsById.value.goods[goodsType]) {
      return optionsById.value.goods[goodsType];
    }
    return [];
  }),
  units: computed(() => {
    return function(goodsId) {
      if(goodsId && optionsById.value.units[goodsId]) {
        return optionsById.value.units[goodsId];
      }
      return [];
    };
  })
};
const localValue = ref(null);
const props = defineProps({
  visible: {
    required: true,
    type:     Boolean
  },
  model: {
    required: true,
    type:     Object
  },
  readonly: {
    type:    Boolean,
    default: false
  }
});
const emit = defineEmits(['update:visible', 'success']);

const visibleChanger = computed({
  get() {
    return props.visible;
  },
  set(val) {
    emit('update:visible', val);
  }
});

function emptyRow() {
  const baseRowData = {
    goodsId:      null,
    goodsType:    null,
    spec:         '',
    storehouseId: null,
    comment:      '',
    num:          null,
    unitId:       null,
    price:        null,
    total:        null
  };
  if(localValue.value.goodsType === STOCK_TYPE_PRODUCT) {
    baseRowData.subSpec = '';
  }
  return baseRowData;
}

function changeGoodsType() {
  localValue.value.details = [
    emptyRow()
  ];
}

function changeGoods(row, goodsId) {
  if(goodsId) {
    row.spec = null;
    row.unitId = goodsDefaultUnitMapping[goodsId] ?? null;
  }
}

function numChange(row, num) {
  if(num) {
    if(row.price) {
      row.total = num * row.price;
    } else if(row.total) {
      row.price = row.total / num;
    }
  }
}

function remove(index) {
  if(localValue.value.details.length === 1) {
    ElMessage.warning('至少保留一条明细');
    localValue.value.details = [emptyRow()];
  } else {
    localValue.value.details.splice(index, 1);
  }
}

function add() {
  if(!localValue.value.goodsType) {
    ElMessage.warning('请选择商品类型');
    return;
  }
  if(localValue.value.details.length >= 10) {
    ElMessage.warning('最多添加10条明细');
    return;
  }
  localValue.value.details.push(emptyRow());
}

function useQuerySearch(goodsId) {
  if(!goodsId) {
    return function querySearch(_, cb) {
      cb([]);
    };
  }
  return async function querySearch(input, cb) {
    const rep = await getSpecOptions({
      goodsId,
      scenes: GOODS_SPEC_SCENES_STOREHOUSE
    });
    if(rep) {
      input = input === 'null' ? null : input;
      const map = {};
      cb(
        rep.filter(item => {
          const exists = map[item.value];
          map[item.value] = true;
          return !exists && (!input || item.value.includes(input));
        })
          .map(item => {
            return {
              value: item.value
            };
          })
      );
    } else {
      cb([]);
    }
  };
}

watch(() => props.model, val => {
  localValue.value = cloneDeep(val);
});

getStockAddOptions().then(data => {
  optionsById.value = data;
});

getMapping('goods').then(({ goods }) => {
  for(const id in goods) {
    if(goods[id].baseUnitId) {
      goodsDefaultUnitMapping[id] = goods[id].baseUnitId;
    }
  }
});

async function doAdd() {
  if(!localValue.value.details || localValue.value.details.length === 0) {
    ElMessage.warning('请添加明细');
    return;
  }
  if(localValue.value.details.some(item => !item.goodsId || !item.spec || !item.num || !item.unitId)) {
    ElMessage.warning('请填写完整明细');
    return;
  }
  await stockAdd(localValue.value);
  ElMessage.success('保存成功');
  emit('update:visible', false);
  emit('success');
}


async function setDefStorehouse(row) {
  if(localValue.value.goodsType && row.goodsId) {
    const storehouses = await getDefaultStorehouse({
      goodsId: row.goodsId,
      type:    localValue.value.goodsType,
      spec:    row.spec
    });
    if(storehouses && storehouses.length) {
      row.storehouseId = storehouses[0].storehouseId;
    } else {
      row.storehouseId = null;
    }
  }
}

</script>

<style lang="scss" scoped>
.el-form-item,
.el-input-number,
.el-select-v2{
  width: 100%;
}

</style>
