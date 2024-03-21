<script setup>
import {computed, nextTick, ref, watch} from 'vue';
import {cloneDeep, debounce} from 'lodash';
import {customerSave} from '@/api';
import {ElMessage} from 'element-plus';
const loading = ref(false);
const elForm = ref(null);
const emptyFrom = function() {
  return {
    id:   null,
    name: '',
    tel:  '',
    code: ''
  };
};
const form = ref(emptyFrom());
const props = defineProps({
  show: {
    type:     Boolean,
    required: true
  }
});
const emit = defineEmits(['update:show','success']);
const modelShow = computed({
  get() {
    return props.show;
  },
  set(val) {
    emit('update:show', val);
  }
});

watch(() => props.show, val => {
  if(val) {
    form.value = emptyFrom();
    nextTick(() => {
      elForm.value.clearValidate();
    });
  }
});
const rules = {
  name: {
    required: true,
    message:  '请输入客户名称',
    trigger:  'blur'
  },
  code: {
    required: true,
    message:  '请输入客户代码',
    trigger:  'blur'
  },
  tel: {
    pattern: /^\d+$/,
    message: '请输入正确的输入联系电话',
    trigger: 'blur'
  }
};
const addClick = debounce(async function() {
  loading.value = true;
  try{
    await elForm.value.validate();
    const { id } = await customerSave(form.value);
    if(form.value.id) {
      ElMessage.success('修改成功');
    } else {
      ElMessage.success('添加成功');
    }
    modelShow.value = false;
    emit('success', {
      ...form.value,
      id
    });
  } finally {
    loading.value = false;
  }
}, 200, { leading: true, trailing: false });

defineExpose({
  edit(data) {
    modelShow.value = true;
    nextTick(() => {
      form.value = cloneDeep(data);
    });
  }
});

</script>

<template>
  <ElDialog :title="form.id ? '编辑客户' : '新增客户'" v-model="modelShow">
    <ElForm
      ref="elForm"
      :model="form"
      :rules="rules"
      labelWidth="120px"
    >
      <ElFormItem label="客户名称" prop="name">
        <ElInput v-model="form.name" />
      </ElFormItem>
      <ElFormItem label="客户代码" prop="code">
        <ElInput v-model="form.code" />
      </ElFormItem>
      <ElFormItem label="联系电话" prop="tel">
        <ElInput v-model="form.tel" />
      </ElFormItem>
    </ElForm>
    <template #footer>
      <ElButton @click="modelShow = false">取消</ElButton>
      <ElButton
        :loading="loading"
        type="primary"
        @click="addClick"
      >
        添加
      </ElButton>
    </template>
  </ElDialog>
</template>

<style scoped lang="scss">

</style>
