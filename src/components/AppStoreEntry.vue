<template>
  <div>
    <b-card class="overflow-hidden" @click="showDetails()" no-body>
      <b-row>
        <b-col cols="2" class="text-center">
          <b-spinner
              v-if="['installing', 'installation_queued'].includes(app.status)"
              class="app-icon m-2">
          </b-spinner>
          <div v-else>
            <b-img
                :src="appIconUrl"
                v-show="iconLoadedCard"
                @load="iconLoadedCard=true"
                alt="Icon"
                class="app-icon m-2"></b-img>
            <b-icon-box v-show="!iconLoadedCard" class="app-icon m-2"></b-icon-box>
          </div>
        </b-col>
        <b-col cols="10">
          <b-card-body>
            <b-card-title>
              {{ app.name | titlecase }}
              <b-icon-star-fill v-if="appStoreInfo.is_featured" class="app-star"></b-icon-star-fill>
              <b-icon-exclamation-octagon-fill v-if="!canBeInstalled" class="cannot-be-installed"></b-icon-exclamation-octagon-fill>
            </b-card-title>
            <b-card-text>{{ appStoreInfo.description_short }}</b-card-text>
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
                  :src="appIconUrl"
                  v-show="iconLoadedCard"
                  @load="iconLoadedCard=true"
                  alt="Icon"
                  class="app-icon m-2"></b-img>
              <b-icon-box v-show="!iconLoadedCard" class="app-icon m-2"></b-icon-box>
            </b-col>
            <b-col>
              <h2>
                {{ app.name | titlecase }}
              </h2>
              <p class="text-secondary"><small>{{ app.status }}</small></p>
            </b-col>
            <!-- Small extra icons -->
            <b-col sm="auto" md="auto" lg="auto" xl="auto">
              <div v-if="appStoreInfo.is_featured">
                <b-icon-star-fill :id="`star-modal-${app.name}`" class="app-star"></b-icon-star-fill>
                <b-popover :target="`star-modal-${app.name}`" placement="leftbottom" triggers="click blur">
                  <template #title>Featured App</template>
                  This app is well integrated with Portal and recommended by us.
                </b-popover>
                <br>
              </div>
              <div v-if="appStoreInfo.hint">
                <b-icon-info-square :id="`info-modal-${app.name}`" class="app-info"></b-icon-info-square>
                <b-popover :target="`info-modal-${app.name}`" placement="leftbottom" triggers="click blur">
                  <template #title>Hints</template>
                  <ul v-if="Array.isArray(appStoreInfo.hint)">
                    <li v-for="(item, index) in appStoreInfo.hint" :key="index">{{ item }}</li>
                  </ul>
                  <p v-else>{{ appStoreInfo.hint }}</p>
                </b-popover>
              </div>
            </b-col>
          </b-row>
        </b-container>
      </template>
      <div v-if="appStoreInfo.description_long && Array.isArray(appStoreInfo.description_long)">
        <p v-for="(paragraph, index) in appStoreInfo.description_long" :key="index">
          {{ paragraph }}
        </p>
      </div>
      <p v-else-if="appStoreInfo.description_long">{{ appStoreInfo.description_long }}</p>
      <p v-else>{{ appStoreInfo.description_short }}</p>
      <template #modal-footer>
        <!-- Install/Remove and Open Button -->
        <div v-if="busyMessage" class="w-100">
          <b-progress-bar
              value="100"
              variant="info"
              class="mt-3"
              :label="busyMessage"
              striped animated></b-progress-bar>
        </div>
        <div v-else>
          <div v-if="is_installed">
            <b-button v-if="is_installed" class="m-1" variant="primary" @click="open">
              Open
            </b-button>
            <b-button v-if="is_installed" class="m-1" variant="outline-danger" @click="removeApp">
              Remove
            </b-button>
          </div>
          <div v-else>
            <b-button v-if="canBeInstalled" class="m-1" variant="outline-success" @click="installApp">
              Install
            </b-button>
            <p v-else class="m-1 cannot-be-installed">
              <b-icon-exclamation-octagon-fill></b-icon-exclamation-octagon-fill>
              Cannot be installed. Portal size of {{ app.minimum_portal_size | uppercase }} or more required.
            </p>
          </div>
        </div>
      </template>
    </b-modal>
  </div>
</template>

<script>
export default {
  name: "AppStoreEntry",
  props: ['app', 'is_installed', 'branch'],
  data: function () {
    return {
      iconLoadedCard: false,
      iconLoadedModal: false,
      busyMessage: null,
    }
  },

  computed: {
    appIconUrl() {
      if (this.is_installed) {
        return `/core/protected/apps/${this.app.name}/icon`;
      } else {
        const iconFilename = this.app.icon;
        return `https://storageaccountportab0da.blob.core.windows.net/app-store/${this.branch}/all_apps/${this.app.name}/${iconFilename}`;
      }
    },
    appStoreInfo() {
      return this.app.store_info || {
        description_short: 'A custom app',
        description_long: undefined,
        hint: undefined,
        is_featured: false,
      }
    },
    canBeInstalled() {
      const sizes = ['xs', 's', 'm', 'l', 'xl'];
      const currentSize = sizes.indexOf(this.$store.state.profile.portal_size);
      const requiredSize = sizes.indexOf(this.app.minimum_portal_size);
      return currentSize >= requiredSize;
    }
  },

  methods: {
    async installApp() {
      this.busyMessage = `Installing ${this.app.name}...`;
      await this.$http.post(`/core/protected/apps/${this.app.name}`);
      this.$emit('changed');
      this.busyMessage = null;
    },

    showDetails() {
      this.$bvModal.show(`app-details-${this.app.name}`);
    },

    async removeApp() {
      this.busyMessage = `Removing ${this.app.name}...`;
      await this.$http.delete(`/core/protected/apps/${this.app.name}`);
      this.$emit('changed');
      this.busyMessage = null;
    },

    open() {
      window.open(`https://${this.app.name}.${window.location.host}`, '_blank');
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

.app-star {
  color: gold;
  cursor: pointer;
}

.cannot-be-installed {
  color: orange;
}

.app-info {
  color: dimgrey;
  cursor: pointer;
}

</style>
