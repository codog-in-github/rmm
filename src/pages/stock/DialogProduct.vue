<template>
  <ElDialog v-model="visibleChanger" :title="props.readonly ? '详情' : '新增'" width="1000px">
    <template v-if="localValue">
      <ElForm
        labelWidth="6em"
        class="p-r-8"
        :disabled="props.readonly"
        size="small"
      >
        <ElFormItem label="入库类型">成品</ElFormItem>
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
            <ElTableColumn label="规格">
              <template v-slot="{ row }">
                <ElInput
                  v-if="localValue.type === STOCK_CHANGE_TYPE_OUT"
                  :modelValue="(row.subSpec ? `【${row.subSpec}】` : '') + row.spec"
                >
                  <template v-slot:suffix>
                    <template v-if="isStandardSpec(row.spec)">mm</template>
                  </template>
                </ElInput>
                <ElAutocomplete
                  v-else
                  v-model="row.spec"
                  :fetchSuggestions="useQuerySearch(row.goodsId)"
                >
                  <template v-slot:suffix>
                    <template v-if="isStandardSpec(row.spec)">mm</template>
                  </template>
                </ElAutocomplete>
              </template>
            </ElTableColumn>
            <ElTableColumn label="矫直" width="50px" align="center">
              <template v-slot="{ row }">
                <ElCheckbox :modelValue="row.subSpec === GOODS_SUB_SPEC_JIAOZHI" @change="changeJiaozhi(row, $event)" />
              </template>
            </ElTableColumn>
            <ElTableColumn label="数量">
              <template v-slot="{ row }">
                <ElInputNumber
                  controlsPosition="right"
                  v-model.lazy="row.num"
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
            >
              添加
            </ElButton>
          </div>
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
import {
  GOODS_PROCESS_TYPE_PRODUCT,
  GOODS_SPEC_SCENES_STOREHOUSE,
  GOODS_SUB_SPEC_JIAOZHI,
  GOODS_TYPE_MAP,
  STOCK_CHANGE_TYPE_OUT
} from '@/constant';
import { map2array } from '@/helpers/utils';
import { ElMessage } from 'element-plus';
import { cloneDeep } from 'lodash';
import { ref, watch, computed } from 'vue';
import { getMapping, getSpecOptions, getStockAddOptions, stockAdd } from '@/api';
import { isStandardSpec } from '@/helpers';
let goodsDefaultUnitMapping = {};
const optionsById = ref({
  goods: {},
  specs: {},
  units: {}
});

const options = {
  goods: computed(() => {
    if(localValue.value?.goodsType && optionsById.value.goods[localValue.value.goodsType]) {
      return optionsById.value.goods[localValue.value.goodsType];
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
function changeJiaozhi(row, val) {
  if(val) {
    row.subSpec = GOODS_SUB_SPEC_JIAOZHI;
  } else {
    row.subSpec = '';
  }
}
function emptyRow() {
  return {
    goodsId:     null,
    goodsType:   null,
    processType: GOODS_PROCESS_TYPE_PRODUCT,
    spec:        '',
    subSpec:     '',
    num:         null,
    unitId:      null,
    price:       0,
    total:       0
  };
}

function changeGoods(row, goodsId) {
  if(goodsId) {
    row.spec = null;
    row.unitId = goodsDefaultUnitMapping[goodsId] ?? null;
    row.price = null;
    row.total = null;
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
  return async function querySearch(_, cb) {
    const rep = await getSpecOptions({
      goodsId,
      scenes: GOODS_SPEC_SCENES_STOREHOUSE
    });
    if(rep) {
      cb(
        rep.map(item => {
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

</script>

<style lang="scss" scoped>
.el-form-item,
.el-input-number,
.el-select-v2{
  width: 100%;
}

</style>
