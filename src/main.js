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
import QrcodeVue from "qrcode.vue";
import moment from "moment/moment";

Vue.use(BootstrapVue)
Vue.use(BootstrapVueIcons)
Vue.use(VueTour)
Vue.component('qrcode-vue', QrcodeVue);
Vue.config.productionTip = false
Vue.prototype.$http = axios.create({
  headers: {
    "Content-type": "application/json"
  }
});

Vue.filter('uppercase', function (value) {
  return value.toUpperCase();
});

Vue.filter('formatDate', function (value) {
  return moment(String(value)).format('YYYY-MM-DD hh:mm');
})

Vue.filter('formatDateHumanize', function (value) {
  const now = new moment();
  const duration = moment.duration(moment(String(value)).diff(now));
  return duration.humanize(true);
})

Vue.filter('errorMessage', function (error) {
  return error.response.data.detail || error.response.data.error || error.response.data.message || error.response.data || error.message || error;
})

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
