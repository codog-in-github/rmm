import { createApp } from 'vue';
import App from './App.vue';
import store from './store';
import router from './router';
import ElementPlus from 'element-plus';
import * as icons from '@element-plus/icons-vue';
import components from './components';
import 'element-plus/dist/index.css';
import 'uno.css';

const app = createApp(App);
app.use(ElementPlus);
Object.keys(icons).forEach(name => {
  app.component(name, icons[name]);
});
app.use(store);
app.use(router);
app.use(components);
app.mount('#app');
