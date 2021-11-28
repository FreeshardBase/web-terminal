import Vue from 'vue'
import App from './App.vue'
import { BootstrapVue, BootstrapVueIcons } from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import router from './router'
import store from './store'
import axios from "axios";


Vue.use(BootstrapVue)
Vue.use(BootstrapVueIcons)
Vue.config.productionTip = false
Vue.prototype.$http = axios.create({
  headers: {
    "Content-type": "application/json"
  }
});


new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
