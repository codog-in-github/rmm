<template>
  <ElDialog v-model="visibleChanger" title="新增入库">
    <template v-if="localValue">
      <ElForm inline labelWidth="6em" class="p-r-8">
        <ElRow>
          <ElCol :span="12">
            <ElFormItem label="货物类型">
              <ElSelectV2 
                :options="goodsTypeList"
                v-model="localValue.goodsType"
                @change="
                  localValue.goodsId = null;
                  localValue.specificationId = null;
                "
              />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="货物名称">
              <ElSelectV2 
                :options="options.goods.value"
                v-model="localValue.goodsId" 
                @change="localValue.specificationId = null;"
              />
            </ElFormItem>
          </ElCol>
        </ElRow>
        <ElRow>
          <ElCol :span="10">
            <ElFormItem label="货物规格">
              <ElSelectV2 :options="options.specifications.value" v-model="localValue.specificationId" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="2" class="p-l">
            <ElButton icon="plus" class="w-full" @click="addSpecification" />
          </ElCol>
        </ElRow>
        <ElRow>
          <ElCol :span="12">
            <ElFormItem label="数量">
              <ElInputNumber :min="0" controlsPosition="right" v-model="localValue.num" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="总金额">
              <ElInputNumber :min="0" controlsPosition="right" v-model="localValue.total" />
            </ElFormItem>
          </ElCol>
        </ElRow>
        <div>
          <ElFormItem label="备注">
            <ElInput type="textarea" v-model="localValue.comment"  />
          </ElFormItem>
        </div>
      </ElForm>
    </template>
    <template v-slot:footer>
      <ElButton type="primary" @click="doAdd">确定</ElButton>
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
  specifications: {}
});

const options = {
  goods: computed(() => {
    if(localValue.value?.goodsType && optionsByid.value.goods[localValue.value.goodsType]) {
      return optionsByid.value.goods[localValue.value.goodsType];
    }
    return [];
  }),
  specifications: computed(() => {
    if(localValue.value?.goodsId && optionsByid.value.specifications[localValue.value.goodsId]) {
      return optionsByid.value.specifications[localValue.value.goodsId];
    }
    return [];
  })
};

const goodsTypeList = map2array(GOODS_TYPE_MAP);
const props = defineProps({
  visible: {
    required: true,
    type:     Boolean
  },
  model: {
    required: true,
    type:     Object
  },
  type: {
    default: 'add'
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
const localValue = ref(null);

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
  const rep = await stockAdd(localValue.value);
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
