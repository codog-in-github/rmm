<template>
  <ElDialog v-model="visibleChanger" width="1000px">
    <ElForm :model="localForm" labelWidth="120px" v-if="localForm">
      <ElFormItem label="加工状态">{{ localForm.status !== null ? PROCESS_STATUS_MAP[localForm.status] : '新增作业' }}</ElFormItem>
      <ElFormItem label="名称">
        <ElInput v-model="localForm.name" />
      </ElFormItem>
      <ElFormItem label="仓库">
        <ElSelectV2 v-model="localForm.storehouseId" :options="storehouses" :disabled="!canEditRaw" />
      </ElFormItem>
      <ElFormItem label="原材料申请">
        <ElTable :data="localForm.raws">
          <ElTableColumn prop="name" label="原材料名称">
            <template #default="{ row }">
              <ElSelectV2
                v-model="row.goodsId" 
                :options="options.raws"
                :disabled="!canEditRaw"
                @change="row.specificationId = null; row.unitId = null"
              />
            </template>
          </ElTableColumn>
          <ElTableColumn prop="specification" label="规格">
            <template #default="{ row }">
              <ElSelectV2
                v-model="row.specificationId"
                :options="specifications(row.goodsId)"
                :disabled="!canEditRaw"
              />
            </template>
          </ElTableColumn> 
          <ElTableColumn prop="num" label="数量">
            <template v-slot="{row}">
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
            <template #default="{ $index }">
              <ElButton type="danger" @click="handleDeleteRaw($index)">删除</ElButton>
            </template>
          </ElTableColumn>
        </ElTable>
        <div class="text-right m-t-2">
          <ElButton type="primary" @click="handleAddRaw" :disabled="!canEditRaw">添加原材料</ElButton>
        </div>
      </ElFormItem>
      <ElFormItem label="成品入库">
        <ElTable :data="localForm.products">
          <ElTableColumn prop="name" label="成品名称" />
          <ElTableColumn prop="specification" label="规格" />
          <ElTableColumn prop="num" label="数量" />
          <ElTableColumn prop="unit" label="单位" />
          <ElTableColumn label="操作">
            <template #default="{ $index }">
              <ElButton type="danger" @click="handleDeleteProduct($index)">删除</ElButton>
            </template>
          </ElTableColumn>
        </ElTable>
        <div class="text-right m-t-2">
          <ElButton type="primary" @click="handleAddProduct" :disabled="!canEditProduct">添加成品</ElButton>
        </div>
      </ElFormItem>
      <ElFormItem label="备注">
        <ElInput v-model="localForm.remark" type="textarea" autosize />
      </ElFormItem>
    </ElForm>
    <template #footer v-if="localForm">
      <ElButton @click="visibleChanger = false">关闭</ElButton>
      <ElButton
        type="primary"
        v-if="localForm.status === null"
        @click="rawApplySubmit"
      >
        原材料申请
      </ElButton>
      <ElButton
        type="primary"
        v-else-if="localForm.status === PROCESS_STATUS_WAIT"
        @click="visibleChanger = false"
      >
        入库申请
      </ElButton>
    </template>
  </ElDialog>
</template>

<script setup>
import { getNewProcessOptions, rawApply } from '@/api';
import { PROCESS_STATUS_MAP, PROCESS_STATUS_WAIT } from '@/constant';
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
    goodsId:         null,
    specificationId: null,
    num:             null,
    unitId:          null
  };
}
function handleAddRaw() {
  localForm.value.raws.push(emptyRaw());
}
function handleDeleteRaw(index) {
  if(localForm.value.raws.length === 1) {
    ElMessage.warning('至少保留一个原材料');
    return;
  }
  localForm.value.raws.splice(index, 1);
}
function emptyProduct() {
  return {
    goodsId:         null,
    specificationId: null,
    num:             null,
    unitId:          null
  };
}
function handleAddProduct() {
  localForm.value.products.push(emptyProduct());
}
function handleDeleteProduct(index) {
  if(localForm.value.products.length === 1) {
    ElMessage.warning('至少保留一个成品');
    return;
  }
  localForm.value.products.splice(index, 1);
}
const canEditRaw  = computed(() => localForm.value?.status === null);
const canEditProduct = computed(() => localForm.value?.status === PROCESS_STATUS_WAIT);
const options = reactive({
  raws:           [],
  products:       [],
  units:          {},
  specifications: {}
});

const units = computed(() => {
  return function(id) {
    if(id && options.units[id]) {
      return options.units[id];
    }
    return [];
  };
});
const specifications = computed(() => {
  return function(id) {
    if(id && options.specifications[id]) {
      return options.specifications[id];
    }
    return [];
  };
});
async function init() {
  const rep = await getNewProcessOptions();
  options.raws = rep.raws;
  options.products = rep.products;
  options.units = rep.units;
  options.specifications = rep.specifications;
}
init();

async function rawApplySubmit() {
  if(!localForm.value.name) {
    ElMessage.warning('请填写名称');
    return;
  }
  if(localForm.value.raws.length === 0) {
    ElMessage.warning('请添加原材料');
    return;
  }
  if(!localForm.value.storehouseId) {
    ElMessage.warning('请选择仓库');
    return;
  }
  if(
    localForm.value.raws.some((raw, i) => {
      if(!raw.goodsId) {
        ElMessage.warning(`原材料${i + 1}未选择`);
        return true;
      }
      if(!raw.specificationId) {
        ElMessage.warning(`原材料${i + 1}未选择规格`);
        return true;
      }
      if(!raw.num) {
        ElMessage.warning(`原材料${i + 1}未填写数量`);
        return true;
      }
      if(!raw.unitId) {
        ElMessage.warning(`原材料${i + 1}未选择单位`);
        return true;
      }
      return false;
    })
  ) {
    return;
  }
  await rawApply(localForm.value);
  visibleChanger.value = false;
  emit('reload');
}
</script>
