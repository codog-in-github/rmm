<!--
- 不加if 空插槽会搞出一个空的span
-->
<template>
  <ElButton
    v-if="$slots.default"
    v-bind="$attrs"
    :loading="loading"
    @click="onClick"
  >
    <slot />
  </ElButton>
  <ElButton
    v-else
    v-bind="$attrs"
    :loading="loading"
    @click="onClick"
  />
</template>

<script setup>
import { isPromiseLike } from '@/helpers';
import { debounce } from 'lodash';
import { ref } from 'vue';

const loading = ref(false);

const props = defineProps({
  click: {
    type:     Function,
    required: true
  }
});

const onClick = debounce(
  function onClick(e) {
    const re = props.click(e);
    if(isPromiseLike(re)) {
      loading.value = true;
      re.finally(() => {
        loading.value = false;
      });
    }
  },
  200
);

</script>
