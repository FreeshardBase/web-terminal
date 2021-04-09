<template>
  <b-card class="overflow-hidden" no-body style="max-width: 540px;">
    <b-row no-gutters>
      <b-col md="2">
        <b-card-img
            alt="Icon"
            :src="`/core/app_controller/protected/apps/${app.name}/icon`"
            class="app-icon m-2"></b-card-img>
      </b-col>
      <b-col md="10">
        <b-card-body :title="app.name">
          <b-card-text>{{app.description}}</b-card-text>
        </b-card-body>
      </b-col>
    </b-row>
  </b-card>
</template>

<script>
export default {
  name: "AppStoreEntry",
  props: ['app'],
}
</script>

<style scoped>

.app-icon {
  height: 4em;
  width: 4em;
}

</style>