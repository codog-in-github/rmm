<template>
  <ElDialog v-model="visibleChanger" title="新增入库">
    <template v-if="localValue">
      <ElForm inline>
        <ElRow align="end">
          <ElCol>
            <ElFormItem label="货物类型">
              <ElSelect v-model="localValue.id">
                <ElOption 
                  v-for="item in goodsTypeList"
                  :label="item.label" 
                  :value="item.value"
                  :key="item.value"
                />
              </ElSelect>
            </ElFormItem>
          </ElCol>
        </ElRow>
      </ElForm>
    </template>
  </ElDialog>
</template>

<script setup>
import { GOODS_TYPE_MAP } from '@/constant';
import { map2array } from '@/helpers/utils';
import { computed } from '@vue/reactivity';
import { cloneDeep } from 'lodash';
import { ref, watch } from 'vue';

const goodsTypeList = map2array(GOODS_TYPE_MAP);
const props = defineProps({
  visible: {
    required: true,
    type:     Boolean
  },
  model: {
    required: true,
    type:     Object
  },
  type: {
    default: 'add'
  }
});
const emit = defineEmits(['update:visible']);
const visibleChanger = computed({
  get() {
    return props.visible;
  },
  set(val) {
    emit('update:visible', val);
  }
});
const localValue = ref(null);

watch(() => props.model, val => {
  localValue.value = cloneDeep(val);
});
</script>

<style>

</style>
