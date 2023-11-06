<template>
  <ElButton v-bind="$attrs" :loading="loading" @click="onClick">
    <slot />
  </ElButton>
</template>

<script setup>
import { isPromiseLike } from '@/helpers';
import { ref, defineProps } from 'vue';

const loading = ref(false);
const props = defineProps({
  click: {
    type:     Function,
    required: true
  }
});

function onClick(e) {
  const re = props.click(e);
  if(isPromiseLike(re)) {
    loading.value = true;
    re.finally(() => {
      loading.value = false;
    });
  }
}

</script>
