<template>
  <div>
    <b-navbar toggleable="lg" type="dark" variant="dark">

      <b-navbar-brand to="/">
        <b-input-group id="id-button">
          <b-input-group-prepend>
            <b-input-group-text>
              <img class="h-100" style="max-height: 1.5em" alt="Portal logo" src="../assets/logo.svg">
            </b-input-group-text>
          </b-input-group-prepend>
          <b-form-input class="portal-id-input text-monospace" readonly :value="$store.getters.short_portal_id"></b-form-input>
          <b-input-group-append>
            <b-input-group-text>
              {{ $store.state.meta.terminal_name}}
            </b-input-group-text>
          </b-input-group-append>
        </b-input-group>
      </b-navbar-brand>

      <b-nav-toggle target="nav-collapse"></b-nav-toggle>

      <b-collapse id="nav-collapse" is-nav>

        <b-navbar-nav id="nav-home">
          <b-nav-item to="/">Home</b-nav-item>
        </b-navbar-nav>

        <b-navbar-nav id="nav-terminals">
          <b-nav-item to="/terminals">Terminals</b-nav-item>
        </b-navbar-nav>

        <b-navbar-nav id="nav-apps">
          <b-nav-item to="/apps">Apps</b-nav-item>
        </b-navbar-nav>

        <b-navbar-nav id="nav-settings" class="ml-auto">
          <b-nav-item-dropdown right>
            <template #button-content>Settings</template>
            <b-dropdown-item @click="restart">Restart</b-dropdown-item>
            <b-dropdown-item @click="resetTour">Reset Tour</b-dropdown-item>
          </b-nav-item-dropdown>
        </b-navbar-nav>

      </b-collapse>
    </b-navbar>
  </div>
</template>

<script>
export default {
  name: "Navbar",

  methods: {
    restart() {
      this.$http.post('/core/protected/restart')
      .then(function () {
        console.log('restarting in 1 minute')
      })
      .catch(function (response) {
        console.log(`Error during restart: ${response}`)
      })
    },
    resetTour() {
      this.$http.delete('/core/protected/help/tours')
      .then(function () {
        this.$store.dispatch('query_tour_data');
      })
    },
  },
}
</script>

<style scoped>

.portal-id-input {
  width: 5em;
  cursor: pointer;
}

</style>