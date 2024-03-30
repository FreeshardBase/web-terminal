<template>
  <div id="app">
    <div v-if="loading" id="portal-load-splash">
      <img src="./assets/logo.svg">
      <h1>Loading</h1>
    </div>
    <router-view v-else/>
  </div>
</template>

<script>
import {EventBus} from "@/event-bus";
import {toastMixin} from "@/mixins";

export default {
  data: () => ({
    loading: true,
    websocket: null,
  }),

  mixins: [toastMixin],

  methods: {
    connectWS() {
      const wsProtocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
      this.websocket = new WebSocket(`${wsProtocol}//${window.location.host}/core/protected/ws/updates`);
      this.websocket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        EventBus.$emit(message.message_type, message.message);
        this.$store.dispatch('handle_websocket_message', message);
      };
      this.websocket.onerror = () => {
        this.websocket.close();
        this.websocket = null;
      }
      this.websocket.onclose = () => {
        this.$store.commit('websocket_disconnect');
        this.websocket = null;
      };
      this.websocket.onopen = () => {
        this.$store.commit('websocket_connect');
      };
    },
  },

  async beforeMount() {
    await Promise.all([
      this.$store.dispatch('query_meta_data'),
      this.$store.dispatch('query_tour_data'),
      this.$store.dispatch('query_profile_data'),
      this.$store.dispatch('query_ui_version'),
    ]);

    if (this.$store.state.meta.is_anonymous) {
      if (!['Pair', 'Welcome'].includes(this.$route.name)) {
        await this.$router.replace('/welcome');
      }
    } else {
      this.connectWS();
      setInterval(() => {
        if (!this.websocket) {
          this.connectWS();
        }
      }, 1000 * 5);
    }

    setInterval(() => {
      this.$store.dispatch('query_ui_version');
    }, 1000 * 60 * 5);

    this.loading = false;

    EventBus.$on('app_install_error', (message) => {
      this.toastError(`Failed to install app ${message.name}`, message.error);
    });
  },
}
</script>


<style>

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

#portal-load-splash {
  position: absolute;
  top: 50%;
  left: 50%;
  margin-right: -50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

#portal-load-splash img {
  height: 7em;
  margin: 3em;
}

#portal-load-splash h1 {
  font-family: Avenir, Helvetica, Arial, sans-serif;
}

/* Deactivate elements that are highlighted during tour, see: https://github.com/pulsardev/vue-tour/issues/254 */
.v-tour__target--highlighted {
  pointer-events: none !important;
}

</style>
