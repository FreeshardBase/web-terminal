import Vuex from 'vuex'
import Vue from "vue";

Vue.use(Vuex)


const store = new Vuex.Store({
  state: {
    websocket: {
      isConnected: false,
      lastHeartbeat: null,
    },
    meta: {
      is_anonymous: true,
      device_id: 'unknown',
      device_name: 'unknown',
      portal_identity: {
        id: '',
        name: '',
        email: '',
        description: '',
        public_key_pem: '',
        domain: '',
      }
    },
    terminals: [],
    tours: [],
  },
  getters: {
    short_portal_id: state => {
      return state.meta.portal_identity.id.substr(0, 6);
    },
    portal_href: (state) => {
      return `https://${state.meta.portal_identity.domain}`;
    },
    tour_seen: (state) => (tourName) => {
      const t = state.tours.find(t => t.name === tourName);
      return (t && t.status === 'seen');
    }
  },
  mutations: {
    set_meta (state, meta) {
      for (const [k, v] of Object.entries(meta)) {
        state.meta[k] = v;
      }
    },
    set_tours(state, tours) {
      state.tours = tours;
    },
    websocket_connect(state) {
      state.websocket.isConnected = true;
    },
    websocket_disconnect(state) {
      state.websocket.isConnected = false;
    },
    set_terminals(state, terminals) {
        state.terminals = terminals;
    }
  },
  actions: {
    async query_meta_data (context) {
      let meta = {}
      let whoami = await this._vm.$http.get('/core/public/meta/whoami')
      if (whoami.data.type !== 'anonymous') {
        meta.is_anonymous = false;
        meta.device_id = whoami.data.id;
        meta.device_name = whoami.data.name;
      }

      const whoareyou = await this._vm.$http.get('/core/public/meta/whoareyou')
      meta.portal_identity = whoareyou.data;

      context.commit('set_meta', meta)
    },
    async query_tour_data(context) {
      let tours = await this._vm.$http.get('/core/protected/help/tours')
      context.commit('set_tours', tours.data)
    },
    async mark_tour_as_seen(context, tourName) {
      await this._vm.$http.put('/core/protected/help/tours', {name: tourName, status: 'seen'})
      await store.dispatch('query_tour_data');
    },
    async handle_websocket_message(context, message) {
      if (message.message_type === 'terminals') {
        context.commit('set_terminals', message.message);
      }
    },
    async refresh_terminals(context) {
      const response = await this._vm.$http.get('/core/protected/terminals');
      context.commit("set_terminals", response.data);
    },
  }
})

export default store
