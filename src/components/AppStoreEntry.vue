<template>
  <b-card class="overflow-hidden" no-body style="max-width: 540px;">
    <b-row no-gutters>
      <b-col md="2" class="text-center">
        <b-img
            :src="`/core/app_controller/protected/apps/${app.name}/icon`"
            alt="Icon"
            class="app-icon m-2"></b-img>
        <b-button class="m-1" variant="outline-success" @click="installApp">
          Install
        </b-button>
      </b-col>
      <b-col md="10">
        <b-card-body :title="app.name">
          <b-card-text>{{ app.description }}</b-card-text>
        </b-card-body>
      </b-col>
    </b-row>
  </b-card>
</template>

<script>
export default {
  name: "AppStoreEntry",
  props: ['app'],

  methods: {
    installApp() {
      this.$http.post(`/core/app_controller/protected/store/apps/${this.app.name}`)
          .then(function (response) {
            console.log(response)
          })
          .catch(function (response) {
            console.log(response)
          })
    }
  }
}
</script>

<style scoped>

.app-icon {
  height: 4em;
  width: 4em;
}

</style>