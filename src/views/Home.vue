<template>
  <div>
    <navbar></navbar>
    <b-container fluid>
      <b-row align-h="start">
        <b-col v-for="app in apps" :key="app.name" cols="6" md="2">
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
          target: '#id-button',
          content: 'Welcome to your Portal! This is your Portal\'s ID and the name of the Terminal you are using right now. Think of the ID like a phone number. You can tell others, so they can reach you.'
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
          target: '#nav-terminals',
          content: 'To use your Portal from more than one device, pair them here. We call them terminals.'
        },
        {
          target: '#nav-settings',
          content: 'Access misc functions here: e.g. restart/update your Portal.'
        }
      ]

    }
  },

  async mounted() {
    await this.$store.dispatch('query_meta');
    this.apps = (await this.$http.get('/core/protected/apps')).data
    this.$tours['HomeTour'].start();
  }
}
</script>

<style scoped>
</style>
