<script setup>
import { ref } from 'vue';
import {dateOrder} from '@/api';
import moment from 'moment';
import {ORDER_STATUS_PASS, ORDER_STATUS_WAIT} from '@/constant';
const date = ref(moment().format('YYYY-MM-DD'));
const show = ref(false);
const loading = ref(false);
const list = ref([]);
const showText = ref('');

const props = defineProps({
  modelValue: {
    type:    Array,
    default: () => []
  },
  disabled: {
    type:    Boolean,
    default: false
  }
});
const emit = defineEmits(['update:modelValue']);

const nameMap = ref({});

function change(checked, row) {
  const newValue = checked ? [...props.modelValue, row.id] : props.modelValue.filter(id => id !== row.id);
  nameMap.value[row.id] = [
    date.value.replace(/-/g,'/'),
    row.code,
    row.goodsName,
    row.spec,
    row.num + 'KG'
  ].join(' - ');
  showText.value = newValue.map(id => nameMap.value[id]).join(',');
  emit('update:modelValue', newValue);
}

function del(i) {
  const newValue = props.modelValue.filter((_, ind) => i !== ind);
  emit('update:modelValue', newValue);
  showText.value = newValue.map(id => nameMap.value[id]).join(',');
}
async function reload() {
  try{
    loading.value = true;
    list.value = await dateOrder(date.value, [ORDER_STATUS_WAIT, ORDER_STATUS_PASS]);
  } finally {
    loading.value = false;
  }
}
defineExpose({
  async setText(text) {
    showText.value = text;
  }
});
function disabledDate(date) {
  return date > new Date();
}

reload();
</script>

<template>
  <ElInput
    v-model="showText"
    readonly
    @click="show = true"
  />
  <ElDialog v-model="show" size="800px" title="请选择">
    <div>
      <ElDatePicker
        v-model="date"
        valueFormat="YYYY-MM-DD"
        :clearable="false"
        :disabledDate="disabledDate"
        @change="reload"
      />
    </div>
    <div class="m-t-2 m-b-2">
      <div class="flex gap-2">
        <span>已选：</span>
        <ElTag
          v-for="(id, i) in modelValue"
          :key="id"
          closable
          @close="del(i)"
        >
          {{ nameMap[id] }}
        </ElTag>
      </div>
      <ElTable :data="list" v-loading="loading">
        <ElTableColumn width="80px">
          <template v-slot="{ row }">
            <ElCheckbox :modelValue="modelValue.includes(row.id)" @update:modelValue="change($event, row)" />
          </template>
        </ElTableColumn>
        <ElTableColumn prop="code" label="客户代码" />
        <ElTableColumn prop="goodsName" label="成品" />
        <ElTableColumn prop="spec" label="规格(MM)" />
        <ElTableColumn prop="num" label="数量(KG)" />
      </ElTable>
    </div>
  </ElDialog>
</template>

<style scoped lang="scss">

</style>
