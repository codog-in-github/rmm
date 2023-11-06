import { createApp } from 'vue';
import App from './App.vue';
import store from './store';
import router from './router';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import 'uno.css';
import components from './components';

const app = createApp(App);

app.use(ElementPlus, {
  size: 'large',
});
app.use(store);
app.use(router);
app.use(components);
app.mount('#app');
