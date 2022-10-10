<template>
  <div>
    <b-container class="mt-4" fluid>

      <b-row>
        <b-col>
          <PortalIdBadge :portal-id="$store.getters.short_portal_id"></PortalIdBadge>
        </b-col>
        <b-col class="text-right">
          <b-button v-if="$store.state.meta.is_anonymous" variant="outline-primary" to="/pair">
            <b-icon-link45deg></b-icon-link45deg> Pair
          </b-button>
          <b-button v-else variant="outline-primary" to="/profile">
            <b-icon-person></b-icon-person> Profile
          </b-button>
        </b-col>
      </b-row>

      <b-row class="mt-5">
        <b-col class="text-center">

          <h1>{{ $store.state.meta.portal_identity.name }}</h1>
          <p><a :href="mailto">{{ $store.state.meta.portal_identity.email }}</a></p>
          <p style="white-space: pre-wrap">{{ $store.state.meta.portal_identity.description }}</p>

        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
import PortalIdBadge from "@/components/PortalIdBadge";

export default {
  name: "Profile",
  components: {PortalIdBadge},

  async mounted() {
    document.title = `Portal [${this.$store.getters.short_portal_id}] - Welcome`;
  },

  computed: {
    mailto() {
      return `mailto:${this.$store.state.meta.portal_identity.email}`
    }
  }

}
</script>

<style scoped>


</style>
