<template>
  <div id="app">
    <div v-if="loading">Loading...</div>
    <router-view v-else/>
  </div>
</template>

<script>
export default {
  data: () => ({
    loading: true
  }),

  async mounted() {
    const component = this;
    this.$http.get('/core/public/meta/whoami')
        .then(function (response) {
          if (response.data.type === 'anonymous') {
            component.$router.replace('/helloworld');
          }
          component.loading = false;
        });
    await this.$store.dispatch('query_initial_data')
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

</style>
