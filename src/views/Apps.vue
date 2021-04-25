<template>
  <div>
    <navbar></navbar>
    <b-container class="mt-4">
      <b-row>
        <b-col>
          <h1>Apps</h1>
        </b-col>
      </b-row>

      <b-row align-v="stretch" class="flex-grow-1">
        <b-col>
          <b-tabs align="center" content-class="mt-3">


            <!-- Installed -->
            <b-tab active title="Installed">
              <b-table :fields="fields" :items="apps" hover primary-key="name">
                <template #cell(iconname)="data">
                  <img
                      :src="`/core/app_controller/protected/apps/${data.item.name}/icon`"
                      alt="❓"
                      class="icon">
                  <a class="text-capitalize pl-1" @click="showDetails(data.item)">{{ data.item.name }}</a>
                </template>
              </b-table>
            </b-tab>


            <!-- Store -->
            <b-tab title="Store">
              <b-overlay :show="store.updating" rounded="sm" variant="white" class="w-100 p-1">
              <b-container>

                <!-- Entries -->
                  <b-row cols="2">
                    <b-col v-for="app in store.apps" :key="app.name" class="p-1">
                      <AppStoreEntry :app="app"></AppStoreEntry>
                    </b-col>
                  </b-row>

                <!-- Options -->
                <b-row align-v="end">
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

              </b-container>
                </b-overlay>
            </b-tab>
          </b-tabs>
        </b-col>
      </b-row>

    </b-container>

    <!-- Modal: app details -->
    <b-modal id="apps-details">
      <template #modal-header>
              <span class="text-capitalize">
                {{ detailItem.name }}
              </span>
      </template>

      <template #modal-footer>
        <b-button
            v-if="detailItem.installation_reason !== 'config'"
            variant="outline-danger"
            @click="removeApp(detailItem.name)">Remove
        </b-button>
        <span v-else></span>
      </template>

      <b-table
          :fields="[{key: '0', label: 'property'}, {key: '1', label: 'value'}]"
          :items="Object.entries(detailItem)">
      </b-table>
    </b-modal>

    <!-- Modal: custom app -->
    <b-modal id="custom-app" title="Install Custom App">
      <b-form>
        <b-form-group>
          <b-form-textarea rows="18" v-model="customApp"></b-form-textarea>
          <b-form-text>
            Enter the app definition in JSON format. Take a look at the <a href="https://gitlab.com/ptl-public/app-repository">App Repository</a> for hints.
          </b-form-text>
        </b-form-group>
      </b-form>

      <template #modal-footer>
        <b-button variant="outline-success" @click="addApp">
          Install
        </b-button>
      </template>
    </b-modal>

  </div>
</template>

<script>
import Navbar from "@/components/Navbar";
import AppStoreEntry from "@/components/AppStoreEntry";

export default {
  name: "Apps",
  components: {AppStoreEntry, Navbar},
  data: function () {
    return {
      apps: [],
      fields: [
        {key: 'iconname', sortable: true, label: 'Name'},
        {key: 'status', sortable: true},
        {key: 'image', sortable: true},
        {key: 'installation_reason', sortable: true},
      ],

      detailItem: {},

      customApp: {
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

      store: {
        apps: [],
        customBranch: '',
        updating: false,
      },
    }
  },

  methods: {
    refreshApps() {
      let component = this;
      this.$http.get('/core/app_controller/protected/apps')
          .then(function (response) {
            component.apps = response.data;
          })
          .catch(function (response) {
            console.log(response)
          })
    },

    refreshStore() {
      let component = this;
      return this.$http.get('/core/app_controller/protected/store/apps')
          .then(function (response) {
            component.store.apps = response.data;
          })
          .catch(function (response) {
            console.log(response)
          })
    },

    showDetails(item) {
      this.detailItem = item;
      this.$bvModal.show('apps-details');
    },

    removeApp(name) {
      this.$bvModal.hide('apps-details');
      let component = this;
      this.$http.delete(`/core/app_controller/protected/apps/${name}`)
          .then(function () {
            component.refreshApps();
          })
    },

    addApp() {
      this.$bvModal.hide('custom-app');
      let component = this;
      const customAppJson = JSON.parse(this.customApp)
      this.$http.post(`/core/app_controller/protected/apps/${customAppJson.name}`, this.customApp)
          .then(function () {
            component.refreshApps();
            component.refreshStore();
          })
    },

    hardRefreshStore(branchName) {
      this.store.updating = true;
      this.$http.post(`/core/app_controller/protected/store/ref?ref=${branchName}`)
      .then(() => this.refreshStore()
          .then(this.store.updating = false))
      .catch(() => this.hardRefreshStore('master'))
    },

  },

  mounted() {
    this.refreshApps();
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