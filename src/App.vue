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

  mounted() {
    const component = this;
    this.$http.get('/core/identity_handler/public/meta/whoami')
        .then(function (response) {
          if (response.data.type === 'anonymous') {
            console.log('No token, redirecting to hello world');
            component.loading = false;
            component.$router.replace('/helloworld');

          } else if (response.data.type === 'terminal') {
            let meta = {};
            meta.terminal_id = response.data.id;
            meta.terminal_name = response.data.name;
            component.$http.get('/core/identity_handler/public/meta/whoareyou')
                .then(function (response) {
                  meta.portal_id = response.data.id;
                  component.$store.commit('set_meta', meta);
                  component.loading = false;
                });
          }
        });
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
