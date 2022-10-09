import Vue from 'vue'
import VueRouter from 'vue-router'
import HelloWorld from "@/views/HelloWorld";
import Home from "@/views/Home";
import Apps from "@/views/Apps";
import Devices from "@/views/Devices";
import Profile from "@/views/Profile";

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
    path: '/devices',
    name: 'Devices',
    component: Devices
  },
  {
    path: '/apps',
    name: 'Apps',
    component: Apps
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile
  },
]

const router = new VueRouter({
  routes
})

export default router
