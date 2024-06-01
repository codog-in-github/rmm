<template>
  <ElDialog v-model="visibleChanger" title="详情">
    <ElForm v-if="model" labelWidth="120px">
      <ElFormItem label="申请车间">
        {{ model.apply.workshopName }}
      </ElFormItem>
      <ElFormItem label="状态">
        <GlStockApplyStatusContent :status="model.apply.status" :type="model.apply.type" />
      </ElFormItem>
      <ElFormItem label="原材料" v-if="model.raws.length > 0">
        <ElTable :data="model.raws">
          <ElTableColumn label="名称" prop="goodsName"  width="100" />
          <ElTableColumn label="规格" prop="spec">
            <template v-slot="{row}">
              <template v-if="row.subSpec">【{{ row.subSpec }}】</template>
              {{ row.spec }}
              <template v-if="isStandardSpec(row.spec)">(mm)</template>
            </template>
          </ElTableColumn>
          <template v-if="editable">
            <ElTableColumn label="数量" prop="num"  width="120">
              <template v-slot="{ row }">
                <ElInput
                  v-model.number="realNums[row.id]"
                  type="number"
                  min="0"
                  :disabled="row.spec === GOODS_SPEC_TRASH"
                  @change="calTrashNum"
                  :placeholder="row.num"
                />
              </template>
            </ElTableColumn>
          </template>
          <template v-else>
            <ElTableColumn label="实际数量"  prop="num" width="120" />
          </template>
          <ElTableColumn label="申请数量" prop="applyNum" width="120" />
          <ElTableColumn label="单位" prop="unitName"  width="60" />
        </ElTable>
      </ElFormItem>
      <ElFormItem label="耗材" v-if="model.uses.length > 0">
        <ElTable :data="model.uses">
          <ElTableColumn label="名称" prop="goodsName" />
          <ElTableColumn label="规格" prop="spec"  />
          <template v-if="editable">
            <ElTableColumn label="数量" prop="num"  width="120">
              <template v-slot="{ row }">
                <ElInput
                  v-model.number="realNums[row.id]"
                  type="number"
                  min="0"
                  :placeholder="row.num"
                />
              </template>
            </ElTableColumn>
          </template>
          <template v-else>
            <ElTableColumn label="实际数量" prop="num" width="120" />
          </template>
          <ElTableColumn label="申请数量" prop="applyNum" width="120" />
          <ElTableColumn label="单位" prop="unitName" />
        </ElTable>
      </ElFormItem>
      <ElFormItem label="申请人">
        {{ model.apply.applyUserName }}
      </ElFormItem>
      <ElFormItem label="申请时间">
        {{ moment(model.apply.createdAt).format('YYYY-MM-DD hh:mm') }}
      </ElFormItem>
    </ElForm>
    <template #footer>
      <ElButton @click="visibleChanger = false">关闭</ElButton>
      <template v-if="editable">
        <ElButton v-if="model.apply.type === STOCK_APPLY_TYPE_IN" type="primary" @click="submit">确认入库</ElButton>
        <ElButton v-else-if="model.apply.type === STOCK_APPLY_TYPE_OUT" type="primary" @click="submit">确认出库</ElButton>
      </template>
    </template>
  </ElDialog>
</template>
<script setup>

import {
  GOODS_SPEC_TRASH,
  STOCK_APPLY_STATUS_WAITING, STOCK_APPLY_TYPE_IN, STOCK_APPLY_TYPE_OUT
} from '@/constant';
import moment from 'moment';
import {computed, ref, watch} from 'vue';
import { isStandardSpec } from '@/helpers';

const props = defineProps({
  visible: {
    type:    Boolean,
    default: false
  },
  model: {
    type: Object
  }
});
const realNums = ref({ _: false });
const emit = defineEmits(['update:visible', 'submit']);
const visibleChanger = computed({
  get: () => props.visible,
  set: val => emit('update:visible', val)
});

const trashIndex = computed(() => {
  if(!props.model?.raws) {
    return  -1;
  }
  return props.model.raws.findIndex(raw => raw.spec === GOODS_SPEC_TRASH);
});

const rawTotal = computed(() => {
  if(!props.model?.raws) {
    return 0;
  }
  return props.model.raws.reduce((total, raw) => {
    return total + raw.applyNum;
  }, 0);
});

function calTrashNum() {
  if(trashIndex.value === -1) {
    return;
  }
  let total = 0;
  for(let i = 0; i < props.model.raws.length; i++) {
    if(i !== trashIndex.value) {
      const num = realNums.value[props.model.raws[i].id];
      if(!num) {
        return;
      }
      total += num;
    }
  }
  realNums.value[props.model.raws[trashIndex.value].id] = rawTotal.value - total;
}

watch(() => props.visible, (val) => {
  if(val) {
    realNums.value = { _: false };
  }
});

const editable = computed(() => {
  return Boolean(props.model?.apply.status === STOCK_APPLY_STATUS_WAITING);
});

function submit() {
  emit('submit', props.model.apply.id, realNums.value);
}

</script>
