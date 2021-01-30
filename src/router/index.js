import Vue from 'vue'
import VueRouter from 'vue-router'
import HelloWorld from "@/views/HelloWorld";
import Home from "@/views/Home";
import Terminals from "@/views/Terminals";

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Portal',
    component: Home
  },
  {
    path: '/helloworld',
    name: 'Hello World',
    component: HelloWorld
  },
  {
    path: '/terminals',
    name: 'Terminals',
    component: Terminals
  },
]

const router = new VueRouter({
  routes
})

export default router
