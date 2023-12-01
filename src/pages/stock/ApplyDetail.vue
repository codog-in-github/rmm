<template>
  <ElDialog v-model="visibleChanger" title="详情">
    <ElForm v-if="model" labelWidth="120px">
      <ElFormItem label="申请车间">
        {{ model.apply.workshopName }}
      </ElFormItem>
      <ElFormItem label="状态">
        <GlStockApplyStatusContent :status="model.apply.status" :type="model.apply.type" />
      </ElFormItem>
      <ElFormItem label="原材料">
        <ElTable :data="model.raws">
          <ElTableColumn label="名称" prop="goodsName" />
          <ElTableColumn label="规格" prop="specification" :formatter="(_, __, value) => value + '(mm)'" />
          <ElTableColumn label="数量" prop="num" />
          <ElTableColumn label="单位" prop="unitName" />
        </ElTable>
      </ElFormItem>
      <ElFormItem label="耗材">
        <ElTable :data="model.uses">
          <ElTableColumn label="名称" prop="goodsName" />
          <ElTableColumn label="规格" prop="specification"  />
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
      <ElButton v-if="model?.apply.status === STOCK_APPLY_STATUS_WAITING" type="primary" @click="submit">确认配料</ElButton>
    </template>
  </ElDialog>
</template>
<script setup>

import {
  STOCK_APPLY_STATUS_WAITING
} from '@/constant';
import moment from 'moment';
import { computed } from 'vue';
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
