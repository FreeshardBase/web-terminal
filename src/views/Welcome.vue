<template>
  <div>
    <b-container class="mt-4" fluid>

      <b-row class="mt-5">
        <b-col class="text-center">

          <AvatarWrapper
              src="core/protected/identities/default/avatar"
              :name="$store.state.meta.portal_identity.name"
              size="10rem"
              class="mb-4"
          ></AvatarWrapper>
          <h1>{{ $store.state.meta.portal_identity.name }}</h1>
          <p><a :href="mailto">{{ $store.state.meta.portal_identity.email }}</a></p>
          <div v-html="markdownToHtml($store.state.meta.portal_identity.description)"></div>

        </b-col>
      </b-row>

      <b-row align-v="center" align-h="start">

        <b-col cols="auto">
          <PortalIdBadge :portal-id="$store.getters.short_portal_id"></PortalIdBadge>
        </b-col>

        <b-col class="text-right">
          <b-button v-if="$store.state.meta.is_anonymous" variant="outline-secondary" to="/pair">
            <b-icon-link45deg></b-icon-link45deg> Pair
          </b-button>
          <b-button v-else variant="outline-secondary" to="/public">
            <b-icon-person></b-icon-person> Edit
          </b-button>
        </b-col>

      </b-row>

      <b-row>
        <b-col class="text-center mt-2">
          <small class="text-muted">This Portal is owned and controlled by {{ $store.state.meta.portal_identity.name }}
            - <a href="https://getportal.org" target="_blank">learn more</a></small>
        </b-col>
      </b-row>

    </b-container>
  </div>
</template>

<script>
import PortalIdBadge from "@/components/PortalIdBadge";
import {marked} from "marked";
import AvatarWrapper from "@/components/AvatarWrapper.vue";

export default {
  name: "Profile",
  components: {AvatarWrapper, PortalIdBadge},

  async mounted() {
    document.title = `Portal [${this.$store.getters.short_portal_id}] - Welcome`;
    await this.$store.dispatch('query_meta_data');
  },

  computed: {
    mailto() {
      return `mailto:${this.$store.state.meta.portal_identity.email}`
    }
  },

  methods: {
    markdownToHtml(md) {
      return marked(md);
    },
  },

}
</script>

<style scoped>


</style>
