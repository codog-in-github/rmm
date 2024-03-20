<template>
  <div class="bg flex justify-center flex-items-center bg-primary">
    <div class="login-card" @keydown.enter="submit">
      <div class="title">欢迎登陆</div>
      <ElInput v-model="formData.username" placeholder="请输入您的账号" />
      <ElInput
        class="m-t-2"
        type="password"
        v-model="formData.password"
        placeholder="请输入您的密码"
      />
      <div class="m-t-10">
        <GlAsyncButton
          class="block w-full"
          type="primary"
          :click="submit"
        >
          登录
        </GlAsyncButton>
        <div class="clear-both" />
      </div>
      <div class="footer">
        <img src="@/assets/logo.webp" class="m-r-2">
        泓贝再生资源回收有限公司
      </div>
    </div>
  </div>
</template>

<script setup>
import { login } from '@/api';
import { useUser } from '@/store';
import {ElInput, ElMessage} from 'element-plus';
import { reactive } from 'vue';
import { useRouter } from 'vue-router';
import {addRouterForAuth, clearRoutes, getAuthRouteKeys} from '@/router';

const user = useUser();
const router = useRouter();
const formData = reactive({
  username: '',
  password: ''
});

async function submit() {
  try {
    if(!formData.username || !formData.password) {
      ElMessage.error('账号和密码不能为空');
      return;
    }
    const rep = await login(formData.username, formData.password);
    user.login(rep.user, rep.auths);
    addRouterForAuth(
      rep.auths.map(item => item.key)
    );
    const routes = getAuthRouteKeys();
    if(routes.length > 0) {
      router.push({
        name: routes[0]
      });
    } else {
      ElMessage.error('您的账号暂无权限访问系统，请联系管理员');
    }
  } catch (error) {
    //
  }
}
clearRoutes();
</script>
<style lang="scss" scoped>
.bg {
  background-image: url('@/assets/bg.webp');
  background-size: cover;
  background-position: center;
}

.login-card {
  background-image: url('@/assets/login.png');
  background-position: top right;
  background-size: cover;
  background-origin: border-box;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  border-radius: 0.5em;
  width: 320px;
  padding: 40px;
  position: relative;
  left: 20%;

  .title{
    color: #303030;
    margin: 40px 0 80px;
    font-size: 22px;
  }
}

.footer{
  color: #8e8e8e;
  text-align: center;
  margin-top: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
}

:deep(.el-input__wrapper){
  background-color: #f3f5f9;
  box-shadow: none;
  color: #303030;
  padding-top: 10px;
  padding-bottom: 10px;
}
:deep(input::-webkit-input-placeholder){
  color: #9ea1a7;
}

.el-button.el-button--primary{
  background-color: #4082f2;
}
</style>
