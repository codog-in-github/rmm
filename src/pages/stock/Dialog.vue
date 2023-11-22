<template>
  <ElDialog v-model="visibleChanger" :title="props.readonly ? '详情' : '新增'" width="1000px">
    <template v-if="localValue">
      <ElForm labelWidth="6em" class="p-r-8" :disabled="props.readonly">
        <ElFormItem label="入库类型">
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
            <ElTableColumn label="规格">
              <template v-slot="{ row }">
                <ElSelectV2
                  :options="options.specifications.value(row.goodsId)"
                  v-model="row.specificationId"
                />
              </template>
            </ElTableColumn>
            <ElTableColumn label="入库数量">
              <template v-slot="{ row }">
                <ElInputNumber 
                  controlsPosition="right"
                  v-model.lazy="row.num"
                  :min="0"
                  @change="numChange(row, $event)"
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
            <ElTableColumn label="单价" prop="price">
              <template v-slot="{ row }">
                <ElInputNumber 
                  controlsPosition="right"
                  v-model.lazy="row.price"
                  :min="0"
                  @change="priceChange(row, $event)"
                />
              </template>
            </ElTableColumn>
            <ElTableColumn label="总价" prop="total">
              <template v-slot="{ row }">
                <ElInputNumber
                  controlsPosition="right"
                  v-model.lazy="row.total"
                  :min="0"
                  @change="totalChange(row, $event)"
                />
              </template>
            </ElTableColumn>
            <ElTableColumn label="操作" v-if="!props.readonly">
              <template v-slot="{ $index }">
                <ElButton
                  size="small"
                  type="danger"
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
import { GOODS_TYPE_MAP } from '@/constant';
import { map2array } from '@/helpers/utils';
import { computed } from '@vue/reactivity';
import { ElMessage, ElMessageBox } from 'element-plus';
import { cloneDeep } from 'lodash';
import { ref, watch } from 'vue';
import { getStockAddOptions, stockAdd } from '@/api';

const optionsByid = ref({
  goods:          {},
  specifications: {},
  units:          {}
});

const options = {
  goods: computed(() => {
    if(localValue.value?.goodsType && optionsByid.value.goods[localValue.value.goodsType]) {
      return optionsByid.value.goods[localValue.value.goodsType];
    }
    return [];
  }),
  specifications: computed(() => {
    return function(goodsId) {
      if(goodsId && optionsByid.value.specifications[goodsId]) {
        return optionsByid.value.specifications[goodsId];
      }
      return [];
    };
  }),
  units: computed(() => {
    return function(goodsId) {
      if(goodsId && optionsByid.value.units[goodsId]) {
        return optionsByid.value.units[goodsId];
      }
      return [];
    };
  })
};
const goodsTypeList = map2array(GOODS_TYPE_MAP);
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
  return {
    goodsId:         null,
    goodsType:       null,
    specificationId: null,
    num:             null,
    unitId:          null,
    price:           null,
    total:           null
  };
}

function changeGoodsType(goodsType) {
  if(goodsType) {
    localValue.value.details = [emptyRow()];
  } else {
    localValue.value.details = [];
  }
}

function changeGoods(row, goodsId) {
  if(goodsId) {
    row.specificationId = null;
    row.unitId = null;
    row.price = null;
    row.total = null;
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

function totalChange(row, total) {
  if(total && row.num) {
    row.price = total / row.num;
  }
}

function priceChange(row, price) {
  if(price && row.num) {
    row.total = price * row.num;
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

watch(() => props.model, val => {
  localValue.value = cloneDeep(val);
});


async function addSpecification() {
  try {
    const data = await ElMessageBox.prompt('请输入规格', {
      inputPattern:      /^\d+\*\d+\*\d+$/,
      inputErrorMessage: '请正确输入规格'
    });
    console.log('data', data);
  } catch (error) {
    //
  }
}

getStockAddOptions().then(data => {
  optionsByid.value = data;
});

async function doAdd() {
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
