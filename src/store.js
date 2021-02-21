import Vuex from 'vuex'
import Vue from "vue";

Vue.use(Vuex)


const store = new Vuex.Store({
  state: {
    meta: {
      was_set: false,
      terminal_id: 'unknown',
      terminal_name: 'unknown',
      portal_id: 'unknown'
    }
  },
  mutations: {
    set_meta (state, meta) {
      if (state.meta.was_set) {
        throw 'meta has already been set'
      } else {
        state.meta.terminal_id = meta.terminal_id;
        state.meta.terminal_name = meta.terminal_name;
        state.meta.portal_id = meta.portal_id;
        state.meta.was_set = true;
      }
    }
  }
})

export default store