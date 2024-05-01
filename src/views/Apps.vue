<template>
  <div>
    <navbar></navbar>
    <b-container class="mt-4">

      <!-- Title -->
      <b-row>
        <b-col>
          <h1>Apps</h1>
        </b-col>
        <b-col class="text-right p-1">
          <!-- Settings -->
          <b-dropdown class="m-2" dropup no-caret right text="Drop-Up" variant="outline-secondary">
            <template #button-content>
              <b-icon-gear-fill></b-icon-gear-fill>
            </template>
            <b-dropdown-text>Tools for app developers</b-dropdown-text>
            <b-dropdown-divider></b-dropdown-divider>
            <!-- Refresh -->
            <b-dropdown-item>
              <b-button @click="refresh" variant="outline-secondary">
                <b-icon-arrow-repeat></b-icon-arrow-repeat>
                Refresh app store
              </b-button>
            </b-dropdown-item>
            <!-- Store Branch -->
            <b-dropdown-form @submit.prevent="setBranch(storeSwitchBranchInput)">
              <b-input-group>
                <b-form-input placeholder="Switch branch" v-model="storeSwitchBranchInput"></b-form-input>
                <b-input-group-append>
                  <b-button variant="outline-secondary" type="submit">
                    <b-icon-arrow-left-right></b-icon-arrow-left-right>
                  </b-button>
                </b-input-group-append>
              </b-input-group>
            </b-dropdown-form>
            <b-dropdown-divider></b-dropdown-divider>
            <b-dropdown-item>
              <b-button v-b-modal.install-custom-app>
                <b-icon-box-arrow-in-up></b-icon-box-arrow-in-up>
                Install Custom App
              </b-button>
            </b-dropdown-item>
          </b-dropdown>
        </b-col>
      </b-row>

      <b-overlay :show="isUpdating" rounded="sm" variant="white" class="w-100 p-1" id="all-apps">

        <b-alert show v-if="storeBranch !== 'master'">
          <p>
            You are viewing the app app store on branch <b>{{ storeBranch }}</b>.
            This is meant for development and testing only.
            Some apps that should be there might be missing.
            Apps that are not yet fully functional might be visible.
            Proceed with caution.
          </p>
          <b-button @click="setBranch('master')" variant="outline-info">
            <b-icon-backspace-fill></b-icon-backspace-fill>
            Reset App Store
          </b-button>
        </b-alert>

        <!-- Apps with updates -->
        <b-row v-if="appsWithUpdates.length > 0">
          <b-col>
            <b-alert show variant="warning" v-if="appsWithUpdates.length === 1">
              There is one app with updates available.
              <b-button @click="updateAllApps" variant="warning">
                <b-icon-arrow-up-circle></b-icon-arrow-up-circle>
                Update
              </b-button>
            </b-alert>
            <b-alert show variant="warning" v-else>
              There are {{ appsWithUpdates.length }} apps with updates available.
              <b-button @click="updateAllApps" variant="warning">
                <b-icon-arrow-up-circle></b-icon-arrow-up-circle>
                Update All
              </b-button>
            </b-alert>
          </b-col>
        </b-row>

        <HorizontalSeparator title="Installed"></HorizontalSeparator>

        <!-- Installed Apps -->
        <b-row align-v="stretch" class="flex-grow-1" id="installed-apps">
          <b-col>
            <b-container>
              <!-- Entries -->
              <b-row cols="1" cols-md="2">
                <b-col v-for="app in installedApps" :key="app.name" class="p-1">
                  <AppStoreEntry :app="app" is_installed="true" @changed="refresh" :update_available="app.update_available"></AppStoreEntry>
                </b-col>
              </b-row>
            </b-container>
          </b-col>
        </b-row>

        <HorizontalSeparator title="Available"></HorizontalSeparator>

        <!-- Available Apps -->
        <b-row align-v="stretch" class="flex-grow-1" id="available-apps">
          <b-col>
            <b-container>
              <!-- Entries -->
              <b-row cols="1" cols-md="2">
                <b-col v-for="app in availableApps" :key="app.name" class="p-1">
                  <AppStoreEntry :app="app" @changed="refresh" :branch="storeBranch"></AppStoreEntry>
                </b-col>
              </b-row>
            </b-container>
          </b-col>
        </b-row>

      </b-overlay>

    </b-container>

    <!-- Modal: Install Custom App -->
    <b-modal id="install-custom-app">
      <template #modal-header>
        <h2>Install Custom App</h2>
      </template>
      <p>
        Custom apps are apps that are not in the app store.
        See the documentation on how to <a href="https://docs.getportal.org/developer_docs/custom_apps/" target="_blank">create</a> one.
      </p>
      <b-alert variant="danger" show>
        Custom apps are not not verified by us.
        They can cause serious harm to your Portal instance.
        Make sure, you trust the source of the app.
      </b-alert>
      <b-form-file
          v-model="customAppFile"
          placeholder="Choose a file or drop it here..."
          drop-placeholder="Drop file here..."
      ></b-form-file>
      <p v-if="customAppError" class="text-danger">{{ customAppError | errorMessage }}</p>
      <template #modal-footer>
        <b-button variant="success" :disabled="!Boolean(customAppFile)" @click="uploadCustomApp">
          <b-icon-box-arrow-in-up></b-icon-box-arrow-in-up>
          Install
        </b-button>
      </template>
    </b-modal>

  </div>
