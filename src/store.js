import Vuex from 'vuex'
import Vue from "vue";

Vue.use(Vuex)


const store = new Vuex.Store({
  state: {
    meta: {
      device_id: 'unknown',
      device_name: 'unknown',
      portal_id: 'unknown'
    },
    tours: [],
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
    tour_seen: (state) => (tourName) => {
      const t = state.tours.find(t => t.name === tourName);
      return (t && t.status === 'seen');
    }
  },
  mutations: {
    set_meta (state, meta) {
      state.meta.device_id = meta.device_id;
      state.meta.device_name = meta.device_name;
      state.meta.portal_id = meta.portal_id;
    },
    set_tours(state, tours) {
      state.tours = tours;
    },
  },
  actions: {
    async query_meta_data (context) {
      let meta = {}
      let whoami = await this._vm.$http.get('/core/public/meta/whoami')
      if (whoami.data.type !== 'anonymous') {
        meta.device_id = whoami.data.id;
        meta.device_name = whoami.data.name;
      }

      const whoareyou = await this._vm.$http.get('/core/public/meta/whoareyou')
      meta.portal_id = whoareyou.data.id;

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
  }
})

export default store