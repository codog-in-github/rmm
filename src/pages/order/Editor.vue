<script setup>
import {computed, nextTick, ref} from 'vue';
import { getOptions } from '@/helpers/process';
import {getOptions as getOptionsHelpers, getSpecOptions, orderDetail, orderSave } from '@/api';
import CustomerEditor from '@/pages/customer/Editor.vue';
import {GOODS_SPEC_SCENES_ORDER, GOODS_TYPE_RAW, ORDER_UNIT_GEN, ORDER_UNIT_KG, ORDER_UNIT_MAP} from '@/constant';
import {isStandardSpec, map2array} from '@/helpers';
import moment from 'moment';
import TemplateEditor from '@/pages/template/Editor.vue';
import {ElMessage} from 'element-plus';

const { goods, specs, update } = getOptions();
const elFormRef = ref(null);
const templateEditorRef = ref(null);
const isPrintTemplate = ref(true);
const units = map2array(ORDER_UNIT_MAP);
const customerAddData = ref({
  index: null,
  show:  false
});


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
    customerId: null,
    goodsId:    2, // 紫铜管id
    spec:       '',
    subSpec:    '',
    num:        null,
    unit:       ORDER_UNIT_KG,
    comment:    ''
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
      if(value.some(item => !isStandardSpec(item.spec))) {
        return cb(new Error('规格格式错误'));
      }
      cb();
    }
  }
};
defineExpose({
  async show(id) {
    if(id) {
      form.value = await orderDetail(id);
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

function useQuerySearch(goodsId, customerId) {
  if(!goodsId) {
    return function querySearch(_, cb) {
      cb([]);
    };
  }
  return async function querySearch(_, cb) {
    const rep = await getSpecOptions({
      goodsId,
      scenes: GOODS_SPEC_SCENES_ORDER,
      customerId
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


function addDetail() {
  const row = emptyDetails();
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
  const { id } = await orderSave(form.value);
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
        <ElTable :data="form.details">
          <ElTableColumn label="客户名称">
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
          <ElTableColumn label="原料名称" width="120px">
            <template v-slot="{ row }">
              <ElSelectV2 v-model="row.goodsId" :options="goodsOptions" />
            </template>
          </ElTableColumn>
          <ElTableColumn label="规格(MM)" width="180px">
            <template v-slot="{ row }">
              <ElAutocomplete
                class="w-full"
                v-model="row.spec"
                :fetchSuggestions="useQuerySearch(row.goodsId, row.customerId)"
              />
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
          <ElTableColumn label="单位" width="120px">
            <template v-slot="{ row }">
              <ElSelectV2
                class="w-full"
                v-model="row.unit"
                :options="units"
              />
            </template>
          </ElTableColumn>
          <ElTableColumn label="备注">
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
          <ElTableColumn width="90px">
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
  </ElDialog>
</template>

<style scoped lang="scss">

</style>
