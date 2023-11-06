import {
  createPinia,
  defineStore 
} from 'pinia';
import {
  computed, 
  reactive, 
  ref 
} from 'vue';

export const useUser = defineStore('user', () => {
  const user = ref({
    username: ''
  });
  const auth = ref([]);
  function logout () {
    user.value = {
      username: ''
    };
    auth.value = [];
  }
  function login (loginUser, ) {
    auth;
  }
  return {
    name: computed(() => {
      return auth.value.username;
    }),
    logout
  };
});


export default createPinia();
