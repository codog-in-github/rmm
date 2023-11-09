<template>
  <div class="gl-filter-bar">
    <slot />
    <div class="gl-filter-bar__search">
      <ElButton type="primary">搜索</ElButton>
    </div>
    <div class="gl-filter-bar__after" v-if="$slots.after"><slot name="after" /></div>
  </div>
</template>
<script setup>
import { provide } from 'vue';

const props = defineProps({
  model: {
    type:     Object,
    required: true
  }
});

provide('GlFilterBarModel', props.model);
</script>
