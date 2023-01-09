import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from "@/views/Home";
import Apps from "@/views/Apps";
import Devices from "@/views/Devices";
import Profile from "@/views/Profile";
import Pair from "@/views/Pair";
import Welcome from "@/views/Welcome";
import Peers from "@/views/Peers";
import Settings from "@/views/Settings.vue";
import Restart from "@/views/Restart.vue";

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
    path: '/peers',
    name: 'Peers',
    component: Peers
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings
  },
  {
    path: '/restart',
    name: "Restart",
    component: Restart
  }
]

const router = new VueRouter({
  routes
})

export default router
