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
export default {
  data: () => ({
    loading: true,
    websocket: null,
  }),

  methods: {
    connectWS() {
      this.websocket = new WebSocket(`ws://${window.location.host}/core/protected/ws/updates`);
      this.websocket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        this.$store.dispatch('handle_websocket_message', message);
      };
      this.websocket.onerror = () => {
        this.websocket.close();
        this.websocket = null;
      }
      this.websocket.onclose = () => {
        this.$store.commit('websocket_disconnect');
        this.websocket = null;
        setTimeout(this.connectWS, 3000);
      };
      this.websocket.onopen = () => {
        this.$store.commit('websocket_connect');
      };
    },
  },

  async mounted() {
    const whoami = await this.$http.get('/core/public/meta/whoami')
    await this.$store.dispatch('query_meta_data');
    if (whoami.data.type === 'anonymous') {
      if (!['Pair', 'Welcome'].includes(this.$route.name)) {
        await this.$router.replace('/welcome');
      }
    } else {
      await this.$store.dispatch('query_tour_data');
      this.connectWS();
    }
    this.loading = false;
  }
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
