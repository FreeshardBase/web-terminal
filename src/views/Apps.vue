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
          <!-- Refresh -->
          <b-button variant="outline-secondary" @click="hardRefreshStore('master')">
            <b-icon-arrow-repeat></b-icon-arrow-repeat>
          </b-button>

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
            <!-- Store Branch -->
            <b-dropdown-form @submit.prevent="hardRefreshStore(store.customBranch)">
              <b-input-group>
                <b-form-input placeholder="Store Branch" v-model="store.customBranch"></b-form-input>
                <b-input-group-append>
                  <b-button variant="outline-secondary" type="submit">
                    <b-icon-arrow-repeat></b-icon-arrow-repeat>
                  </b-button>
                </b-input-group-append>
              </b-input-group>
            </b-dropdown-form>
          </b-dropdown>
        </b-col>
      </b-row>

      <b-overlay :show="store.updating" rounded="sm" variant="white" class="w-100 p-1">

        <HorizontalSeparator title="Installed"></HorizontalSeparator>

        <!-- Installed Apps -->
        <b-row align-v="stretch" class="flex-grow-1">
          <b-col>
            <b-container>
              <!-- Entries -->
              <b-row cols="2">
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
              <b-row cols="2">
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
        apps: [],
        customBranch: '',
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
    refreshStore() {
      let component = this;
      return this.$http.get('/core/protected/store/apps')
          .then(function (response) {
            component.store.apps = response.data;
          })
          .catch(function (response) {
            console.log(response)
          })
    },

    addCustomApp() {
      this.store.customApp.updating = true;
      let component = this;
      this.$http.post(`/core/protected/apps`, this.store.customApp.content)
          .then(function () {
            component.refreshStore();
            component.$bvModal.hide('custom-app');
            component.store.customApp.updating = false;
          })
          .catch(function (e) {
            let errorMessage = e.response.data.detail[0].msg;
            if (errorMessage === 'field required') {
              errorMessage += `: ${e.response.data.detail[0].loc[1]}`
            }
            component.store.customApp.errorMessage = errorMessage;
            component.store.customApp.updating = false;
          })
    },

    hardRefreshStore(branchName) {
      this.store.updating = true;
      this.$http.post(`/core/protected/store/ref?ref=${branchName}`)
          .then(() => this.refreshStore()
              .then(this.store.updating = false))
          .catch(() => this.hardRefreshStore('master'))
    },
  },

  mounted() {
    document.title = `Portal [${this.$store.getters.short_portal_id}] - Apps`;
    this.refreshStore();
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