<template>
  <div>
    <b-card class="overflow-hidden" @click="showDetails()" no-body>
      <b-row no-gutters>
        <b-col md="2" class="text-center">
          <b-img
              :src="`/core/protected/apps/${app.name}/icon`"
              alt="Icon"
              class="app-icon m-2"></b-img>
          <b-badge v-if="app.is_installed" size="xs" pill variant="success">Installed</b-badge>
        </b-col>
        <b-col md="10">
          <b-card-body>
            <b-card-title>
              {{ app.name | titlecase }}
            </b-card-title>
            <b-card-text>{{ app.store_info.description_short }}</b-card-text>
          </b-card-body>
        </b-col>
      </b-row>
    </b-card>

    <!-- Modal: app details -->
    <b-modal :id="`app-details-${ app.name }`">
      <template #modal-header>
        <b-container>
          <b-row align-v="center" align-h="start">
            <b-col sm="auto" md="auto" lg="auto" xl="auto">
              <b-img
                :src="`/core/protected/apps/${app.name}/icon`"
                alt="Icon"
                class="app-icon m-2"></b-img>
            </b-col>
            <b-col>
              <h2>
                {{ app.name | titlecase }}
              </h2>
            </b-col>
          </b-row>
        </b-container>
      </template>
        <div v-if="app.store_info.description_long && Array.isArray(app.store_info.description_long)">
          <p v-for="(paragraph, index) in app.store_info.description_long" :key="index">
            {{ paragraph }}
          </p>
        </div>
        <p v-else-if="app.store_info.description_long">{{ app.store_info.description_long }}</p>
        <p v-else>{{ app.store_info.description_short }}</p>
      <template #modal-footer>
        <b-button v-if="app.is_installed" class="m-1" variant="outline-danger" @click="removeApp">
          Remove
        </b-button>
        <b-button v-else class="m-1" variant="outline-success" @click="installApp">
          Install
        </b-button>
      </template>
    </b-modal>
  </div>
</template>

<script>
export default {
  name: "AppStoreEntry",
  props: ['app'],

  methods: {
    installApp() {
      const this_ = this;
      this.$http.post(`/core/protected/store/apps/${this.app.name}`)
          .then(function () {
            this_.$emit('changed')
          })
          .catch(function (response) {
            console.log(response)
          })
    },
    showDetails() {
      this.$bvModal.show(`app-details-${this.app.name}`);
    },
    removeApp() {
      let this_ = this;
      this.$http.delete(`/core/protected/apps/${this.app.name}`)
          .then(function () {
            this_.$emit('changed')
          })
          .catch(function (response) {
            console.log(response)
          })
    },
  }
}
</script>

<style scoped>

.app-icon {
  height: 4em;
  width: 4em;
}

.card {
  max-width: 540px;
  height: 8em;
  cursor: pointer;
  transition: 0.3s;
}

.card:hover {
  box-shadow: 0 0 0.6em -0.3em black;
}

</style>