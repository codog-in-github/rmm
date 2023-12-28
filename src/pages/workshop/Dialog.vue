<template>
  <ElDialog v-model="visibleChanger" width="1000px">
    <ElForm :model="localForm" labelWidth="120px" v-if="localForm">
      <ElFormItem label="加工状态">
        <template v-if="localForm.status !== null">{{ PROCESS_STATUS_MAP[localForm.status] }}</template>
        <template v-else>配料申请</template>
      </ElFormItem>
      <ElFormItem label="名称">
        <ElInput v-model="localForm.name" :disabled="localForm.status !== null">
          <template v-if="localForm.status === null" v-slot:prepend>{{ moment().format('YYYYMMDD') }}-</template>
        </ElInput>
      </ElFormItem>
      <ElFormItem label="仓库">
        <ElSelectV2 v-model="localForm.storehouseId" :options="storehouses" :disabled="!canEditRaw" />
      </ElFormItem>
      <ElFormItem label="原材料">
        <ElTable :data="[localForm.raw]">
          <ElTableColumn prop="name" label="材料名称">
            <template v-slot="{ row }">
              <ElSelectV2
                v-model="row.goodsId" 
                :options="goods(GOODS_TYPE_RAW)"
                :disabled="!canEditRaw"
                @change="rawChange($event, row)"
              />
            </template>
          </ElTableColumn>
          <ElTableColumn prop="spec" label="规格（MM）">
            <template v-slot="{ row }">
              <ElAutocomplete
                v-model="row.spec"
                :fetchSuggestions="querySearch(row.goodsId)"
                :disabled="!canEditRaw"
              />
            </template>
          </ElTableColumn> 
          <ElTableColumn prop="num" label="数量">
            <template v-slot="{ row}">
              <ElInputNumber
                controlsPosition="right"
                v-model="row.num"
                :min="1"
                :disabled="!canEditRaw"
              />
            </template>
          </ElTableColumn>
          <ElTableColumn prop="unit" label="单位">
            <template v-slot="{ row }">
              <ElSelectV2
                v-model="row.unitId"
                :options="units(row.goodsId)"
                :disabled="!canEditRaw"
              />
            </template>
          </ElTableColumn>
        </ElTable>
      </ElFormItem>
      <!-- 加工步骤 -->
      <template v-if="localForm.status >= PROCESS_STATUS_PROCESS && localForm.steps">
        <ElFormItem
          v-for="(list, step) of localForm.steps"
          :key="step"
          :label="PROCESS_STEP_MAP[step]"
        >
          <ElTable :data="list">
            <ElTableColumn prop="name" label="材料名称">
              <template v-slot="{ row }">
                <ElSelectV2
                  :modelValue="row.goodsId"
                  :options="goods(GOODS_TYPE_RAW)"
                  disabled
                />
              </template>
            </ElTableColumn>
            <ElTableColumn prop="spec" label="规格(MM)">
              <template v-slot="{ row }">
                <ElAutocomplete
                  v-model="row.spec"
                  :fetchSuggestions="querySearch(row.goodsId)"
                  :disabled="row.id || Number(step) === PROCESS_STEP_TYPE_JIAOZHI"
                />
              </template>
            </ElTableColumn>
            <ElTableColumn label="数量（KG）">
              <template v-slot="{ row }">
                <ElInputNumber
                  class="w-full"
                  controlsPosition="right"
                  v-model="row.num"
                  :min="1"
                  :disabled="row.id"
                />
              </template>
            </ElTableColumn>
            <ElTableColumn label="长度（M）"  width="100px" :formatter="lengthCalc" />
            <ElTableColumn label="加工费（元/M）">
              <template v-slot="{ row }">
                <ElInputNumber
                  class="w-full"
                  :disabled="row.id"
                  v-model="row.pricePerLength"
                  controlsPosition="right"
                />
              </template>
            </ElTableColumn>
            <ElTableColumn label="合计（元）">
              <template v-slot="{ row }">
                {{ priceCalc(row) }}
              </template>
            </ElTableColumn>
            <ElTableColumn label="操作" width="80px">
              <template v-slot="{ row }">
                <ElButton v-if="!row.id" type="primary" @click="saveStep(step, row)">保存</ElButton>
              </template>
            </ElTableColumn>
          </ElTable>
          <div class="m-t-2 w-full text-right" v-if="localForm.status === PROCESS_STATUS_PROCESS">
            <ElButton
              v-if="Number(step) === PROCESS_STEP_TYPE_LAGUAN"
              type="primary"
              @click="addStep(PROCESS_STEP_TYPE_LAGUAN)"
              :disabled="localForm.steps[PROCESS_STEP_TYPE_JIAOZHI].length > 0"
            >
              添加
            </ElButton>
            <ElButton
              v-else
              type="primary"
              @click="addStep(PROCESS_STEP_TYPE_JIAOZHI)"
            >
              添加
            </ElButton>
          </div>
        </ElFormItem>
      </template>
      <ElFormItem v-if="localForm.trash" label="废料">
        <ElTable :data="[localForm.trash]">
          <ElTableColumn prop="name" label="名称">
            <template v-slot="{ row }">
              <ElSelectV2
                v-model="row.goodsId"
                :options="goods(GOODS_TYPE_RAW)"
                disabled
              />
            </template>
          </ElTableColumn>
          <ElTableColumn prop="num" label="数量（KG）">
            <template v-slot="{ row }">
              <ElInputNumber
                controlsPosition="right"
                v-model="row.num"
                :min="0"
                :max="trashTotalWeight"
              />
            </template>
          </ElTableColumn>
        </ElTable>
      </ElFormItem>
      <ElFormItem label="备注">
        <ElInput
          v-model="localForm.comment"
          type="textarea"
          :disabled="!canEditProduct && !canEditRaw"
          autosize
        />
      </ElFormItem>
    </ElForm>
    <template #footer v-if="localForm">
      <ElButton @click="visibleChanger = false">关闭</ElButton>
      <ElButton
        type="primary"
        v-if="localForm.status === null"
        @click="rawApplySubmit"
      >
        配料申请
      </ElButton>
      <ElButton
        type="primary"
        v-else-if="canEditProduct"
        @click="finishProcess"
      >
        加工完成
      </ElButton>
    </template>
  </ElDialog>
