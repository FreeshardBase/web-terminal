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
  getters: {
    short_portal_id: state => {
      return state.meta.portal_id.substr(0, 6);
    },
    portal_domain: (state, getters) => {
      return `${getters.short_portal_id}.p.getportal.org`;
    },
    portal_href: (state, getters) => {
      return `https://${getters.portal_domain}`;
    },
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
      let whoami = await this._vm.$http.get('/core/public/meta/whoami')
      if (whoami.data.type !== 'anonymous') {
        meta.terminal_id = whoami.data.id;
        meta.terminal_name = whoami.data.name;
      }

      const whoareyou = await this._vm.$http.get('/core/public/meta/whoareyou')
      meta.portal_id = whoareyou.data.id;

      context.commit('set_meta', meta)
    }

  }
})

export default store