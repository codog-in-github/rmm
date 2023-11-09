<template>
  <div class="gl-filter-bar">
    <slot />
    <div class="gl-filter-bar__search">
      <ElButton type="primary" @click="onSeachButtonClick">{{ searchButtonText }}</ElButton>
    </div>
    <div class="gl-filter-bar__after" v-if="$slots.after"><slot name="after" /></div>
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
  }
});
const emit = defineEmits(['search']);
provide('GlFilterBarModel', props.model);
const onSeachButtonClick  = debounce(function(e) {
  emit('search', e);
}, 200);
const searchButtonText = computed(() => {
  return slots.default ? '搜索' : '刷新';
});
</script>
