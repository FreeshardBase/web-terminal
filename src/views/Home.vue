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
    }
  },

  async mounted() {
    await this.$store.dispatch('query_meta');
    this.apps = (await this.$http.get('/core/app_controller/protected/apps')).data
  }
}
</script>

<style scoped>
</style>
