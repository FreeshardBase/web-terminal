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
            identity: {
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
        disk_usage: {
            total_gb: 0,
            free_gb: 0,
            disk_space_low: false,
            disk_space_warning: false,
        }
    },
    getters: {
        short_shard_id: state => {
            return state.meta.identity.id.substr(0, 6);
        },
        shard_href: (state) => {
            return `https://${state.meta.identity.domain}`;
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
        },
        set_disk_usage(state, disk_usage) {
            state.disk_usage = {...disk_usage, disk_space_warning: disk_usage.free_gb < 5};
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
            meta.identity = whoareyou.data;

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
        async force_query_profile_data(context) {
            let profile = await this._vm.$http.get('/core/protected/management/profile?refresh=true');
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
        async query_disk_usage(context) {
            const response = await this._vm.$http.get('/core/protected/stats/disk');
            context.commit('set_disk_usage', response.data);
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
