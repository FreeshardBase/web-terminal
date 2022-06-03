<template>
  <div>
    <div id="top-of-page"></div>
    <navbar></navbar>
    <b-container fluid>
      <b-row align-h="start" no-gutters>
        <b-col v-for="app in apps" :key="app.name" cols="3" lg="2" xl="1">
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
      apps: [],
      tourSteps: [
        {
          target: '#top-of-page',
          header: {
            title: 'Welcome to your Portal!'
          },
          content: 'This Portal is yours and only yours.</br>' +
              'It has a unique address that you can see right here in the address bar. Better bookmark it!'
        },
        {
          target: '.portal-id-badge',
          content: 'Every Portal has an ID. You can see it here. It is also part of its address.<br>' +
              'Think of the ID like a phone number. You can tell others, so they can reach you.'
        },
        {
          target: '#filebrowser',
          content: 'There are apps running on your Portal. Open them by clicking on their icon.'
        },
        {
          target: '#nav-apps',
          content: 'Install more apps from the app store. Also remove and manage your apps here.'
        },
        {
          target: '#nav-devices',
          content: 'To use your Portal from more than one device (like your smartphone, notebook, tablet, etc.), pair them here.'
        },
        {
          target: '#nav-settings',
          content: 'Access misc functions here: e.g. restart/update your Portal or look at this tour again.'
        },
        {
          target: '#nav-feedback',
          content: 'Finally, if something does not work or you have an idea for improvement, you can give us feedback here. We would love to hear from you!'
        }
      ]

    }
  },

  async mounted() {
    document.title = `Portal [${this.$store.getters.short_portal_id}] - Home`;
    this.apps = (await this.$http.get('/core/protected/apps')).data
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
