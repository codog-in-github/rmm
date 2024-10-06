<template>
  <div class="gl-filter-bar">
    <slot />
    <div class="gl-filter-bar__search">
      <ElButton type="primary" @click="onSeachButtonClick">{{ searchButtonText }}</ElButton>
    </div>
    <div class="gl-filter-bar__reset" v-if="props.showReset">
      <ElButton @click="onResetButtonClick">重置</ElButton>
    </div>
    <template v-if="$slots.after"><slot name="after" /></template>
  </div>
</template>
<script setup>
import { computed, provide, useSlots } from 'vue';
import { debounce } from 'lodash';
const slots = useSlots();
const props = defineProps({
  model: {
    type:     Object,
    required: true
  },
  showReset: {
    type:    Boolean,
    default: false
  },
  defaultValue: {
    type: Function
  }
});
const emit = defineEmits(['search']);
provide('GlFilterBarModel', props.model);

const onSeachButtonClick  = debounce(function(e) {
  emit('search', e);
}, 200);

const onResetButtonClick = debounce(function(e) {
  const defVal = props.defaultValue ? props.defaultValue() : {};
  for(const key in props.model) {
    props.model[key] = defVal[key];
  }
  emit('search', e);
}, 200);

const searchButtonText = computed(() => {
  return slots.default ? '搜索' : '刷新';
});
</script>
