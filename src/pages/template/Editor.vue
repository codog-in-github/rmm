<script setup>
import { computed, nextTick, ref } from 'vue';
import { getOptions } from '@/helpers/process';
import {
  getOptions as getOptionsHelpers,
  templateDetail,
  templateDetailSearch,
  templateSave
} from '@/api';
import { GOODS_TYPE_RAW } from '@/constant';
import { isStandardTempSpec } from '@/helpers';
import { ElMessage, ElMessageBox } from 'element-plus';
const { goods, specs } = getOptions();
const elFormRef = ref(null);
const emit = defineEmits(['success']);
const emptyForm = function() {
  return {
    customerId: null,
    goodsId:    null,
    rawSpec:    '',
    targetSpec: '',
    comment:    ''
  };
};

const props = defineProps({
  readonly: {
    type:    Boolean,
    default: false
  },
  hiddenCustomer: {
    type:    Boolean,
    default: false
  }
});

const show = ref(false);
const form = ref(emptyForm());

const specValidator = function(name) {
  return (rule, value, cb) => {
    if(!value) {
      return cb(new Error(`${name}规格未填写`));
    }
    if(!isStandardTempSpec(value)) {
      return cb(new Error(`${name}规格格式错误`));
    }
    cb();
  };
};
const rules = {
  customerId: {
    required: true,
    message:  '请选择客户',
    trigger:  'change'
  },
  goodsId: {
    required: true,
    message:  '请选择管坯',
    trigger:  'change'
  },
  targetSpec: {
    required:  true,
    validator: specValidator('目标成品')
  },
  rawSpec: {
    required:  true,
    validator: specValidator('原料')
  }
};
defineExpose({
  async show() {
    if(arguments.length === 3) {
      try{
        form.value = await templateDetailSearch.apply(void 0, arguments);
      } catch (e) {
        if(props.readonly) {
          return;
        }
        await ElMessageBox.confirm('未找到该模板是否新建？');
        form.value = emptyForm();
        form.value.goodsId = arguments[1];
        form.value.customerId = arguments[0];
        form.value.targetSpec = arguments[2];
      }
    } else if(arguments.length === 1) {
      form.value = await templateDetail(arguments[0]);
    } else {
      form.value = emptyForm();
    }
    show.value = true;
    nextTick(() => {
      elFormRef.value.clearValidate();
    });
  }
});
const customers = ref([]);
function querySearch(id) {
  const _options = specs.value(id).map(item => ({ value: item.label }));
  return function(_, cb) {
    cb(_options);
  };
}

async function submit() {
  await elFormRef.value.validate();
  await templateSave(form.value);
  ElMessage.success('保存成功');
  show.value = false;
  emit('success');
}
const goodsOptions = computed(() => {
  return goods.value(GOODS_TYPE_RAW);
});
(async function init() {
  const { customer } = await getOptionsHelpers('customer');
  customers.value = customer;
})();
</script>

<template>
  <ElDialog v-model="show" title="工艺参考">
    <ElForm
      ref="elFormRef"
      :model="form"
      :rules="rules"
      labelWidth="100px"
    >
      <ElFormItem label="客户" prop="customerId" v-if="!hiddenCustomer">
        <ElSelectV2
          :disabled="readonly"
          v-model="form.customerId"
          placeholder="请选择客户"
          :options="customers"
        />
      </ElFormItem>
      <ElFormItem label="管坯" prop="goodsId">
        <ElSelectV2 :disabled="readonly" v-model="form.goodsId" :options="goodsOptions" />
      </ElFormItem>
      <ElFormItem label="目标规格" prop="targetSpec">
        <ElAutocomplete
          v-model="form.targetSpec"
          :disabled="readonly"
          :fetchSuggestions="querySearch(form.goodsId)"
        >
          <template #append>MM</template>
        </ElAutocomplete>
      </ElFormItem>
      <ElFormItem label="原料规格" prop="rawSpec">
        <ElAutocomplete
          v-model="form.rawSpec"
          :disabled="readonly"
          :fetchSuggestions="querySearch(form.goodsId)"
        >
          <template #append>MM</template>
        </ElAutocomplete>
      </ElFormItem>
      <ElFormItem label="工艺说明" prop="comment">
        <ElInput type="textarea" :disabled="readonly" v-model="form.comment" />
      </ElFormItem>
    </ElForm>
    <template v-if="!readonly" #footer>
      <ElButton @click="show = false">取消</ElButton>
      <ElButton type="primary" @click="submit">确定</ElButton>
    </template>
  </ElDialog>
</template>

<style scoped lang="scss">

</style>
