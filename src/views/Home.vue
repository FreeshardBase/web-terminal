<template>
  <div>
    <div id="top-of-page"></div>
    <navbar></navbar>
    <b-container fluid>
      <b-row align-h="start" no-gutters>
        <b-col v-for="app in $store.state.apps" :key="app.name" cols="3" lg="2" xl="1">
          <AppIcon :app="app"></AppIcon>
        </b-col>
      </b-row>
    </b-container>
    <v-tour name="HomeTour" :steps="tourSteps" :options="{highlight: true}"></v-tour>
  </div>
</template>

<script>
import navbar from "@/components/Navbar";
import AppIcon from "@/components/AppIcon";

export default {
  name: 'Home',
  components: {AppIcon, navbar},
  data: function () {
    return {
      tourSteps: [
        {
          target: '#top-of-page',
          header: {
            title: 'Welcome to your Portal!'
          },
          content: `Welcome ${this.$store.state.meta.portal_identity.name} to your personal Portal!<br>` +
              'It has a unique address that you can see right here in the address bar. Better bookmark it!'
        },
        {
          target: '.portal-id-badge',
          content: 'Every Portal has an ID. You can see it here. It is also part of its address.<br>' +
              'Think of the ID like your Portal\'s phone number.'
        },
        {
          target: '#nav-devices',
          content: 'Your first step should be pairing a second device to your Portal, if you have it at hand.'
        },
      ]

    }
  },

  async mounted() {
    document.title = `Portal [${this.$store.getters.short_portal_id}] - Home`;
    await this.$store.dispatch("refresh_apps")
    if (!this.$store.getters.tour_seen('home')) {
      this.$tours['HomeTour'].start();
      await this.$store.dispatch('mark_tour_as_seen', 'home');
    }
  }
}
</script>

<style scoped>
#top-of-page {
  position: absolute;
  left: 0;
  right: 50%;
}
</style>
