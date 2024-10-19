<script setup>
import {computed, h} from 'vue';
import {specParse} from '@/helpers';

const props = defineProps({
  spec:        String,
  placeholder: String
});

const Sup = ({ content }) => {
  return (
    h('div', [
      h('span', { style: { display: 'inline-block', width: '1em', textAlign: 'center' } }, content[0]),
      h('span', content[1])
    ])
  );
};

const spec = computed(() => {
  const spec = specParse(props.spec);
  spec.r[0] = spec.r[0] ? '孔' + spec.r[0] : '';
  return [spec.R, spec.w, spec.r, spec.l]
    .filter(item => item[0])
    .map(item => {
      const value = [item[0]];
      let sup = [];
      if (item[1]) {
        sup.push(['+', item[1]]);
      }
      if (item[2]) {
        sup.push(['-', item[2]]);
      }
      if (sup.length) {
        value.push(sup);
      }
      return value;
    });
});

</script>

<template>
  <div class="inline-flex gap-1 items-end text" :style="{ lineHeight: '1' }">
    <template v-if="spec && spec.length">
      <template v-for="(value, index) in spec" :key="index">
        <div v-if="index">*</div>
        <div class="flex items-end">
          <div>{{ value[0] }}</div>
          <div v-if="value[1]" class="relative" :style="{ fontSize: '0.5em', bottom: '0.6em' }">
            <Sup :content="value[1][0]" />
            <Sup v-if="value[1][1]" :content="value[1][1]" />
          </div>
        </div>
      </template>
    </template>
    <span v-else>{{ placeholder }}</span>
  </div>
</template>

<style scoped lang="scss">
</style>