</template>

<script setup>
import {
  getNewProcessOptions,
  rawApply,
  finishProcess as finishProcessApi,
  saveStep as saveStepApi,
  getMapping
} from '@/api';
import { 
  PROCESS_STATUS_MAP,
  PROCESS_STATUS_PROCESS,
  GOODS_TYPE_RAW,
  PROCESS_STEP_TYPE_JIAOZHI,
  PROCESS_STEP_TYPE_LAGUAN,
  PROCESS_STEP_MAP
} from '@/constant';
import { conversionSpec, isStandardSpec } from '@/helpers';
import { ElMessage, ElMessageBox } from 'element-plus';
import { cloneDeep } from 'lodash';
import moment from 'moment';
import { computed, reactive, ref, watch } from 'vue';
let goodsDefaultUnitMapping = {};
const props = defineProps({
  visible: {
    type:    Boolean,
    default: false
  },
  model: {
    type: Object
  },
  storehouses: {
    type:    Array,
    default: () => []
  }
});
const emit = defineEmits(['update:visible', 'reload', 'print']);
const unitConversionMapping = ref(null);
async function init() {
  const [rep, { unit , goods }] = await Promise.all([
    getNewProcessOptions(),
    getMapping('unit,goods')
  ]);
  const map = {};
  for(const id in unit) {
    map[id] = unit[id].conversion;
  }
  for(const id in goods) {
    goodsDefaultUnitMapping[id] = goods[id].baseUnitId;
  }
  unitConversionMapping.value = map;
  options.goods = rep.goods;
  options.units = rep.units;
  options.specs = rep.specs;
}
watch(() => props.model, val => {
  const form = cloneDeep(val);
  if(form.status === PROCESS_STATUS_PROCESS && !form.trash) {
    form.trash = {
      goodsId: form.raw.goodsId,
      num:     null
    };
  }
  localForm.value = form;
});

// ------------ 属性计算 start -------------
const totalWeight = computed(() => {
  if(localForm.value.raw && unitConversionMapping.value) {
    return localForm.value.raw.num * unitConversionMapping.value[localForm.value.raw.unitId];
  }
  return 0;
});
const lastWeight = computed(() => {
  if(!localForm.value?.steps[PROCESS_STEP_TYPE_LAGUAN]
    || !totalWeight.value
  ) {
    return 0;
  }
  const steps = localForm.value.steps[PROCESS_STEP_TYPE_LAGUAN];
  if(steps.length > 0) {
    if(steps[steps.length - 1].id) {
      return steps[steps.length - 1].num;
    } else if(steps.length > 1) {
      return steps[steps.length - 2].num;
    }
  }
  return totalWeight.value;
});
const trashTotalWeight = computed(() => {
  return totalWeight.value - lastWeight.value;
});
const localForm = ref(null);
const visibleChanger = computed({
  get() {
    return props.visible;
  },
  set(val) {
    emit('update:visible', val);
  }
});
const canEditRaw  = computed(() => localForm.value?.status === null);
const canEditProduct = computed(() => localForm.value?.status === PROCESS_STATUS_PROCESS);
function lengthCalc(row) {
  if(!row.num || !row.spec || !isStandardSpec(row.spec)) return '';
  return (
    row.num / conversionSpec(row.spec)
  ).toFixed(2).replace(/\.?0+$/, '');
}

