import { onBeforeUnload } from '@/helpers';
import { addRouterForAuth } from '@/router';
import { createPinia, defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const useUser = defineStore('user', () => {
  const auth = ref([]);
  const user = ref({ username: '' });
  onBeforeUnload(function() {
    const cache = {
      user: user.value,
      auth: auth.value
    };
    localStorage.setItem(
      'user',
      JSON.stringify(cache)
    );
  });
  const cache = JSON.parse(
    localStorage.getItem('user')
  );
  if(cache) {
    auth.value = cache.auth;
    user.value = cache.user;
    localStorage.removeItem('user');
  }
  function logout() {
    user.value = {
      username: ''
    };
    auth.value = [];
  }

  function login(newUser, newAuth) {
    user.value = newUser;
    auth.value = newAuth;
  }

  return {
    name: computed(() => {
      return auth.value.username;
    }),
    logout,
    login
  };
});

export default createPinia();
