<script setup>
defineProps({
  title: {
    type:    String,
    default: ''
  }
});
</script>

<template>
  <div class="gl-border-card">
    <span class="gl-border-card__title">工艺说明</span>
    <slot />
  </div>
</template>

<style scoped lang="scss">

</style>