function priceCalc(row) {
  if(!row.num || !row.spec || !row.pricePerLength || !isStandardSpec(row.spec)) return '';
  return (
    row.num / conversionSpec(row.spec) * row.pricePerLength
  ).toFixed(2).replace(/\.?0+$/, '');
}
// ------------ 属性计算 end ------------
// ------------ 选项 start -------------
const options = reactive({
  goods: {},
  units: {},
  specs: {}
});
const units = computed(() => {
  return function(id) {
    if(id && options.units[id]) {
      return options.units[id];
    }
    return [];
  };
});
const specs = computed(() => {
  return function(id) {
    if(id && options.specs[id]) {
      return options.specs[id];
    }
    return [];
  };
});
const goods = computed(() => {
  return function(type) {
    if(type && options.goods[type]) {
      return options.goods[type];
    }
    return [];
  };
});
function querySearch(id) {
  const _options = specs.value(id).map(item => ({ value: item.label }));
  return function(_, cb) {
    cb(_options);
  };
}
// ------------ 选项 end -------------
// ------------ 表单相关操作 start -------------

function rawChange(id, row) {
  row.spec = null;
  row.unitId = goodsDefaultUnitMapping[id];
}

function addStep(step) {
  const form = localForm.value;
  for(const st in form.steps) {
    if(form.steps[st].some(item => !item.id)) {
      return ElMessage.warning('请保存后再添加');
    }
  }
  const row = {
    id:             null,
    goodsId:        form.raw.goodsId,
    spec:           null,
    num:            lastWeight.value,
    length:         null,
    pricePerLength: null
  };
  if(step === PROCESS_STEP_TYPE_JIAOZHI) {
    if(form.steps[PROCESS_STEP_TYPE_LAGUAN].length > 0) {
      row.spec = form.steps[PROCESS_STEP_TYPE_LAGUAN][form.steps[PROCESS_STEP_TYPE_LAGUAN].length - 1].spec;
    } else {
      row.spec = form.raw.spec;
    }
  }
  form.steps[step].push(row);
}
async function saveStep(type, row) {
  if(!row.num){
    return ElMessage.warning('数量未填写');
  }
  if(!row.spec){
    return ElMessage.warning('规格未填写');
  }
  if(!isStandardSpec(row.spec)){
    return ElMessage.warning('规格不符合标准');
  }
  if(!row.pricePerLength){
    return ElMessage.warning('单价未填写');
  }
  const params = cloneDeep(row);
  params.processId = localForm.value.id;
  params.type = Number(type);
  params.sort = localForm.value.steps[type].length;
  try {
    const { id } = await saveStepApi(params);
    if(trashTotalWeight.value) {
      localForm.value.trash.num = trashTotalWeight.value;
    }
    row.id = id;
    ElMessage.success('保存成功');
  } catch (none) {
    ElMessage.error('保存失败');
  }
}


async function rawApplySubmit() {
  const form = localForm.value;
  if(!form.name) {
    return ElMessage.warning('请填写名称');
  }
  if(!form.storehouseId) {
    return ElMessage.warning('请选择仓库');
  }
  if(
    !form.raw.goodsId || !form.raw.spec || !form.raw.num || !form.raw.unitId
  ) {
    return ElMessage.warning('原材料未填写完整');
  }
  await rawApply(form);
  emit('reload');
  visibleChanger.value = false;
  try {
    await ElMessageBox.confirm('原料申请成功，是否打印？');
    emit('print', printData());
  } catch (none) {
    //
  }
}

function printData() {
  const data = cloneDeep(localForm.value);
  data.raw.goodsName = goods.value(GOODS_TYPE_RAW)
    .find(item => item.value === data.raw.goodsId).label;
  data.raw.unitName = units.value(data.raw.goodsId)
    .find(item => item.value === data.raw.unitId).label;
  if(data.status === null) {
    data.name = moment().format('YYYYMMDD') + '-' + data.name;
  }
  return data;
}

async function finishProcess() {
  let stepCount = 0;
  for(const st in localForm.value.steps) {
    if(localForm.value.steps[st].some(item => !item.id)) {
      return ElMessage.warning('请保存后再提交');
    }
    stepCount += localForm.value.steps[st].length;
  }
  if(stepCount === 0) {
    return ElMessage.warning('请添加工序后提交');
  }
  if(!localForm.value.trash.num) {
    try {
      await ElMessageBox.confirm('该加工未产生任何废料，是否继续提交？');
    } catch (none) {
      return;
    }
  }
  try {
    await finishProcessApi({
      id:    localForm.value.id,
      trash: localForm.value.trash
    });
    visibleChanger.value = false;
    emit('reload');
  } catch (none) {
    // 
  }
}
// ------------ 表单相关操作 end -------------

init();
</script>
