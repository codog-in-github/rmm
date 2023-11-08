import { onBeforeUnload } from '@/helpers';
import { createPinia, defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const useUser = defineStore('user', () => {
  const auths = ref([]);
  const user = ref({ username: '' });
  onBeforeUnload(function() {
    const cache = {
      user:  user.value,
      auths: auths.value
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
    auths.value = cache.auths;
    user.value = cache.user;
    localStorage.removeItem('user');
  }

  function logout() {
    user.value = {
      username: ''
    };
    auths.value = [];
  }

  /**
   * @param {User} newUser 
   * @param {Auth[]} newAuths 
   */
  function login(newUser, newAuths) {
    auths.value = newAuths;
    user.value = newUser;
  }

  const can = computed(() => {
    const authsMap = {};
    auths.value.forEach(item => {
      authsMap[item.key] = true;
    });
    return function(authKey) {
      return authsMap[authKey] ?? false;
    };
  });

  return {
    name: computed(() => {
      return user.value.username;
    }),
    logout,
    login,
    can
  };
});

export default createPinia();
