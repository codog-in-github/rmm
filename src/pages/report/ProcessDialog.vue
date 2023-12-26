<template>
  <ElDialog v-model="visibleChanger" width="1000px">
    <ElForm :model="localForm" labelWidth="120px" v-if="localForm">
      <ElFormItem label="加工状态">{{ localForm.status !== null ? PROCESS_STATUS_MAP[localForm.status] : '配料申请' }}</ElFormItem>
      <ElFormItem label="名称">
        <ElInput v-model="localForm.name" :disabled="localForm.status !== null" />
      </ElFormItem>
      <ElFormItem label="仓库">
        <ElSelectV2 v-model="localForm.storehouseId" :options="storehouses" :disabled="!canEditRaw" />
      </ElFormItem>
      <ElFormItem label="原材料">
        <ElTable :data="localForm.raws">
          <ElTableColumn prop="name" label="原材料名称">
            <template v-slot="{ row }">
              <ElSelectV2
                v-model="row.goodsId" 
                :options="options.raws"
                :disabled="!canEditRaw"
                @change="row.spec = null; row.unitId = null"
              />
            </template>
          </ElTableColumn>
          <ElTableColumn prop="spec" label="规格">
            <template v-slot="{ row }">
              <ElAutocomplete
                v-model="row.spec"
                :fetchSuggestions="querySearch(row.goodsId)"
                :disabled="!canEditRaw"
              >
                <template v-slot:suffix>
                  <template v-if="isStandardSpec(row.spec)">mm</template>
                </template>
              </ElAutocomplete>
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
          <ElTableColumn label="操作" v-if="canEditRaw">
            <template v-slot="{ $index }">
              <ElButton type="danger" @click="handleDeleteRaw($index)">删除</ElButton>
            </template>
          </ElTableColumn>
        </ElTable>
        <div class="text-right m-t-2">
          <ElButton type="primary" @click="handleAddRaw" :disabled="!canEditRaw">添加原材料</ElButton>
        </div>
      </ElFormItem>
      <ElFormItem label="耗材">
        <ElTable :data="localForm.uses">
          <ElTableColumn prop="name" label="耗材名称">
            <template v-slot="{ row }">
              <ElSelectV2
                v-model="row.goodsId" 
                :options="options.uses"
                :disabled="!canEditRaw"
                @change="row.spec = null; row.unitId = null"
              />
            </template>
          </ElTableColumn>
          <ElTableColumn prop="spec" label="规格">
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
          <ElTableColumn label="操作" v-if="canEditRaw">
            <template v-slot="{ $index }">
              <ElButton type="danger" @click="handleDeleteUses($index)">删除</ElButton>
            </template>
          </ElTableColumn>
        </ElTable>
        <div class="text-right m-t-2">
          <ElButton type="primary" @click="handleAddUses" :disabled="!canEditRaw">添加耗材</ElButton>
        </div>
      </ElFormItem>
      <ElFormItem label="成品">
        <ElTable :data="localForm.products">
          <ElTableColumn prop="name" label="成品名称">
            <template v-slot="{ row }">
              <ElSelectV2
                v-model="row.goodsId"
                :options="options.products"
                :disabled="!canEditProduct"
                @change="row.spec = null; row.unitId = null"
              />
            </template>
          </ElTableColumn>
          <ElTableColumn prop="spec" label="规格">
            <template v-slot="{ row }">
              <ElAutocomplete
                v-model="row.spec"
                :fetchSuggestions="querySearch(row.goodsId)"
                :disabled="!canEditProduct"
              >
                <template v-slot:suffix>
                  <template v-if="isStandardSpec(row.spec)">mm</template>
                </template>
              </ElAutocomplete>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="num" label="数量">
            <template v-slot="{ row }">
              <ElInputNumber
                controlsPosition="right"
                v-model="row.num"
                :min="1"
                :disabled="!canEditProduct"
              />
            </template>
          </ElTableColumn>
          <ElTableColumn prop="unit" label="单位">
            <template v-slot="{ row }">
              <ElSelectV2
                v-model="row.unitId"
                :options="units(row.goodsId)"
                :disabled="!canEditProduct"
              />
            </template>
          </ElTableColumn>
          <ElTableColumn label="操作" v-if="canEditProduct">
            <template v-slot="{ $index }">
              <ElButton type="danger" @click="handleDeleteProduct($index)">删除</ElButton>
            </template>
          </ElTableColumn>
        </ElTable>
        <div class="text-right m-t-2">
          <ElButton type="primary" @click="handleAddProduct" :disabled="!canEditProduct">添加成品</ElButton>
        </div>
      </ElFormItem>
      <ElFormItem label="总金额">
        <ElInputNumber controlsPosition="right" v-model="localForm.total" :disabled="!canEditProduct"  />
      </ElFormItem>
      <ElFormItem label="备注">
        <ElInput
          v-model="localForm.remark"
          type="textarea"
          :disabled="!canEditProduct"
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
import { getNewProcessOptions, rawApply, finishProcess as finishProcessApi } from '@/api';
import { PROCESS_STATUS_MAP, PROCESS_STATUS_PROCESS } from '@/constant';
import { isStandardSpec } from '@/helpers';
import { ElMessage } from 'element-plus';
import { cloneDeep } from 'lodash';
import { computed, reactive, ref, watch } from 'vue';

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
const localForm = ref(null);
const emit = defineEmits(['update:visible', 'reload']);
const visibleChanger = computed({
  get() {
    return props.visible;
  },
  set(val) {
    emit('update:visible', val);
  }
});
watch(() => props.model, val => {
  localForm.value = cloneDeep(val);
});
function emptyRaw() {
  return {
    goodsId: null,
    spec:    null,
    num:     null,
    unitId:  null
  };
}
function emptyUses() {
  return {
    goodsId: null,
    spec:    null,
    num:     null,
    unitId:  null
  };
}
function emptyProduct() {
  return {
    goodsId: null,
    spec:    null,
    num:     null,
    unitId:  null
  };
}
function handleAddRaw() {
  localForm.value.raws.push(emptyRaw());
}
function handleAddUses() {
  localForm.value.uses.push(emptyUses());
}
function handleAddProduct() {
  localForm.value.products.push(emptyProduct());
}
function handleDeleteRaw(index) {
  if(localForm.value.raws.length === 1) {
    ElMessage.warning('至少保留一个原材料');
    return;
  }
  localForm.value.raws.splice(index, 1);
}
function handleDeleteUses(index) {
  localForm.value.uses.splice(index, 1);
}
function handleDeleteProduct(index) {
  if(localForm.value.products.length === 1) {
    ElMessage.warning('至少保留一个成品');
    return;
  }
  localForm.value.products.splice(index, 1);
}

