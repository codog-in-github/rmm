import { createPinia, defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const useUser = defineStore('user', () => {
  const auth = ref([]);
  const user = ref({
    username: ''
  });

  function logout() {
    user.value = {
      username: ''
    };
    auth.value = [];
  }

  function login(user, auth) {
    auth;
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
