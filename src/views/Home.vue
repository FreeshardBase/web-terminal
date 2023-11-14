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
    <usage-prompt-modal ref="usage-prompt-modal"></usage-prompt-modal>
  </div>
</template>

<script>
import navbar from "@/components/Navbar";
import AppIcon from "@/components/AppIcon";
import UsagePromptModal from "@/components/UsagePromptModal.vue";

export default {
  name: 'Home',
  components: {UsagePromptModal, AppIcon, navbar},
  data: function () {
    return {

    }
  },

  async mounted() {
    document.title = `Portal [${this.$store.getters.short_portal_id}] - Home`;
    await this.$store.dispatch("refresh_apps")
    if (!this.$store.getters.tour_seen('usage prompt')) {
      this.$refs['usage-prompt-modal'].show();
      await this.$store.dispatch('mark_tour_as_seen', 'usage prompt');
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
