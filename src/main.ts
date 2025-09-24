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

const vuetify = createVuetify({
  icons:{
    defaultSet: 'mdi',
  },
  components,
  directives,
})
const app = createApp(App);
useAuth().initAuth();
app.component('IconButton', IconButton);
app.use(router).use(vuetify).mount('#app')

