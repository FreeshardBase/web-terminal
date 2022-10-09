<template>
  <div>
    <b-container class="mt-4" fluid>

      <b-row>
        <b-col>
          <PortalIdBadge :portal-id="$store.getters.short_portal_id"></PortalIdBadge>
        </b-col>
        <b-col class="text-right">
          <b-button variant="outline-primary" to="/pair">Pair</b-button>
        </b-col>
      </b-row>

      <b-row class="mt-5">
        <b-col class="text-center">

          <h1>{{ $store.state.meta.portal_identity.name }}</h1>
          <p>{{ $store.state.meta.portal_identity.email }}</p>
          <p>{{ $store.state.meta.portal_identity.description }}</p>

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

}
</script>

<style scoped>


</style>
