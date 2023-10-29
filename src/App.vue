<template>
  <div></div>
</template>

<script setup>
import { request } from '@/api';

request()
  .post('/user', {
    hello: 'world',
  })
  .send()
  .then(data => {
    console.log('data', data);
  });

</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
