<template>
  <div>
    <GlAsyncButton :click="testAPI">点我</GlAsyncButton>
  </div>
</template>
<script setup>
import { request } from '@/api';

function testAPI() {
  request('/test').send().then(data => {
    console.log('data', data);
  }).catch(() => {
    //
  });
}
</script>
