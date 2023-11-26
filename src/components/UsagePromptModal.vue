<template>
  <b-modal
      size="xl"
      title="Welcome to your Portal!"
      v-model="visible"
      @ok="installSelectedApps"
      scrollable centered>
    <p><b>What would you like to do?</b></p>

    <p>
      Portal offers a variety of apps for many different use cases.
      Here are a few that are particularly useful.
      You can also install these and more from the app store.
    </p>

    <usage-prompt-card
        :app="apps.vaultwarden"
        v-model="apps.vaultwarden.selected"
        :disabled="installedApps.includes('vaultwarden')"
        title="Manage Passwords"
        image="../assets/usage-prompt/vaultwarden.jpg">
      Keep your passwords on Portal, securely encrypted with your master password.
      Fill them easily using the browser extension and smartphone app.
      Secure your online life by easily using a different and strong password for every website.
    </usage-prompt-card>

    <usage-prompt-card
        :app="apps['paperless-ngx']"
        v-model="apps['paperless-ngx'].selected"
        :disabled="installedApps.includes('paperless-ngx')"
        title="Digitize Physical Documents"
        image="../assets/usage-prompt/paperless.jpg">
      Replace your filing cabinet with Portal.
      Store your scanned physical documents and access them from anywhere.
      Sort and organize them by correspondent, type, date, tags, and other metadata.
      Search for text inside your documents.
    </usage-prompt-card>

    <usage-prompt-card
        :app="apps.navidrome"
        v-model="apps.navidrome.selected"
        :disabled="installedApps.includes('navidrome')"
        title="Listen to Your MP3 Collection"
        image="../assets/usage-prompt/navidrome.jpg">
      Upload your MP3 collection to Portal and listen to it from anywhere.
      Use the browser-based music player or any Subsonic client.
    </usage-prompt-card>

    <usage-prompt-card
        :app="apps.linkding"
        v-model="apps.linkding.selected"
        :disabled="installedApps.includes('linkding')"
        title="Organize Bookmarks"
        image="../assets/usage-prompt/linkding.jpg">
      Store and organize your bookmarks on Portal.
      Tag them for easy search and retrieval.
      Use the browser extension to access them and easily add new ones.
    </usage-prompt-card>

    <usage-prompt-card
        :app="apps.immich"
        v-model="apps.immich.selected"
        :disabled="installedApps.includes('immich')"
        title="Keep Photos and Videos"
        image="../assets/usage-prompt/immich.jpg">
      Backup and organize the photos from your phone.
      View them in a timeline, by location, or by tags.
      Share galleries with others and allow them to upload their photos as well.
    </usage-prompt-card>

    <usage-prompt-card
        :app="apps.actual"
        v-model="apps.actual.selected"
        :disabled="installedApps.includes('actual')"
        title="Get a Handle on Your Finances"
        image="../assets/usage-prompt/actual.jpg">
      Save real money by tracking your expenses and income.
      Import your bank statements, categorize your transactions, and create net worth and cash flow reports.
      Plan ahead by setting budgets and goals using the envelope budgeting method.
    </usage-prompt-card>

    <template #modal-footer="{ ok, cancel }">
      <b-button variant="outline-secondary" @click="cancel()">
        Nevermind
      </b-button>
      <b-button variant="success" @click="ok()" :disabled="Object.values(apps).every(item => !item.selected)">
        Install Selected Apps
      </b-button>
    </template>

  </b-modal>
</template>

<script>

import UsagePromptCard from "@/components/UsagePromptCard.vue";

export default {
  name: "UsagePromptModal",
  components: {UsagePromptCard},
  data: function () {
    return {
      visible: false,
      apps: {}
    }
  },

  async beforeMount() {
    const storeApps = (await this.$http.get(`https://storageaccountportab0da.blob.core.windows.net/app-store/master/all_apps/store_metadata.json`)).data.apps
    this.apps = Object.fromEntries(storeApps.map(a => [a.name, {...a, selected: false}]));
  },

  computed: {
    installedApps() {
      return this.$store.state.apps.map(a => a.name);
    },
  },

  methods: {
    show() {
      this.visible = true;
    },

    async installSelectedApps() {
      const appsToInstall = Object.values(this.apps).filter((app) => app.selected).map((app) => app.name);
      await Promise.all(appsToInstall.map((app) => this.$http.post(`/core/protected/apps/${app}`)));
    }
  }
}


</script>

<style scoped>

</style>
