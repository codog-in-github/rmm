<template>
  <div class="flex justify-center flex-items-center">
    <ElCard class="w-xl">
      <template #header>
        <div class="text-center">登录</div>
      </template>
      <div class="p5">
        <ElForm
          labelWidth="5rem"
          :model="formData"
          :rules="rules"
          ref="formRef"
        >
          <ElFormItem label="用户名" prop="username">
            <ElInput v-model="formData.username" />
          </ElFormItem>
          <ElFormItem label="密码" class="m-t-10" prop="password">
            <ElInput type="password" v-model="formData.password" />
          </ElFormItem>
        </ElForm>
        <div class="m-t-10">
          <GlAsyncButton
            class="float-right"
            type="primary"
            :click="submit"
          >
            登录
          </GlAsyncButton>
          <div class="clear-both" />
        </div>
      </div>
    </ElCard>
  </div>
</template>

<script setup>
import { login } from '@/api';
import { ElInput } from 'element-plus';
import { reactive, ref } from 'vue';
const formRef = ref();
const formData = reactive({
  username: '',
  password: ''
});

const rules = {
  username: { required: true, message: '请填写用户名' },
  password: { required: true, message: '请填写密码' }
};

async function submit() {
  try {
    await formRef.value.validate();
    const rep = await login(formData.username, formData.password);
    console.log('rep', rep);
  } catch (error) {
    // todo
  }
}

</script>
