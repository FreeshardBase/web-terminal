import Vue from 'vue'
import App from './App.vue'
import { BootstrapVue, BootstrapVueIcons } from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import router from './router'
import store from './store'
import axios from "axios";
import VueTour from 'vue-tour';
import 'vue-tour/dist/vue-tour.css'
import './assets/css/main.css'

Vue.use(BootstrapVue)
Vue.use(BootstrapVueIcons)
Vue.use(VueTour)
Vue.config.productionTip = false
Vue.prototype.$http = axios.create({
  headers: {
    "Content-type": "application/json"
  }
});

Vue.filter('titlecase', function (value) {
  return value.toLowerCase().replace(/(?:^|\s|-)\S/g, x => x.toUpperCase())
});

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
