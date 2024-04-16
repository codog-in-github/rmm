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
        <ElFormItem label="工序">
          <ElTable :data="localForm.steps" :spanMethod="spanMethod">
            <ElTableColumn prop="spec" label="规格(MM)">
              <template v-slot="{ row }">
                <ElAutocomplete
                  v-model="row.spec"
                  :fetchSuggestions="querySearch(row.goodsId)"
                  :disabled="row.id || row.type === PROCESS_STEP_TYPE_JIAOZHI"
                />
                <div v-if="row.stockStatus === PROCESS_STEP_STOCK_TYPE_IN" class="tag">入 库</div>
              </template>
            </ElTableColumn>

            <ElTableColumn label="类型" width="80px">
              <template v-slot="{ row }">
                {{ PROCESS_STEP_MAP[row.type] }}
              </template>
            </ElTableColumn>
            <ElTableColumn label="数量（KG）">
              <template v-slot="{ row, $index }">
                <ElInputNumber
                  v-if="row.stockStatus === PROCESS_STEP_STOCK_TYPE_IN || row.type === PROCESS_STEP_TYPE_JIAOZHI"
                  class="w-full"
                  controlsPosition="right"
                  v-model="row.num"
                  :min="0"
                  :max="calMaxWeight(row.type, $index)"
                  :disabled="row.id"
                />
                <NumInput
                  v-else
                  v-model="row.num"
                  :disabled="row.id"
                  :total="calMaxWeight(row.type, $index)"
                />
              </template>
            </ElTableColumn>
            <ElTableColumn label="长度（M）"  width="100px" :formatter="lengthCalc" />
            <ElTableColumn label="加工费（元/M）">
              <template v-slot="{ row }">
                <ElInputNumber
                  v-if="row.stockStatus === PROCESS_STEP_STOCK_TYPE_NONE"
                  class="w-full"
                  :disabled="row.id"
                  v-model="row.pricePerLength"
                  controlsPosition="right"
                />
              </template>
            </ElTableColumn>
            <ElTableColumn label="合计（元）">
              <template v-slot="{ row }">
                <span v-if="row.stockStatus === PROCESS_STEP_STOCK_TYPE_NONE">
                  {{ priceCalc(row) }}
                </span>
              </template>
            </ElTableColumn>
            <ElTableColumn
              label="操作"
              width="100px"
              align="right"
              v-if="canEditProduct"
            >
              <template v-slot="{ row, $index }">
                <template v-if="row.id">
                  <template v-if="row.type === PROCESS_STEP_TYPE_LAGUAN">
                    <ElButton
                      v-if="
                        row.stockStatus === PROCESS_STEP_STOCK_TYPE_IN
                          && !row.cid && !localForm.steps[$index + 1]?.pid
                      "
                      type="primary"
                      @click="addStep(row.id, $index)"
                    >
                      矫直
                    </ElButton>
                    <GlAsyncButton
                      v-if="
                        $index === canToStockIndex
                      "
                      type="primary"
                      :click="() => toStock(row)"
                    >
                      加工完成
                    </GlAsyncButton>
                  </template>
                </template>
                <GlAsyncButton
                  v-else
                  type="primary"
                  :click="() => saveStep(row, $index)"
                >
                  保存
                </GlAsyncButton>
              </template>
            </ElTableColumn>
          </ElTable>
          <div class="m-t-2 p-r-12px w-full text-right" v-if="localForm.status === PROCESS_STATUS_PROCESS">
            <ElButton
              type="primary"
              @click="addStep()"
            >
              添加
            </ElButton>
          </div>
        </ElFormItem>
      </template>
      <ElFormItem label="废料"  v-if="localForm.status === PROCESS_STATUS_FINISH">
        <ElInput
          class="m-r-2"
          :modelValue="trashTotalWeight"
          disabled
        >
          <template #append>KG</template>
        </ElInput>
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
        工序完毕
      </ElButton>
    </template>
  </ElDialog>
</template>

<script setup>
import {
  rawApply,
  finishProcess as finishProcessApi,
  saveStep as saveStepApi,
  toStock as toStockApi
} from '@/api';
import {
  PROCESS_STATUS_MAP,
  PROCESS_STATUS_PROCESS,
  GOODS_TYPE_RAW,
  PROCESS_STEP_TYPE_JIAOZHI,
  PROCESS_STEP_TYPE_LAGUAN,
  PROCESS_STEP_MAP,
  PROCESS_STEP_STOCK_TYPE_NONE, PROCESS_STEP_STOCK_TYPE_IN, PROCESS_STATUS_FINISH
} from '@/constant';
import { conversionSpec, isStandardSpec } from '@/helpers';
import { ElMessage, ElMessageBox } from 'element-plus';
import { cloneDeep } from 'lodash';
import moment from 'moment';
import {computed, ref, watch} from 'vue';
import { getOptions } from '@/helpers/process';
import NumInput from './NumInput.vue';

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
const { units, goodsDefaultUnitMapping, goods, specs, unitConversionMapping } = getOptions();

