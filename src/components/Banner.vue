<template>
  <div v-if="display" id="banner" :class="`alert-${variant}`">
    <b-container fluid>
      <b-row>
        <b-col v-html="content" class="text-center"></b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
import {marked} from "marked";
const banners_url = 'https://storageaccountportab0da.blob.core.windows.net/cnc/banners.json'

export default {
  name: "Banner",

  data: function () {
    return {
      display: false,
      content: '',
      variant: 'info'
    }
  },

  async mounted() {
    const response = await this.$http.get(banners_url);
    const banners = response.data['banners'];
    const now = new Date();
    for (const banner of banners) {
      const from_ts = banner['from_ts'] ? new Date(banner['from_ts']) : null;
      const to_ts = banner['to_ts'] ? new Date(banner['to_ts']) : null;
      if ((from_ts && now < from_ts) || (to_ts && now > to_ts)) {
        continue
      }
      this.display = true;
      this.content = marked(banner['content_md']);
      this.variant = banner['variant'];
    }
  },
}
</script>

<style scoped>

  #banner >>> p {
    margin: 0;
    padding: 0;
  }

  #banner {
    padding: 0.3em;
  }

</style>
