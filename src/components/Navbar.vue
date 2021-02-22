<template>
  <div>
    <b-navbar toggleable="lg" type="dark" variant="dark">

      <b-navbar-brand to="/">
        <b-input-group class="portal-id-input">
          <b-input-group-prepend>
            <b-input-group-text>
              <img class="h-100" style="max-height: 1.5em" alt="Portal logo" src="../assets/logo.svg">
            </b-input-group-text>
          </b-input-group-prepend>
          <b-form-input class="text-monospace" readonly :value="$store.state.meta.portal_id.substring(0, 6)"></b-form-input>
        </b-input-group>
      </b-navbar-brand>

      <b-nav-toggle target="nav-collapse"></b-nav-toggle>

      <b-collapse id="nav-collapse" is-nav>

        <b-navbar-nav>
          <b-nav-item to="/terminals">Terminals</b-nav-item>
        </b-navbar-nav>

        <b-navbar-nav class="ml-auto">
          <b-nav-item-dropdown right>
            <template #button-content>Settings</template>
            <b-dropdown-item @click="restart">Restart</b-dropdown-item>
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
      this.$http.post('/core/identity_handler/protected/restart')
      .then(function () {
        console.log('restarting in 1 minute')
      })
      .catch(function (response) {
        console.log(`Error during restart: ${response}`)
      })
    }
  },
}
</script>

<style scoped>

.portal-id-input {
  width: 6em;
}

.portal-id-input input {
  cursor: pointer;
}

</style>