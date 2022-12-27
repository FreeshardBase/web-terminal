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
            <!-- Custom App -->
            <b-dropdown-item>
              <b-button v-b-modal:custom-app variant="outline-success">
                <b-icon-plus-circle-fill></b-icon-plus-circle-fill>
                Install Custom App
              </b-button>
            </b-dropdown-item>
            <b-dropdown-divider></b-dropdown-divider>
            <!-- Refresh -->
            <b-dropdown-item>
              <b-button @click="hardRefreshStore" variant="outline-secondary">
                <b-icon-arrow-repeat></b-icon-arrow-repeat>
                Refresh App Store
              </b-button>
            </b-dropdown-item>
            <!-- Store Branch -->
            <b-dropdown-form @submit.prevent="setStoreBranch(store.switchBranchInput)">
              <b-input-group>
                <b-form-input placeholder="Switch Branch" v-model="store.switchBranchInput"></b-form-input>
                <b-input-group-append>
                  <b-button variant="outline-secondary" type="submit">
                    <b-icon-arrow-left-right></b-icon-arrow-left-right>
                  </b-button>
                </b-input-group-append>
              </b-input-group>
            </b-dropdown-form>
          </b-dropdown>
        </b-col>
      </b-row>

      <b-overlay :show="store.updating" rounded="sm" variant="white" class="w-100 p-1">

        <b-alert show v-if="store.currentBranch !== 'master'">
          <p>
            You are viewing the app app store on branch <b>{{ store.currentBranch }}</b>.
            This is meant for development and testing only.
            Some apps that should be there might be missing.
            Apps that are not yet fully functional might be visible.
            Proceed with caution.
          </p>
          <b-button @click="setStoreBranch('master')" variant="outline-info">
            <b-icon-backspace-fill></b-icon-backspace-fill> Reset App Store
          </b-button>
        </b-alert>

        <HorizontalSeparator title="Installed"></HorizontalSeparator>

        <!-- Installed Apps -->
        <b-row align-v="stretch" class="flex-grow-1">
          <b-col>
            <b-container>
              <!-- Entries -->
              <b-row cols="1" cols-md="2">
                <b-col v-for="app in installedApps" :key="app.name" class="p-1">
                  <AppStoreEntry :app="app" @changed="refreshStore"></AppStoreEntry>
                </b-col>
              </b-row>
            </b-container>
          </b-col>
        </b-row>

        <HorizontalSeparator title="Available"></HorizontalSeparator>

        <!-- Available Apps -->
        <b-row align-v="stretch" class="flex-grow-1">
          <b-col>
            <b-container>
              <!-- Entries -->
              <b-row cols="1" cols-md="2">
                <b-col v-for="app in availableApps" :key="app.name" class="p-1">
                  <AppStoreEntry :app="app" @changed="refreshStore"></AppStoreEntry>
                </b-col>
              </b-row>
            </b-container>
          </b-col>
        </b-row>

      </b-overlay>

    </b-container>

    <!-- Modal: custom app -->
    <b-modal id="custom-app" title="Install Custom App">
      <b-form>
        <b-form-group>
          <b-form-textarea rows="18" v-model="store.customApp.content"></b-form-textarea>
          <b-form-text>
            Enter the app definition in JSON format. See the <a
              href="https://docs.getportal.org/app_json/" target="_blank">documentation</a> for further information.
          </b-form-text>
        </b-form-group>
      </b-form>
      <span class="text-danger">{{ store.customApp.errorMessage }}</span>

      <template #modal-footer>
        <b-button variant="outline-success" @click="addCustomApp">
          <span v-if="store.customApp.updating"><b-spinner small></b-spinner></span>
          <span v-else>Install</span>
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
      store: {
        currentBranch: 'master',
        apps: [],
        switchBranchInput: '',
        updating: false,
        customApp: {
          updating: false,
          errorMessage: '',
          content: {
            "name": "foo",
            "image": "fooapps/foo:1.2.3",
            "port": 80,
            "data_dirs": [
              "/data",
              "/config"
            ],
            "env_vars": {
              "FOO": "bar"
            },
            "prefix_public": "/public",
          },
        },
      },
    }
  },

  computed: {
    installedApps() {
      return [...this.store.apps]
          .filter(a => a.is_installed)
          .sort((a, b) => {
            return a.store_info.is_featured < b.store_info.is_featured
          })
    },
    availableApps() {
      return [...this.store.apps]
          .filter(a => !a.is_installed)
          .sort((a, b) => {
            return a.store_info.is_featured < b.store_info.is_featured
          })
    }
  },

  methods: {
    async refreshStore() {
      this.store.updating = true;
      const response = await this.$http.get('/core/protected/store/apps');
      this.store.apps = response.data;
      this.store.updating = false;
    },

    async hardRefreshStore() {
      this.store.updating = true;
      const response = await this.$http.get('/core/protected/store/apps', {params: {refresh: true}});
      this.store.apps = response.data;
      this.store.updating = false;
    },

    async addCustomApp() {
      this.store.customApp.updating = true;
      try {
        await this.$http.post(`/core/protected/apps`, this.store.customApp.content)
        await this.refreshStore();
        this.$bvModal.hide('custom-app');
        this.store.customApp.updating = false;
      } catch (e) {
        let errorMessage = e.response.data.detail[0].msg;
        if (errorMessage === 'field required') {
          errorMessage += `: ${e.response.data.detail[0].loc[1]}`
        }
        this.store.customApp.errorMessage = errorMessage;
        this.store.customApp.updating = false;
      }
    },

    async setStoreBranch(branchName) {
      this.store.updating = true;
      try {
        await this.$http.post('/core/protected/store/branch', {branch: branchName});
      } catch (e) {
        console.log(e.response);
        this.$bvToast.toast(e.response.data.detail, {
          title: 'Error during app store loading',
          autoHideDelay: 5000,
          appendToast: true,
          solid: true,
          variant: 'danger',
        });
      } finally {
        await this.refreshStore();
        await this.getStoreBranch();
      }
    },

    async getStoreBranch() {
      const statusResponse = await this.$http.get('/core/protected/store/branch');
      console.log(statusResponse.data.current_branch);
      this.store.currentBranch = statusResponse.data.current_branch;
    },
  },

  async mounted() {
    this.store.updating = true;
    document.title = `Portal [${this.$store.getters.short_portal_id}] - Apps`;
    await this.getStoreBranch();
    await this.refreshStore();
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
