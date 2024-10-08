<template>
  <ElDialog v-model="visibleChanger" :title="isEdit ? '编辑仓库': '新增仓库'" width="1000px">
    <template v-if="localValue">
      <ElForm
        labelWidth="6em"
        label
        class="p-r-8"
        :disabled="props.readonly"
      >
        <div class="flex items-center">
          <label class="block w-18 mr-2 flex-shrink-0">仓库名称</label>
          <ElInput v-model="localValue.name" class="w-48 mr-4" />
          <GlStockTypeRadioButton
            v-model="localValue.type"
            @change="changeGoodsType"
            :disabled="isEdit"
          />
        </div>
        <label class="block my-4">入库信息</label>
        <div class="p-4 bg-gray-100">
          <ElTable :data="localValue.details">
            <ElTableColumn label="名称">
              <template v-slot="{ row }">
                <ElSelectV2
                  :options="options.goods"
                  v-model="row.goodsId"
                  @change="changeGoods(row, $event)"
                />
              </template>
            </ElTableColumn>
            <ElTableColumn label="规格(MM)" v-if="localValue?.type !== STOCK_TYPE_TRASH">
              <template v-slot="{ row }">
                <ElAutocomplete
                  v-model="row.spec"
                  :fetchSuggestions="useQuerySearch(row.goodsId)"
                >
                  <template v-slot:suffix>
                    <template v-if="isStandardSpec(row.spec)">mm</template>
                  </template>
                </ElAutocomplete>
              </template>
            </ElTableColumn>
            <ElTableColumn label="操作" width="80px">
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
            @click="localValue.type && add()"
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
  GOODS_SPEC_SCENES_STOREHOUSE,
  GOODS_TYPE_RAW,
  GOODS_TYPE_USE,
  STOCK_TYPE_TRASH,
  STOCK_TYPE_USE
} from '@/constant';
import {ElMessage} from 'element-plus';
import {cloneDeep} from 'lodash';
import {computed, ref, watch} from 'vue';
import {getMapping, getOptions, getSpecOptions, getStockAddOptions, stockAdd, storehouseAdd} from '@/api';
import {isStandardSpec} from '@/helpers';
import GlStockTypeRadioButton from '@/components/GlStockTypeRadioButton.vue';

let goodsDefaultUnitMapping = {};
const optionsById = ref({
  goods: {},
  units: {}
});

const options = {
  goods: computed(() => {
    const stockType = localValue.value?.type;
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

const isEdit = computed(() => {
  return !!(localValue.value?.id);
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
  return {
    goodsId:      null,
    storehouseId: null,
    spec:         ''
  };
}

function changeGoodsType(goodsType) {
  localValue.value.details = [];
}

function changeGoods(row, goodsId) {
  if(goodsId) {
    row.spec = null;
    row.unitId = goodsDefaultUnitMapping[goodsId] ?? null;
  }
}

function remove(index) {
  localValue.value.details.splice(index, 1);
}

function add() {
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
  await storehouseAdd(localValue.value);
  ElMessage.success('保存成功');
  emit('update:visible', false);
  emit('success');
}

</script>

<style lang="scss" scoped>
.el-form-item,
.el-input-number,
.el-select-v2{
  width: 100%;
}

</style>
