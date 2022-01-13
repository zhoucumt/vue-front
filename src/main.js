import { createApp } from 'vue';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import '@/utils/rem';
import App from './App.vue';
import router from './router';
import store from './store';

const app = createApp(App);
app.config.devtools = true;

app.use(store).use(router).use(ElementPlus).mount('#app');
