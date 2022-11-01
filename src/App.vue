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
    loading: true
  }),

  async mounted() {
    const whoami = await this.$http.get('/core/public/meta/whoami')
    await this.$store.dispatch('query_meta_data');
    if (whoami.data.type === 'anonymous') {
      if (!['Pair', 'Welcome'].includes(this.$route.name)) {
        await this.$router.replace('/welcome');
      }
    } else {
      await this.$store.dispatch('query_tour_data');
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
    font-family: Avenir,Helvetica,Arial,sans-serif;
}

</style>
