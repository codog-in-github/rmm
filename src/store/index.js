import { createPinia, defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const useUser = defineStore('user', () => {
  const auths = ref([]);
  
  const user = ref({
    username: ''
  });

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

  return {
    name: computed(() => {
      return auths.value.username;
    }),
    logout,
    login
  };
});

export default createPinia();
