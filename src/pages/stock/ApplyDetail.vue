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
          <ElTableColumn label="数量" prop="num"  width="60" />
          <ElTableColumn label="单位" prop="unitName"  width="60" />
        </ElTable>
      </ElFormItem>
      <ElFormItem label="耗材" v-if="model.uses.length > 0">
        <ElTable :data="model.uses">
          <ElTableColumn label="名称" prop="goodsName" />
          <ElTableColumn label="规格" prop="spec"  />
          <ElTableColumn label="数量" prop="num" />
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
      <template v-if="model?.apply.status === STOCK_APPLY_STATUS_WAITING">
        <ElButton v-if="model.apply.type === STOCK_APPLY_TYPE_IN" type="primary" @click="submit">确认入库</ElButton>
        <ElButton v-else-if="model.apply.type === STOCK_APPLY_TYPE_OUT" type="primary" @click="submit">确认出库</ElButton>
      </template>
    </template>
  </ElDialog>
</template>
<script setup>

import {
  STOCK_APPLY_STATUS_WAITING, STOCK_APPLY_TYPE_IN, STOCK_APPLY_TYPE_OUT
} from '@/constant';
import moment from 'moment';
import { computed } from 'vue';
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
const emit = defineEmits(['update:visible', 'submit']);
const visibleChanger = computed({
  get: () => props.visible,
  set: val => emit('update:visible', val)
});

function submit() {
  emit('submit', props.model.apply.id);
}

</script>
