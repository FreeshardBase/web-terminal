import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from "@/views/Home";
import Apps from "@/views/Apps";
import Terminals from "@/views/Terminals.vue";
import Pair from "@/views/Pair";
import Welcome from "@/views/Welcome";
import Peers from "@/views/Peers";
import Settings from "@/views/Settings.vue";
import Restart from "@/views/Restart.vue";
import Public from "@/views/Public.vue";

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
    path: '/terminals',
    name: 'Terminals',
    component: Terminals
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
    path: '/public',
    name: 'Public',
    component: Public
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
