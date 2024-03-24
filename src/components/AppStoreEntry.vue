<template>
  <div>
    <b-card class="overflow-hidden" @click="showDetails()" no-body>
      <b-row>
        <b-col cols="2" class="text-center">
          <b-spinner
              v-if="['installing', 'installation_queued', 'uninstalling'].includes(app.status)"
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
              {{ app.pretty_name || (app.meta && app.meta.pretty_name) || app.name }}
              <b-icon-arrow-up-circle
                  variant="warning" v-if="update_available"></b-icon-arrow-up-circle>
              <b-icon-star-fill
                  v-if="appStoreInfo.is_featured" class="app-star"></b-icon-star-fill>
              <b-icon-exclamation-octagon-fill
                  v-if="!canBeInstalled" variant="warning"></b-icon-exclamation-octagon-fill>
              <b-icon-exclamation-triangle-fill
                  v-if="app.status === 'error'" variant="danger"></b-icon-exclamation-triangle-fill>
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
                {{ app.pretty_name || (app.meta && app.meta.pretty_name) || app.name }}
              </h2>
              <p class="text-secondary" v-if="is_installed"><small>
                {{ app.status }}<br>
                <div v-if="Boolean(app.from_branch) && app.from_branch !== 'master'">From branch: {{
                    app.from_branch
                  }}
                </div>
                <div v-if="app.installation_reason === 'custom'">Custom App</div>
                <div v-if="app.installation_reason === 'config'">Preconfigured App</div>
              </small></p>
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
            <b-button class="m-1" variant="warning" @click="updateApp" v-if="update_available">
              <b-icon-arrow-up-circle></b-icon-arrow-up-circle>
              Update
            </b-button>
            <b-button class="m-1" variant="primary" @click="open">
              Open
            </b-button>
            <b-button class="m-1" variant="outline-danger" @click="removeApp">
              Remove
            </b-button>
          </div>
          <div v-else>
            <b-button v-if="canBeInstalled" class="m-1" variant="outline-success" @click="installApp">
              Install
            </b-button>
            <p v-else class="m-1 text-warning">
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
import {toastMixin} from "@/mixins";

export default {
  name: "AppStoreEntry",
  mixins: [toastMixin],
  props: ['app', 'is_installed', 'branch', 'update_available'],
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
      return this.app.store_info || (this.app.meta && this.app.meta.store_info) || {
        description_short: 'Unknown App',
        description_long: undefined,
        hint: undefined,
        is_featured: false,
      }
    },
    canBeInstalled() {
      const sizes = ['xs', 's', 'm', 'l', 'xl'];
      if (this.$store.state.profile) {
        const currentSize = sizes.indexOf(this.$store.state.profile.portal_size);
        const requiredSize = sizes.indexOf(this.app.minimum_portal_size);
        return currentSize >= requiredSize;
      } else {
        return true;
      }
    }
  },

  methods: {
    async installApp() {
      this.busyMessage = `Installing ${this.app.name}...`;
      await this.$http.post(`/core/protected/apps/${this.app.name}?branch=${this.branch}`);
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

    async updateApp() {
      this.busyMessage = `Updating ${this.app.name}...`;
      try {
        await this.$http.post(`/core/protected/apps/${this.app.name}/reinstall`);
      } catch (e) {
        this.toastError(`Failed to update ${this.app.name}`, e.message);
      } finally {
        this.$emit('changed');
        this.busyMessage = null;
      }
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
  margin-left: 0.5em;
}

.app-info {
  color: dimgrey;
  cursor: pointer;
}

</style>
