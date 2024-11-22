<script setup>
import {nextTick, ref} from 'vue';
import {getOptions, request} from '@/api';
import {makeRequest} from '@/api/helpers';
import {ElMessage, ElMessageBox} from 'element-plus';
import GlAsyncButton from "@/components/GlAsyncButton.vue";

const visible = ref(false);
const formData = ref({});
const formRef = ref(null);
const fileInputRef = ref(null);
const options = ref({
  customer: [],
  raw:      []
});

getOptions('customer,raw').then(res => {
  options.value = res;
});

const rules = {
  goods_id: [
    { required: true, message: '请选择产品', trigger: 'blur' }
  ]
};

const emit = defineEmits(['success']);


defineExpose({
  show() {
    visible.value = true;
    formData.value = {};
  }
});

function onClose() {
  visible.value = false;
}
async function onSubmit() {
  const params = new FormData();
  params.append('customer_id', formData.value.customer_id);
  params.append('goods_id', formData.value.goods_id);
  params.append('data_file', fileInputRef.value.input.files[0]);
  const { count, logs } = await request('/order/import').form(params).send();
  const logHtml = logs.join('<br/>');
  visible.value = false;
  emit('success');
  ElMessageBox.alert(`上传成功，共导入${count}条数据<br /> ${logHtml}`, '提示', {
    dangerouslyUseHTMLString: true
  });
}
</script>

<template>
  <ElDialog title="上传文件" v-model="visible" width="500px">
    <ElForm
      ref="formRef"
      :model="formData"
      :rules="rules"
      labelWidth="80px"
      class="pr-4 pt-2"
    >
      <ElFormItem label="客户名称" prop="customer_id">
        <ElSelectV2
          v-model="formData.customer_id"
          filterable
          :options="options.customer"
        />
      </ElFormItem>
      <ElFormItem label="产品名称" prop="goods_id">
        <ElSelectV2 v-model="formData.goods_id" :options="options.raw" />
      </ElFormItem>
      <ElFormItem label="文件上传" prop="data_file" required>
        <div class="flex items-center w-full">
          <ElInput
            ref="fileInputRef"
            type="file"
            v-model="formData.data_file"
          />
          <ElLink href="/导入模板.xlsx" type="primary" class="flex-shrink-0 ml-2 w-16">模板下载</ElLink>
        </div>
      </ElFormItem>
    </ElForm>
    <template #footer>
      <ElButton @click="onClose">取消</ElButton>
      <GlAsyncButton type="primary" :click="onSubmit">确定</GlAsyncButton>
    </template>
  </ElDialog>
</template>

<style scoped lang="scss">

</style>