const canEditRaw  = computed(() => localForm.value?.status === null);
const canEditProduct = computed(() => localForm.value?.status === PROCESS_STATUS_PROCESS);
const options = reactive({
  raws:     [],
  products: [],
  uses:     [],
  units:    {},
  specs:    {}
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
async function init() {
  console.log('init');
  const rep = await getNewProcessOptions();
  console.log(rep);
  options.raws = rep.raws;
  options.products = rep.products;
  options.uses = rep.uses;
  options.units = rep.units;
  options.specs = rep.specs;
}
init();

async function rawApplySubmit() {
  if(!localForm.value.name) {
    return ElMessage.warning('请填写名称');
  }
  if(localForm.value.raws.length === 0) {
    return ElMessage.warning('请添加原材料');
  }
  if(!localForm.value.storehouseId) {
    return ElMessage.warning('请选择仓库');
  }
  if(
    !localForm.value.raws.every(raw => {
      return raw.goodsId && raw.spec && raw.num && raw.unitId;
    })
  ) {
    return ElMessage.warning('原材料未填写完整');
  }
  await rawApply(localForm.value);
  visibleChanger.value = false;
  emit('reload');
}


function querySearch(id) {
  const _options = specs.value(id).map(item => ({ value: item.label }));
  return function(_, cb) {
    cb(_options);
  };
}

async function finishProcess() {
  try {
    if(localForm.value.products.length === 0) {
      return ElMessage.warning('请添加成品');
    }
    if(!localForm.value.products.every(product => {
      return product.goodsId && product.spec && product.num && product.unitId;
    })) {
      return ElMessage.warning('成品未填写完整');
    }
    if(!localForm.value.total) {
      return ElMessage.warning('请填写总金额');
    }
    await finishProcessApi({
      id:       localForm.value.id,
      total:    localForm.value.total,
      remark:   localForm.value.remark,
      products: localForm.value.products.map(product => {
        return {
          goodsId: product.goodsId,
          spec:    product.spec,
          num:     product.num,
          unitId:  product.unitId
        };
      })
    });
    visibleChanger.value = false;
    emit('reload');
  } catch (error) {
    // 
  }
}
</script>
