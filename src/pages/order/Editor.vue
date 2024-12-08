<script setup>
import {computed, nextTick, ref} from 'vue';
import { getOptions } from '@/helpers/process';
import {getOptions as getOptionsHelpers, getSpecOptions, orderDetail, orderSave } from '@/api';
import CustomerEditor from '@/pages/customer/Editor.vue';
import {GOODS_SPEC_SCENES_ORDER, GOODS_TYPE_RAW, ORDER_UNIT_KG, ORDER_UNIT_MAP} from '@/constant';
import {map2array, specParse} from '@/helpers';
import moment from 'moment';
import TemplateEditor from '@/pages/template/Editor.vue';
import {ElMessage} from 'element-plus';
import SpecInput from '@/pages/order/SpecInput.vue';
import SpecFormatter from '@/components/SpecFormatter.vue';
import {cloneDeep} from "lodash";
import {presets} from "../../../babel.config";

const specInputRef = ref(null);
const { goods, update } = getOptions();
const elFormRef = ref(null);
const templateEditorRef = ref(null);
const isPrintTemplate = ref(true);
const units = map2array(ORDER_UNIT_MAP);
const customerAddData = ref({
  index: null,
  show:  false
});

async function inputSpec(row) {
  const newValue = await specInputRef.value?.input(row.spec);
  if(newValue) {
    row.spec = newValue;
  }
}

function onCustomerAdd(customer) {
  customers.value.push({
    label: customer.name,
    value: customer.id
  });
  form.value.details[customerAddData.value.index].customerId = customer.id;
}

function customerAdd(index) {
  customerAddData.value.index = index;
  customerAddData.value.show = true;
}

const emit = defineEmits(['success']);
const emptyForm = function() {
  return {
    date:    moment().format('YYYY-MM-DD'),
    comment: '',
    details: []
  };
};

const emptyDetails = function() {
  return {
    customerId:     null,
    goodsId:        2, // 紫铜管id
    spec:           '',
    subSpec:        '',
    num:            null,
    unit:           ORDER_UNIT_KG,
    comment:        '',
    hard:           '',
    wLimitU:        '',
    wLimitD:        '',
    normalBusiness: '',
    customerNote:   '',
    deadline:       ''
  };
};


