<template>
  <ElDialog v-model="visibleChanger">
    <ElForm />
  </ElDialog>
</template>

<script setup>
import { cloneDeep } from 'lodash';
import { computed, ref, watch } from 'vue';
const props = defineProps({
  visible: {
    type:    Boolean,
    default: false
  },
  model: {
    type: Object
  }
});
const localForm = ref(null);
const emit = defineEmits(['update:visible']);
const visibleChanger = computed({
  get() {
    return props.visible;
  },
  set(val) {
    emit('update:visible', val);
  }
});
watch(() => props.model, val => {
  localForm.value = cloneDeep(val);
});
</script>