</template>

<script>
import Navbar from "@/components/Navbar";
import AppStoreEntry from "@/components/AppStoreEntry";
import HorizontalSeparator from "@/components/HorizontalSeparator";

export default {
  name: "Apps",
  components: {HorizontalSeparator, AppStoreEntry, Navbar},
  data: function () {
    return {
      storeApps: [],
      storeBranch: 'master',
      storeSwitchBranchInput: '',
      isUpdating: false,
      customAppFile: null,
      customAppError: null,
    }
  },

  computed: {
    availableApps() {
      const installedAppNames = this.$store.state.apps.map(a => a.name);
      return [...this.storeApps]
          .filter(a => !installedAppNames.includes(a.name))
          .sort((a, b) => {
            if (Boolean(a.store_info.is_featured) === Boolean(b.store_info.is_featured)) {
              return a.name.localeCompare(b.name);
            } else {
              return Number(b.store_info.is_featured || false) - Number(a.store_info.is_featured || false);
            }
          });
    },

    installedApps() {
      const this_ = this;
      return this.$store.state.apps
          .map(app => {
            const storeApp = this_.storeApps.find(sa => sa.name === app.name);
            return {
              ...app,
              update_available: storeApp !== undefined && (app.meta && app.meta.app_version !== storeApp.app_version),
            }
          })
    },

    appsWithUpdates() {
      const this_ = this;
      return this.$store.state.apps.filter(app => {
        const storeApp = this_.storeApps.find(a => a.name === app.name);
        return storeApp !== undefined && app.meta && app.meta.app_version !== storeApp.app_version && ['stopped', 'running', 'down'].includes(app.status);
      })
    }
  },

  methods: {
    async refresh() {
      this.isUpdating = true;
      try {
        await Promise.all([
          this.$store.dispatch("refresh_apps"),
          this.fetchStoreApps()
        ]);
      } finally {
        this.isUpdating = false;
      }
    },

    async fetchStoreApps() {
      this.storeApps = (await this.$http.get(`https://storageaccountportab0da.blob.core.windows.net/app-store/${this.storeBranch}/all_apps/store_metadata.json?c=${Date.now()}`)).data.apps
    },

    async setBranch(branch) {
      this.storeBranch = branch;
      await this.fetchStoreApps();
      this.storeSwitchBranchInput = '';
    },

    async uploadCustomApp() {
      const formData = new FormData();
      formData.append('file', this.customAppFile);
      try {
        await this.$http.post(`/core/protected/apps`, formData);
        this.$bvModal.hide('install-custom-app');
        await this.refresh();
      } catch (error) {
        this.customAppError = error;
      }
    },

    async updateAllApps() {
      await Promise.all(this.appsWithUpdates.map(app => this.$http.post(`/core/protected/apps/${app.name}/reinstall`)));
    }

  },

  async mounted() {
    document.title = `Portal [${this.$store.getters.short_portal_id}] - Apps`;
    await this.refresh();
  }
}
</script>

<style scoped>

.icon {
  height: 1.5em;
}

a {
  cursor: pointer;
}

</style>
