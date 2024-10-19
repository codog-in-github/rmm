<template>
  <div class="gl-filter-item">
    <label>{{ props.label }}</label>
    <div class="gl-filter-item__control">
      <slot>
        <ElInput
          v-if="props.type === 'input'"
          :placeholder="`请输入${props.label}`"
          v-model="localValue"
          v-bind="$attrs"
          :style="props.controllerStyle"
        />
        <ElRadioGroup
          v-else-if="props.type === 'button'"
          :placeholder="`请输入${props.label}`"
          v-model="localValue"
          v-bind="$attrs"
          :style="props.controllerStyle"
        >
          <ElRadioButton
            v-for="item of $attrs.options"
            :key="item.value"
            :label="item.value"
          >
            {{ item.label }}
          </ElRadioButton>
        </ElRadioGroup>
        <ElSelectV2
          v-if="props.type ==='select'"
          :placeholder="`请选择${props.label}`"
          v-model="localValue"
          @change="emit('change', $event)"
          v-bind="$attrs"
          :style="props.controllerStyle"
        />
        <ElDatePicker
          v-if="props.type === 'daterange'"
          type="daterange"
          placeholder="请选择日期"
          v-model="localValue"
          valueFormat="YYYY-MM-DD"
          v-bind="$attrs"
          :style="props.controllerStyle"
        />
      </slot>
    </div>
  </div>
</template>

<script setup>
import {computed, inject} from 'vue';

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
  },
  controllerStyle: {
    type: [Object, String]
  }
});

const model = inject('GlFilterBarModel');
const emit = defineEmits(['change']);
const localValue = computed({
  get() {
    return model[props.prop];
  },
  set(newValue) {
    model[props.prop] = newValue;
  }
});
</script>
