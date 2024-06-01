<template>
  <ElDialog v-model="visibleChanger" width="800px" title="耗材申请单">
    <ElForm v-if="localForm" labelWidth="80px">
      <ElFormItem label="仓库" prop="id">
        <ElSelectV2 v-model="localForm.storehouseId" :options="storehouses" />
      </ElFormItem>
      <ElFormItem label="耗材">
        <ElTable :data="localForm.items">
          <ElTableColumn prop="name" label="耗材名称">
            <template v-slot="{ row }">
              <ElSelectV2
                v-model="row.goodsId" 
                :options="options.goods"
                @change="row.spec = null; row.unitId = null"
              />
            </template>
          </ElTableColumn>
          <ElTableColumn prop="spec" label="规格">
            <template v-slot="{ row }">
              <ElAutocomplete
                v-model="row.spec"
                :fetchSuggestions="useQuerySearch(row.goodsId)"
              />
            </template>
          </ElTableColumn> 
          <ElTableColumn prop="num" label="数量">
            <template v-slot="{ row}">
              <ElInputNumber
                class="w-full"
                controlsPosition="right"
                v-model="row.num"
                :min="1"
              />
            </template>
          </ElTableColumn>
          <ElTableColumn prop="unit" label="单位">
            <template v-slot="{ row }">
              <ElSelectV2
                v-model="row.unitId"
                :options="units(row.goodsId)"
              />
            </template>
          </ElTableColumn>
          <ElTableColumn label="操作">
            <template v-slot="{ row }">
              <ElButton type="danger" @click="handleDeleteRaw(row.$index)">删除</ElButton>
            </template>
          </ElTableColumn>
        </ElTable>
        <div class="w-full m-t-2 text-right">
          <ElButton type="primary" @click="handleAddRaw">添加</ElButton>
        </div>
      </ElFormItem>
    </ElForm>
    <template v-slot:footer>
      <ElButton @click="handleSubmit">确定</ElButton>
      <ElButton @click="visibleChanger = false">取消</ElButton>
    </template>
  </ElDialog>
</template>
<script setup>
import { getNewProcessOptions, getSpecOptions } from '@/api';
import { GOODS_SPEC_SCENES_WORKSHOP, GOODS_TYPE_USE } from '@/constant';
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
const emit = defineEmits(['submit', 'update:visible']);
const localForm = ref(null);
const options = reactive({
  goods: [],
  units: {}
});
const visibleChanger = computed({
  get() {
    return props.visible;
  },
  set(val) {
    emit('update:visible', val);
  }
});
watch(() => props.model, (val) => {
  localForm.value = cloneDeep(val);
});
async function init() {
  const rep = await getNewProcessOptions();
  options.goods = rep.goods[GOODS_TYPE_USE] ?? [];
  options.units = rep.units;
}
const units = computed(() => {
  return function(id) {
    if(id && options.units[id]) {
      return options.units[id];
    }
    return [];
  };
});
function useQuerySearch(goodsId) {
  if(!goodsId) {
    return function querySearch(_, cb) {
      cb([]);
    };
  }
  return async function querySearch(_, cb) {
    const rep = await getSpecOptions({
      goodsId,
      scenes: GOODS_SPEC_SCENES_WORKSHOP
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

function handleAddRaw() {
  if(localForm.value.items) {
    localForm.value.items.push({
      goodsId: null,
      spec:    null,
      unitId:  null,
      num:     null
    });
  }
}
function handleDeleteRaw(index) {
  if(localForm.value.items.length === 1) {
    ElMessage.warning('请至少保留一个项目');
    return;
  }
  localForm.value.items.splice(index, 1);
}
function handleSubmit() {
  if(localForm.value.items.length < 1) {
    return ElMessage.warning('请至少添加一个项目');
  }
  if(localForm.value.items.some(item => {
    return !item.goodsId  ||!item.unitId ||!item.num;
  })) {
    return ElMessage.warning('请填写完整的项目');
  }
  emit('submit', localForm.value);
  visibleChanger.value = false;
}
init();
</script>