// ------------ 属性计算 start -------------
const totalWeight = computed(() => {
  if(localForm.value.raw && unitConversionMapping.value) {
    return localForm.value.raw.num * unitConversionMapping.value[localForm.value.raw.unitId];
  }
  return 0;
});
function calMaxWeight(type, index) {
  if(type === PROCESS_STEP_TYPE_JIAOZHI) {
    return localForm.value.steps[index - 1].num;
  } else {
    let reduce = 0;
    let last = totalWeight.value;
    for(let i = index - 1; i >= 0 && i < localForm.value.steps.length; i--) {
      const item = localForm.value.steps[i];
      if(!item.id || item.type !== PROCESS_STEP_TYPE_LAGUAN) {
        continue;
      }
      if(item.stockStatus === PROCESS_STEP_STOCK_TYPE_NONE) {
        last = item.num;
        break;
      } else {
        reduce += item.num;
      }
    }
    return last - reduce;
  }
}
const trashTotalWeight = computed(() => {
  if(!totalWeight.value) {
    return 0;
  }
  return totalWeight.value
        - localForm.value.steps.reduce((total, item) => {
          if(item.type === PROCESS_STEP_TYPE_LAGUAN && item.stockStatus === PROCESS_STEP_STOCK_TYPE_IN) {
            return total + item.num;
          }
          return total;
        }, 0);
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

const canToStockIndex = computed(function() {
  for(let i = localForm.value.steps.length - 1; i >= 0 ; i--) {
    const item = localForm.value.steps[i];
    if(item.type === PROCESS_STEP_TYPE_LAGUAN && item.stockStatus === PROCESS_STEP_STOCK_TYPE_NONE) {
      return i;
    }
  }
  return -1;
});

const toStockMax = computed(function() {
  if(canToStockIndex.value >= 0) {
    let total = localForm.value.steps[canToStockIndex.value].num;
    for(let i = canToStockIndex.value + 1; i < localForm.value.steps.length; i++) {
      if(localForm.value.steps[i].type === PROCESS_STEP_TYPE_LAGUAN) {
        total -= localForm.value.steps[i].num;
      }
    }
    return total;
  }
  return 0;
});
// ------------ 属性计算 end ------------

function spanMethod({ row, column, rowIndex }) {
  if(column.property === 'spec') {
    if(row.pid) {
      return [ 0, 1 ];
    } else if(localForm.value.steps[rowIndex + 1]?.pid) {
      return [ 2, 1 ];
    }
  }
}

// ------------ 选项 start -------------
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
  row.unitId = goodsDefaultUnitMapping.value[id];
}

function addStep(id = 0, index = localForm.value.steps.length) {
  const form = localForm.value;
  if(form.steps.some(item => !item.id)) {
    return ElMessage.warning('请保存后再添加');
  }
  const type = id ? PROCESS_STEP_TYPE_JIAOZHI : PROCESS_STEP_TYPE_LAGUAN;
  const row = {
    id:             null,
    cid:            0,
    pid:            id,
    type,
    goodsId:        form.raw.goodsId,
    spec:           id ? localForm.value.steps[index].spec : null,
    num:            calMaxWeight(type, index),
    length:         null,
    pricePerLength: null,
    stockStatus:    PROCESS_STEP_STOCK_TYPE_NONE
  };
  if(id) {
    form.steps.splice(index + 1, 0, row);
  } else {
    form.steps.push(row);
  }
}
async function saveStep(row, index) {
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
  params.sort = localForm.value.steps.length;
  try {
    const { id } = await saveStepApi(params);
    if(row.type === PROCESS_STEP_TYPE_JIAOZHI) {
      localForm.value.steps[index-1].cid = id;
    }
    row.id = id;
    ElMessage.success('保存成功');
  } catch (none) {
    ElMessage.error('保存失败');
  }
}

async function toStock(row) {
  if(toStockMax.value <= 0) {
    return ElMessage.error('无剩余材料可入库');
  }
  let { value: num } = await ElMessageBox.prompt('请输入入库数量（KG）', '提示', {
    inputPlaceholder: toStockMax.value
  });
  if(!num) {
    num = toStockMax.value;
  }
  const rec = await toStockApi(row.id, num);
  localForm.value.steps.push(rec);
  ElMessage.success('操作成功');
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
  if(localForm.value.steps.some(item => !item.id)) {
    return ElMessage.warning('请保存后再提交');
  }
  if(localForm.value.steps.length === 0) {
    return ElMessage.warning('请添加工序后提交');
  }
  try {
    await finishProcessApi(localForm.value.id);
    visibleChanger.value = false;
    emit('reload');
  } catch (none) {
    // 
  }
}
// ------------ 表单相关操作 end -------------

</script>

<style lang="scss" scoped>
.tag{
  color: #fff;
  font-size: 10px;
  background-color: var(--el-color-primary);
  text-align: center;
  position: absolute;
  top: -0.7em;
  left: -3.2em;
  transform-origin: center center;
  padding-top: 1em;
  transform: rotate(-45deg);
  width: 8em;
}
:deep(.el-table__cell){
  overflow: hidden;
}
</style>
