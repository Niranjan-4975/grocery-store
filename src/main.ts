import { createApp } from 'vue'
import 'vuetify/styles'
import "./assets/global.css"
import App from './App.vue'
import router from "./router";
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'
import '@mdi/font/css/materialdesignicons.css'
import IconButton from "./components/common/IconButton.vue";
import { useAuth } from './composables/useAuth';
import { createPinia } from 'pinia';
import i18n from './i18n';

const vuetify = createVuetify({
  icons:{
    defaultSet: 'mdi',
  },
  components,
  directives,
})
const app = createApp(App);
const pinia = createPinia();
app.component('IconButton', IconButton);
app.use(pinia).use(router).use(vuetify).use(i18n).mount('#app')
useAuth().initAuth();

