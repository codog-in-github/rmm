<script setup>
import {computed, ref} from 'vue';
const inputRef = ref(null);
const props = defineProps({
  modelValue: {
    type:    [String, Number],
    default: ''
  },
  total: {
    type:    Number,
    default: 0
  }
});
const emit = defineEmits(['update:modelValue']);

const showText = computed(() => {
  return props.modelValue + ' (' + ((props.total - props.modelValue) / props.total * 100).toFixed(0) + '%)' ;
});
function fetchSuggestions(_, cb) {
  const options = [];
  for(let i = 0; i <= 100; i++) {
    options.push({ value: i, label: i + '%' });
  }
  cb(options);
}
function onSelect(item) {
  emit('update:modelValue', Number((props.total - item.value * props.total / 100).toFixed(2)));
  inputRef.value.blur();
}
</script>

<template>
  <ElAutocomplete
    ref="inputRef"
    :value="showText"
    :fetchSuggestions="fetchSuggestions"
    @select="onSelect"
    v-bind="$attrs"
  />
</template>

<style scoped lang="scss">

</style>
