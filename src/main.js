import Vue from 'vue'
import App from './App.vue'
import BootstrapVue from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import  Axios  from  'axios'


Vue.use(BootstrapVue)
Vue.config.productionTip = false
Vue.prototype.$http  =  Axios;


const  accessToken  =  localStorage.getItem('access_token')
if (accessToken) {
    Vue.prototype.$http.defaults.headers.common['Authorization'] =  accessToken
}


new Vue({
  render: h => h(App),
}).$mount('#app')
