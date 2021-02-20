import Vue from 'vue'
import App from './App.vue'
import BootstrapVue from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import  Axios  from  'axios'
import router from './router'
import store from './store'


Vue.use(BootstrapVue)
Vue.config.productionTip = false
Vue.prototype.$http  =  Axios;


new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
