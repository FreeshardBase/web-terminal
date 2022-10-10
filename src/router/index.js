import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from "@/views/Home";
import Apps from "@/views/Apps";
import Devices from "@/views/Devices";
import Profile from "@/views/Profile";
import Pair from "@/views/Pair";
import Welcome from "@/views/Welcome";

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Portal',
    component: Home
  },
  {
    path: '/welcome',
    name: 'Welcome',
    component: Welcome
  },
  {
    path: '/pair',
    name: 'Pair',
    component: Pair
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
