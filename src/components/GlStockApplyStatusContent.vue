<template>
  <span v-if="props.status === CONSTANT.STOCK_APPLY_STATUS_REJECT" class="color-danger">驳回</span>
  <span v-else-if="props.status === CONSTANT.STOCK_APPLY_STATUS_CANCEL" class="color-danger">取消</span>
  <template v-if="props.type === CONSTANT.STOCK_APPLY_TYPE_OUT">
    <span v-if="props.status === CONSTANT.STOCK_APPLY_STATUS_WAITING" class="color-warning">待配料</span>
    <span v-else-if="props.status === CONSTANT.STOCK_APPLY_STATUS_PASS" class="color-success">配料完成</span>
    <span v-else-if="props.status === CONSTANT.STOCK_APPLY_STATUS_FINISH" class="color-success">车间已确认</span>
  </template>
  <template v-else>
    <span v-if="props.status === CONSTANT.STOCK_APPLY_STATUS_WAITING" class="color-warning">等待入库</span>
    <span v-else-if="props.status === CONSTANT.STOCK_APPLY_STATUS_FINISH" class="color-success">入库完成</span>
  </template>
</template>
<script setup>
import * as CONSTANT from '@/constant';

const props = defineProps({
  status: {
    type:     Number,
    required: true
  },
  type: {
    type:     Number,
    required: true
  }
});
</script>
