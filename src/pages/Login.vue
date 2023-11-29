<template>
  <div class="bg flex justify-center flex-items-center bg-primary">
    <ElCard class="w-xl ">
      <template #header>
        <div class="text-center">登录</div>
      </template>
      <div class="p5" @keydown.enter="submit">
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
import { useUser } from '@/store';
import { ElInput } from 'element-plus';
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { addRouterForAuth } from '@/router';

const user = useUser();
const router = useRouter();
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
    user.login(rep.user, rep.auths);
    addRouterForAuth(
      rep.auths.map(item => item.key)
    );
    router.push('/home');
  } catch (error) {
    // todo
  }
}

</script>
<style lang="scss">
.bg {
  background-image: url('@/assets/login-bg.webp');
  background-size: cover;
  background-position: center;
  background-blend-mode: multiply;
}
</style>
