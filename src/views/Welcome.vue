<template>
  <div>
    <b-container class="mt-4" fluid>

      <b-row class="mt-5">
        <b-col class="text-center">

          <AvatarWrapper
              src="core/public/meta/avatar"
              :name="$store.state.meta.identity.name"
              size="10rem"
              class="mb-4"
          ></AvatarWrapper>
          <h1>{{ $store.state.meta.identity.name }}</h1>
          <p><a :href="mailto">{{ $store.state.meta.identity.email }}</a></p>
          <div v-html="markdownToHtml($store.state.meta.identity.description)"></div>

        </b-col>
      </b-row>

      <b-row align-v="center" align-h="start">

        <b-col cols="auto">
          <ShardIdBadge :shard-id="$store.getters.short_shard_id"></ShardIdBadge>
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
          <small class="text-muted">
            <a href="https://freeshard.net" target="_blank">Learn more</a>
            about Shard
          </small>
        </b-col>
      </b-row>

    </b-container>
  </div>
</template>

<script>
import ShardIdBadge from "@/components/ShardIdBadge.vue";
import {marked} from "marked";
import AvatarWrapper from "@/components/AvatarWrapper.vue";

export default {
  name: "Profile",
  components: {AvatarWrapper, ShardIdBadge},

  async mounted() {
    document.title = `Shard [${this.$store.getters.short_shard_id}] - Welcome`;
    await this.$store.dispatch('query_meta_data');
  },

  computed: {
    mailto() {
      return `mailto:${this.$store.state.meta.identity.email}`
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
