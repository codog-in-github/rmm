<script setup>
import {computed, ref, watch} from 'vue';
import {FUTURES_TYPE_NORMAL, FUTURES_TYPE_SPOT} from '@/constant';
import {futuresAdd, getDatePrice} from '@/api';
import moment from 'moment';
const emptyForm = () => {
  return {
    type:         FUTURES_TYPE_NORMAL,
    businessType: 0,
    price:        null,
    num:          null,
    total:        null,
    businessDate: moment().format('YYYY-MM-DD')
  };
};
const form = ref(emptyForm());
const formRef = ref(null);
const props = defineProps({
  show:  Boolean,
  total: Number
});
function calTotal() {
  if(form.value.num && form.value.price) {
    form.value.total = (form.value.price * form.value.num).toString();
  }
}
function calPrice() {
  if(form.value.total && form.value.total) {
    form.value.num = (form.value.total / form.value.price).toString();
  }
}
const emit = defineEmits(['update:show', 'success']);
const modelShow = computed({
  get() {
    return props.show;
  },
  set(val) {
    emit('update:show', val);
  }
});
async function submit() {
  await formRef.value.validate();
  const data = {
    ...form.value
  };
  if(data.businessType === 1) {
    data.num *= -1;
    data.total *= -1;
  }
  await futuresAdd(data);
  modelShow.value = false;
  emit('success');
}

async function setPrice() {
  if(form.value.type && form.value.businessDate) {
    const { price } = await getDatePrice(form.value.type, form.value.businessDate);
    if(price) {
      form.value.price = price.toString();
    } else {
      form.value.price = null;
    }
    calTotal();
  }
}

watch(() => props.show, () => {
  if(props.show) {
    form.value = emptyForm();
    setPrice();
  }
});

const rules = {
  price: [
    { required: true, message: '请输入单价', trigger: 'blur'},
    { min: 0, message: '请输入正确的单价', trigger: 'blur'}
  ],
  num: [
    {required: true, message: '请输入数量', trigger: 'blur'},
    { min: 0, message: '请输入正确的数量', trigger: 'blur'}
  ],
  total: [
    {required: true, message: '请输入总价', trigger: 'blur'}
  ],
  businessDate: [
    {required: true, message: '请选择日期', trigger: 'blur'}
  ]
};
</script>

<template>
  <ElDialog v-model="modelShow" title="新增交易" width="400px">
    <ElForm
      ref="formRef"
      :model="form"
      labelWidth="80px"
      :rules="rules"
    >
      <ElFormItem label="类型">
        <ElRadioGroup v-model="form.type" @change="setPrice">
          <ElRadio :label="FUTURES_TYPE_NORMAL">期货</ElRadio>
          <ElRadio :label="FUTURES_TYPE_SPOT">现货</ElRadio>
        </ElRadioGroup>
      </ElFormItem>
      <ElFormItem label="交易类型">
        <ElRadioGroup v-model="form.businessType">
          <ElRadio :label="0">买入</ElRadio>
          <ElRadio :label="1">卖出</ElRadio>
        </ElRadioGroup>
      </ElFormItem>
      <ElFormItem label="单价" prop="price">
        <ElInput type="number"  v-model="form.price" @change="calTotal">
          <template #append>元</template>
        </ElInput>
      </ElFormItem>
      <ElFormItem label="数量" prop="num">
        <ElInput
          type="number"
          v-model="form.num"
          @change="calTotal"
        >
          <template #append>T</template>
        </ElInput>
      </ElFormItem>
      <ElFormItem label="总价" prop="total">
        <ElInput type="number"  v-model="form.total" @change="calPrice">
          <template #append>元</template>
        </ElInput>
      </ElFormItem>
      <ElFormItem label="交易日期" prop="businessDate">
        <ElDatePicker
          v-model="form.businessDate"
          valueFormat="YYYY-MM-DD"
          :clearable="false"
          @change="setPrice"
        />
      </ElFormItem>
    </ElForm>
    <template #footer>
      <ElButton @click="modelShow = false">取消</ElButton>
      <ElButton type="primary" @click="submit">确定</ElButton>
    </template>
  </ElDialog>
</template>

<style scoped lang="scss">

</style>
