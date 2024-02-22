<script setup>
import {computed, nextTick, ref} from 'vue';
import { getOptions } from '@/helpers/process';
import {getOptions as getOptionsHelpers, orderDetail, orderSave } from '@/api';
import {GOODS_PROCESS_TEMPLATE_TYPE_HALF, GOODS_TYPE_RAW} from '@/constant';
import {isStandardSpec} from '@/helpers';
import moment from 'moment';
import TemplateEditor from '@/pages/template/Editor.vue';
import {ElMessage} from 'element-plus';
const { goods, specs } = getOptions();
const elFormRef = ref(null);
const templateEditorRef = ref(null);
const isPrintTemplate = ref(true);

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
    goodsId:    null,
    spec:       '',
    subSpec:    '',
    num:        null
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
      if(value.some(item => !item.goodsId ||!item.spec || !item.num)) {
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
function querySearch(id) {
  const _options = specs.value(id).map(item => ({ value: item.label }));
  return function(_, cb) {
    cb(_options);
  };
}

function addDetail() {
  const row = emptyDetails(GOODS_PROCESS_TEMPLATE_TYPE_HALF);
  row.goodsId = form.value.goodsId;
  form.value.details.push(row);
}'';
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
  <ElDialog v-model="show" title="订单详情" width="900px">
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
            <template v-slot="{ row }">
              <ElSelectV2 v-model="row.customerId" :options="customers" class="w-full" />
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
                :fetchSuggestions="querySearch(row.goodsId)"
              />
            </template>
          </ElTableColumn>
          <ElTableColumn label="数量（KG）" width="120px">
            <template v-slot="{ row }">
              <ElInput
                type="number"
                class="w-full"
                v-model="row.num"
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
      <ElFormItem label="备注">
        <ElInput v-model="form.comment" type="textarea" />
      </ElFormItem>
    </ElForm>
    <template #footer>
      <ElButton @click="show = false">取消</ElButton>
      <ElButton type="primary" @click="submit">确定</ElButton>
    </template>
    <TemplateEditor ref="templateEditorRef" />
  </ElDialog>
</template>

<style scoped lang="scss">

</style>
