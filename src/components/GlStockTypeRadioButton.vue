<script setup>
import {map2array} from '@/helpers';
import {GOODS_TYPE_MAP, STOCK_TYPE_MAP} from '@/constant';

defineProps({
  modelValue: {
    type:    Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue']);
const goodsTypeList = map2array(STOCK_TYPE_MAP);
</script>

<template>
  <div class="container">
    <div
      v-for="item in goodsTypeList"
      :key="item.value"

      class="btn"
      :class="{
        active: item.value === modelValue
      }"
      @click="emit('update:modelValue', item.value); emit('change', item.value)"
    >
      {{ item.label }}
    </div>
  </div>
</template>

<style scoped lang="scss">
.container {
  display: inline-flex;
  gap: 10px;
}

.btn {
  width: 4em;
  height: 2em;
  line-height: 2em;
  text-align: center;

  border-radius: 4px;
  border: 1px solid var(--el-border-color);

  cursor: pointer;

  &.active {
    background: var(--el-color-primary);
    color: #fff;
  }
}
</style>
