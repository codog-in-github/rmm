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
import { runLodopScripts } from './helpers/lodop';

envScripts[process.env.NODE_ENV].main();
ElDialog.props.closeOnClickModal = false;

const app = createApp(App);
app.use(ElementPlus);
Object.keys(icons).forEach(name => {
  app.component(name, icons[name]);
});
app.use(store);
app.use(router);
app.use(components);
runLodopScripts().then(() => {
  app.mount('#app');
});
