<script setup>
import {computed, nextTick, ref} from 'vue';
import { getOptions } from '@/helpers/process';
import {getOptions as getOptionsHelpers, templateDetail, templateDetailSearch, templateSave} from '@/api';
import {GOODS_PROCESS_TEMPLATE_TYPE_HALF, GOODS_PROCESS_TEMPLATE_TYPE_RAW, GOODS_TYPE_RAW} from '@/constant';
import {isStandardSpec} from '@/helpers';
import {ElMessage, ElMessageBox} from 'element-plus';
const { goods, specs } = getOptions();
const elFormRef = ref(null);
const emit = defineEmits(['success']);
const emptyForm = function() {
  return {
    customerId: null,
    goodsId:    null,
    spec:       '',
    subSpec:    '',
    raw:        emptyDetails(GOODS_PROCESS_TEMPLATE_TYPE_RAW),
    details:    []
  };
};

const emptyDetails = function(type) {
  return {
    goodsId: null,
    spec:    '',
    subSpec: '',
    num:     null,
    type
  };
};

const show = ref(false);
const form = ref(emptyForm());
const rules = {
  customerId: {
    required: true,
    message:  '请选择客户',
    trigger:  'change'
  },
  goodsId: {
    required: true,
    message:  '请选择原料',
    trigger:  'change'
  },
  spec: {
    required: true,
    message:  '请输入规格',
    trigger:  'change',
    validator(_, value, cb) {
      isStandardSpec(value) ? cb() : cb(new Error('规格格式错误'));
    }
  },
  raw: {
    required: true,
    validator(_, value, cb) {
      value.spec && isStandardSpec(value.spec) ? cb() : cb(new Error('请正确填写规格'));
    }
  },
  details: {
    required: true,
    validator(_, value, cb) {
      if(value?.length === 0) {
        return cb(new Error('请添加明细'));
      }
      if(value.some(item => !item.goodsId ||!item.spec || !isStandardSpec(item.spec))) {
        return cb(new Error('请正确填写规格'));
      }
      cb();
    }
  }
};
defineExpose({
  async show() {
    if(arguments.length === 3) {
      try{
        form.value = await templateDetailSearch.apply(void 0, arguments);
      } catch (e) {
        await ElMessageBox.confirm('未找到该模板是否新建？');
        form.value = emptyForm();
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

function changeGoods(id) {
  form.value.raw.goodsId = id;
  form.value.details.forEach(item => {
    item.goodsId = id;
  });
}
function addDetail() {
  const row = emptyDetails(GOODS_PROCESS_TEMPLATE_TYPE_HALF);
  row.goodsId = form.value.goodsId;
  form.value.details.push(row);
}
function delDetail(index) {
  form.value.details.splice(index, 1);
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
  <ElDialog v-model="show" title="工序模板">
    <ElForm
      ref="elFormRef"
      :model="form"
      :rules="rules"
      labelWidth="100px"
    >
      <ElFormItem label="客户" prop="customerId">
        <ElSelectV2 v-model="form.customerId" placeholder="请选择客户" :options="customers" />
      </ElFormItem>
      <ElFormItem label="原料" prop="goodsId">
        <ElSelectV2
          v-model="form.goodsId"
          @change="changeGoods"
          placeholder="请选择原料"
          :options="goodsOptions"
        />
      </ElFormItem>
      <ElFormItem label="规格" prop="spec">
        <ElAutocomplete
          v-model="form.spec"
          :fetchSuggestions="querySearch(form.goodsId)"
        >
          <template #append>MM</template>
        </ElAutocomplete>
      </ElFormItem>
      <ElFormItem label="生产原料" prop="raw">
        <ElTable :data="[form.raw]">
          <ElTableColumn label="原料名称">
            <template v-slot="{ row }">
              <ElSelectV2 v-model="row.goodsId" :options="goodsOptions" disabled />
            </template>
          </ElTableColumn>
          <ElTableColumn label="规格(MM)">
            <template v-slot="{ row }">
              <ElAutocomplete
                v-model="row.spec"
                :fetchSuggestions="querySearch(form.goodsId)"
              />
            </template>
          </ElTableColumn>
        </ElTable>
      </ElFormItem>
      <ElFormItem label="工序" prop="details">
        <ElTable :data="form.details">
          <ElTableColumn label="原料名称">
            <template v-slot="{ row }">
              <ElSelectV2 v-model="row.goodsId" :options="goodsOptions" disabled />
            </template>
          </ElTableColumn>
          <ElTableColumn label="规格(MM)">
            <template v-slot="{ row }">
              <ElAutocomplete
                v-model="row.spec"
                :fetchSuggestions="querySearch(form.goodsId)"
              />
            </template>
          </ElTableColumn>
          <ElTableColumn>
            <template v-slot="{ $index }">
              <ElButton type="danger" @click="delDetail($index)">删除</ElButton>
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
  </ElDialog>
</template>

<style scoped lang="scss">

</style>
