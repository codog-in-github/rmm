<template>
  <ElDialog title="打印设置" v-model="modelValue" width="400px">
    <ElAlert
      v-if="!canPrint"
      type="warning"
      :closable="false"
      class="m-b-2"
    >
      <span>请先安装LODOP插件</span>
      <ElLink target="_blank" type="primary" href="https://www.lodop.net/download.html">下载地址</ElLink>
    </ElAlert>
    <ElForm labelWidth="80px">
      <ElFormItem label="打印机">
        <ElSelectV2
          class="w-full"
          v-model="value.printerIndex"
          :options="printers"
          @change="printerChange"
        />
      </ElFormItem>
      <!-- <ElFormItem label="纸张大小">
        <ElSelectV2
          class="w-full"
          v-model="value.paperSizeIndex"
          :options="sizes"
        />
      </ElFormItem> -->
    </ElForm>
    <template v-slot:footer>
      <ElButton type="primary" @click="submit">保存</ElButton>
      <ElButton @click="modelValue = false">取消</ElButton>
    </template>
  </ElDialog>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { cloneDeep } from 'lodash';

const canPrint = Boolean(LODOP);
const props = defineProps({
  visible: {
    type:    Boolean,
    default: false
  },
  model: {
    type:    Object,
    default: null
  }
});
const value = ref(cloneDeep(props.model));
const sizes = ref(getPaperSizes(props.model?.printerIndex));
const modelValue = computed({
  get() {
    return props.visible;
  },
  set(val) {
    emit('update:visible', val);
  }
});
const emit = defineEmits(['update:visible', 'submit']);
watch(() => props.model, (val) => {
  sizes.value = getPaperSizes(val.printerIndex);
  value.value = cloneDeep(val);
});

const printers = ref((function(){
  const printers = [];
  if(canPrint) {
    const printerCount = LODOP.GET_PRINTER_COUNT();
    for(let i = 0; i < printerCount; i++){
      printers.push({
        label: LODOP.GET_PRINTER_NAME(i),
        value: i
      });
    }
  }
  return printers;
})());


function getPaperSizes(printerIndex) {
  if(!printerIndex || printerIndex === 0) {
    return [];
  }
  const list = LODOP.GET_PAGESIZES_LIST(printerIndex, '\n')?.split('\n');
  if(!list || list.length < 1 || (list.length === 1 && list[0] === '')) {
    return [];
  }
  return list.map((name, i) => ({
    label: name,
    value: i
  }));
}

function printerChange(index) {
  sizes.value = getPaperSizes(index);
  value.value.paperSizeIndex = null;
}

function submit() {
  emit('submit', value.value);
  modelValue.value = false;
}
</script>

<style lang="scss" scoped>
::v-deep .el-alert__description{
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
</style>
