<template>
  <b-modal size="xl" title="Welcome to your Portal!" v-model="visible" scrollable centered>
    <p><b>What would you like to do?</b></p>

    <p>
      Portal offers a variety of apps for many different use cases.
      Here are a few that are particularly useful.
      Later, you can install more from the app store.
    </p>

    <usage-prompt-card app-name="vaultwarden" title="Manage Passwords" image="../assets/usage-prompt/vaultwarden.jpg">
      Keep your passwords on Portal, securely encrypted with your master password.
      Fill them easily using the browser extension and smartphone app.
      Secure your online life by easily using a different and strong password for every website.
    </usage-prompt-card>
    <usage-prompt-card app-name="paperless-ngx" title="Store Documents" image="../assets/usage-prompt/paperless.jpg">
      Replace your filing cabinet with Portal.
      Store your scanned physical documents and access them from anywhere.
      Sort and organize them by correspondent, type, date, tags, and other metadata.
      Search for text inside your documents.
    </usage-prompt-card>


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
    }
  },

  methods: {
    show() {
      this.visible = true;
    },
  }
}


</script>

<style scoped>

</style>
