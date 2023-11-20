import { createApp } from 'vue';
import App from './App.vue';
import store from './store';
import router from './router';
import * as envScripts from '@/envScripts';
import ElementPlus, { ElDialog } from 'element-plus';
import * as icons from '@element-plus/icons-vue';
import components from './components';
import 'element-plus/dist/index.css';
import 'uno.css';
envScripts[process.env.NODE_ENV].main();
const app = createApp(App);
app.use(ElementPlus);
ElDialog.props.closeOnClickModal = false;
Object.keys(icons).forEach(name => {
  app.component(name, icons[name]);
});
app.use(store);
app.use(router);
app.use(components);
app.mount('#app');
