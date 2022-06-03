<template>
  <div>
    <b-navbar toggleable="lg" type="dark" variant="dark">

      <b-navbar-brand to="/">
        <PortalIdBadge :portal-id="$store.getters.short_portal_id"/>
      </b-navbar-brand>

      <b-nav-toggle target="nav-collapse"></b-nav-toggle>

      <b-collapse id="nav-collapse" is-nav>

        <b-navbar-nav id="nav-home">
          <b-nav-item v-if="$route.name==='Portal'"><b>
            <b-icon-house-fill></b-icon-house-fill> Home
          </b></b-nav-item>
          <b-nav-item v-else to="/">
            <b-icon-house-fill></b-icon-house-fill> Home
          </b-nav-item>
        </b-navbar-nav>

        <b-navbar-nav id="nav-apps">
          <b-nav-item v-if="$route.name==='Apps'"><b>
            <b-icon-grid-fill></b-icon-grid-fill> Apps
          </b></b-nav-item>
          <b-nav-item v-else to="/apps">
            <b-icon-grid-fill></b-icon-grid-fill> Apps
          </b-nav-item>
        </b-navbar-nav>

        <b-navbar-nav id="nav-devices">
          <b-nav-item v-if="$route.name==='Devices'"><b>
            <b-icon-laptop-fill></b-icon-laptop-fill> Devices
          </b></b-nav-item>
          <b-nav-item v-else to="/devices">
            <b-icon-laptop-fill></b-icon-laptop-fill> Devices
          </b-nav-item>
        </b-navbar-nav>

        <b-navbar-nav class="ml-auto">
          <b-nav-item href="https://feedback.getportal.org" target="_blank" id="nav-feedback">
            <b-icon-chat-right-text-fill></b-icon-chat-right-text-fill>
            Feedback
          </b-nav-item>
          <b-nav-item-dropdown right id="nav-settings">
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
import PortalIdBadge from "@/components/PortalIdBadge";

export default {
  name: "Navbar",
  components: {PortalIdBadge},
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

