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
        version: null,
        profile: null,
        apps: [],
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
        set_meta(state, meta) {
            for (const [k, v] of Object.entries(meta)) {
                state.meta[k] = v;
            }
        },
        set_version(state, version) {
            state.version = version;
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
        set_apps(state, apps) {
            state.apps = apps;
        },
        set_terminals(state, terminals) {
            state.terminals = terminals;
        },
        set_profile(state, profile) {
            state.profile = profile;
        }
    },
    actions: {
        async query_meta_data(context) {
            let meta = {}
            const [whoami, whoareyou] = await Promise.all([
                this._vm.$http.get('/core/public/meta/whoami'),
                this._vm.$http.get('/core/public/meta/whoareyou')
            ]);
            if (whoami.data.type !== 'anonymous') {
                meta.is_anonymous = false;
                meta.device_id = whoami.data.id;
                meta.device_name = whoami.data.name;
            }
            meta.portal_identity = whoareyou.data;

            context.commit('set_meta', meta)
        },

        async query_ui_version(context) {
            try {
                let response = await this._vm.$http.get(`/version.json?timestamp=${new Date().getTime()}`);
                context.commit('set_version', response.data.version);
            } catch (e) {
                console.error('Failed to load version.json');
            }
        },

        async query_profile_data(context) {
            let profile = await this._vm.$http.get('/core/protected/management/profile');
            context.commit('set_profile', profile.data);
        },
        async query_tour_data(context) {
            try {
                const response = await this._vm.$http.get('/core/protected/help/tours')
            context.commit('set_tours', response.data)
            } catch (e) {
                console.error('Failed to load tours');
            }
        },
        async mark_tour_as_seen(context, tourName) {
            await this._vm.$http.put('/core/protected/help/tours', {name: tourName, status: 'seen'})
            await store.dispatch('query_tour_data');
        },
        async handle_websocket_message(context, message) {
            if (message.message_type === 'terminals_update') {
                context.commit('set_terminals', message.message);
            }
            if (message.message_type === 'apps_update') {
                context.commit('set_apps', message.message);
            }
        },
        async refresh_terminals(context) {
            const response = await this._vm.$http.get('/core/protected/terminals');
            context.commit("set_terminals", response.data);
        },
        async refresh_apps(context) {
            const response = await this._vm.$http.get('/core/protected/apps');
            context.commit("set_apps", response.data);
        }
    }
})

export default store
