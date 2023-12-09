<template>
  <div class="gl-filter-item">
    <label>{{ props.label }}</label>
    <div class="gl-filter-item__control">
      <slot :value="localValue">
        <ElInput
          v-if="props.type === 'input'"
          :placeholder="`请输入${props.label}`"
          v-model="localValue"
          v-bind="$attrs"
        />
        <ElSelectV2
          v-if="props.type ==='select'"
          :placeholder="`请选择${props.label}`"
          v-model="localValue"
          :options="props.options"
          v-bind="$attrs"
        />
        <ElDatePicker
          v-if="props.type === 'daterange'"
          type="daterange"
          placeholder="请选择日期"
          v-model="localValue"
          valueFormat="YYYY-MM-DD"
          v-bind="$attrs"
        />
      </slot>
    </div>
  </div>
</template>

<script setup>
import { computed, inject } from 'vue';

const props = defineProps({
  prop: {
    type:     String,
    required: true
  },
  label: {
    type:    String,
    default: ''
  },
  type: {
    type:    String,
    default: 'input'
  }
});

const model = inject('GlFilterBarModel');

const localValue = computed({
  get() {
    return model[props.prop];
  },
  set(newValue) {
    model[props.prop] = newValue;
  }
});
</script>
