<template>
  <ElDialog v-model="visibleChanger" title="新增入库">
    <template v-if="localValue">
      <ElForm inline labelWidth="6em">
        <ElRow>
          <ElCol :span="12">
            <ElFormItem label="货物类型">
              <ElSelectV2 :options="goodsTypeList" v-model="localValue.id" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="货物类型">
              <ElSelectV2 :options="goodsTypeList" v-model="localValue.id" />
            </ElFormItem>
          </ElCol>
        </ElRow>
        <ElRow>
          <ElCol :span="12">
            <ElFormItem label="货物类型">
              <ElSelectV2 :options="goodsTypeList" v-model="localValue.id" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="数量">
              <ElInputNumber controlsPosition="right" v-model="localValue.id" />
            </ElFormItem>
          </ElCol>
        </ElRow>
        <div>
          <ElFormItem label="备注">
            <ElInput type="textarea" v-model="localValue.id"  />
          </ElFormItem>
        </div>
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