const show = ref(false);
const form = ref(emptyForm());
const rules = {
  details: {
    required: true,
    validator(_, value, cb) {
      if(value?.length === 0) {
        return cb(new Error('请添加明细'));
      }
      if(value.some(item => !item.goodsId ||!item.spec || !item.num || !item.unit)) {
        return cb(new Error('订单请填写完整'));
      }
      cb();
    }
  }
};
defineExpose({
  async show(id) {
    if(id) {
      const rep = await orderDetail(id);

      const getPercent = (specObj, value) => {
        if(!value || value === '0' || !specObj?.r?.[0]) return '';
        return Math.abs((value - specObj.w[0]) / specObj.w[0] * 100).toFixed(3).replace(/\.?0+$/, '');
      };

      for(const item of rep.details) {
        let [wLimitU, wLimitD] = item.wLimit.split('/');
        const specObj = specParse(item.spec);
        item.wLimitU = getPercent(specObj, wLimitU);
        item.wLimitD = getPercent(specObj, wLimitD);
      }
      form.value = rep;
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

function addDetail() {
  const row = emptyDetails();
  if(form.value.details.length > 0) {
    row.customerId = form.value.details[form.value.details.length - 1].customerId;
  }
  form.value.details.push(row);
}
function delDetail(index) {
  form.value.details.splice(index, 1);
}
function showTemplate(row) {
  if(!row.customerId ||!row.goodsId ||!row.spec) {
    return ElMessage.warning('请先填写客户、原料、规格');
  }
  return templateEditorRef.value.show(row.customerId, row.goodsId, row.spec);
}

async function submit() {
  await elFormRef.value.validate();
  const formData = cloneDeep(form.value);

  const wLimitFormat = (specObj, percent, operator) => {
    if(!percent || percent === '0') return '0';
    const op = (operator === '+' ? 1 : -1);
    return (specObj.w[0] * (1 + percent / 100 * op)).toFixed(3);
  };

  for(const item of formData.details) {
    const spec = specParse(item.spec);
    item.wLimit = wLimitFormat(spec, item.wLimitU, '+') + '/' + wLimitFormat(spec, item.wLimitD, '-');
  }

  const { id } = await orderSave(formData);
  ElMessage.success('保存成功');
  update();
  show.value = false;
  emit('success', id, isPrintTemplate.value);
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
  <ElDialog v-model="show" title="订单详情" width="1200px">
    <ElForm
      ref="elFormRef"
      :model="form"
      :rules="rules"
      labelWidth="100px"
      labelPosition="top"
    >
      <ElFormItem label="日期" prop="customerId">
        <div class="flex justify-between w-full p-r-2">
          <ElDatePicker valueFormat="YYYY-MM-DD" v-model="form.date" :clearable="false" />
          <GlBorderCard title="工艺说明" class="bottom-6">
            <ElSwitch v-model="isPrintTemplate" activeText="打印" inactiveText="不打印" />
          </GlBorderCard>
        </div>
      </ElFormItem>
      <ElFormItem label="订单商品" prop="details">
        <ElTable :data="form.details" stripe>
          <ElTableColumn label="客户名称" width="260px" fixed>
            <template v-slot="{ row, $index }">
              <div class="flex gap-2">
                <ElSelectV2
                  v-model="row.customerId"
                  :options="customers"
                  class="w-full"
                  filterable
                />
                <ElLink type="primary" :underline="false" @click="customerAdd($index)"><ElIcon><Plus /></ElIcon></ElLink>
              </div>
            </template>
          </ElTableColumn>

          <ElTableColumn label="原料名称" width="150px" fixed>
            <template v-slot="{ row }">
              <ElSelectV2 v-model="row.goodsId" :options="goodsOptions" />
            </template>
          </ElTableColumn>

          <ElTableColumn label="规格(MM)" width="220px" fixed>
            <template v-slot="{ row }">
              <ElButton link type="primary" @click="inputSpec(row)">
                <SpecFormatter :spec="row.spec"  placeholder="点击输入" />
              </ElButton>
            </template>
          </ElTableColumn>

          <ElTableColumn label="壁厚上限" width="160px">
            <template v-slot="{ row }">
              <ElSelect
                style="width: 80%"
                v-model="row.wLimitU"
                filterable
              >
                <ElOption v-for="i in 15" :value="i" :key="i" />
              </ElSelect>
              %
            </template>
          </ElTableColumn>

          <ElTableColumn label="壁厚下限" width="160px">
            <template v-slot="{ row }">
              <ElSelect
                style="width: 80%"
                v-model="row.wLimitD"
                filterable
              >
                <ElOption v-for="i in 15" :value="i" :key="i" />
              </ElSelect>
              %
            </template>
          </ElTableColumn>

          <ElTableColumn label="数量" width="120px">
            <template v-slot="{ row }">
              <ElInput
                type="number"
                class="w-full"
                v-model="row.num"
                min="0"
              />
            </template>
          </ElTableColumn>

          <ElTableColumn label="一般贸易" width="120px">
            <template v-slot="{ row }">
              <ElInput
                type="number"
                class="w-full"
                v-model="row.normalBusiness"
                min="0"
              />
            </template>
          </ElTableColumn>

          <ElTableColumn label="单位" width="120px">
            <template v-slot="{ row }">
              <ElSelectV2
                class="w-full"
                v-model="row.unit"
                :options="units"
              />
            </template>
          </ElTableColumn>

          <ElTableColumn label="硬度" width="120px">
            <template v-slot="{ row }">
              <ElInput v-model="row.hard" />
            </template>
          </ElTableColumn>

          <ElTableColumn label="备注" width="200px">
            <template v-slot="{ row }">
              <ElInput
                type="textarea"
                class="w-full"
                autosize
                v-model="row.comment"
                min="0"
              />
            </template>
          </ElTableColumn>

          <ElTableColumn label="特殊要求" width="200px">
            <template v-slot="{ row }">
              <ElInput
                type="textarea"
                class="w-full"
                autosize
                v-model="row.customerNote"
                min="0"
              />
            </template>
          </ElTableColumn>

          <ElTableColumn label="要求交期" width="200px">
            <template v-slot="{ row }">
              <ElDatePicker
                type="date"
                class="w-full"
                v-model="row.deadline"
                valueFormat="YYYY-MM-DD"
              />
            </template>
          </ElTableColumn>

          <ElTableColumn width="180px">
            <template v-slot="{ $index, row }">
              <GlAsyncButton link type="primary" :click="() => showTemplate(row)">查看工艺</GlAsyncButton>
              <ElButton link type="danger" @click="delDetail($index)">删除</ElButton>
            </template>
          </ElTableColumn>
        </ElTable>
        <div class="w-full text-right">
          <ElButton icon="Plus" type="primary" @click="addDetail">添加</ElButton>
        </div>
      </ElFormItem>
    </ElForm>
    <template #footer>
      <ElButton @click="show = false">取消</ElButton>
      <ElButton type="primary" @click="submit">确定</ElButton>
    </template>
    <TemplateEditor ref="templateEditorRef" />
    <CustomerEditor v-model:show="customerAddData.show" @success="onCustomerAdd" />
    <SpecInput ref="specInputRef" />
  </ElDialog>
</template>

<style scoped lang="scss">

</style>
