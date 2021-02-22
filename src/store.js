import Vuex from 'vuex'
import Vue from "vue";

Vue.use(Vuex)


const store = new Vuex.Store({
  state: {
    meta: {
      terminal_id: 'unknown',
      terminal_name: 'unknown',
      portal_id: 'unknown'
    }
  },
  mutations: {
    set_meta (state, meta) {
      state.meta.terminal_id = meta.terminal_id;
      state.meta.terminal_name = meta.terminal_name;
      state.meta.portal_id = meta.portal_id;
    }
  },
  actions: {
    async query_meta (context) {
      let meta = {}
      let whoami = await this._vm.$http.get('/core/identity_handler/public/meta/whoami')
      if (whoami.data.type !== 'anonymous') {
        meta.terminal_id = whoami.data.id;
        meta.terminal_name = whoami.data.name;
      }

      const whoareyou = await this._vm.$http.get('/core/identity_handler/public/meta/whoareyou')
      meta.portal_id = whoareyou.data.id;

      context.commit('set_meta', meta)
    }

  }
})

export default store