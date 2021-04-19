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
              <b-overlay :show="store.branch.updating" rounded="sm" variant="white" class="w-100 p-1">
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
                    <b-dropdown class="m-2" dropup no-caret right text="Drop-Up" variant="outline-secondary">
                      <template #button-content>
                        <b-icon-gear-fill></b-icon-gear-fill>
                      </template>
                      <b-dropdown-item>
                        <b-button v-b-modal:add-app variant="success">
                          <b-icon-plus-circle-fill></b-icon-plus-circle-fill>
                          Install Custom
                        </b-button>
                      </b-dropdown-item>
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

    <!-- Modal: add app -->
    <b-modal id="add-app" title="Install App">
      <b-form>
        <b-form-group
            description="Name the app however you want. It will be accessible at <app-name>.<portal-id>.p.getportal.org."
            label="Name">
          <b-input v-model="appToAdd.name"></b-input>
        </b-form-group>

        <b-form-group
            description="The identifier of the docker image, optionally including version tag."
            label="Image">
          <b-input v-model="appToAdd.image"></b-input>
        </b-form-group>

        <b-form-group
            description="The port at which the image hosts its web-UI."
            label="Web-UI Port">
          <b-input v-model="appToAdd.port"></b-input>
        </b-form-group>

        <b-form-group
            description="The container's directories where persistent volumes should be mounted."
            label="Data Dir">
          <template v-for="(dir, index) in appToAdd.data_dirs">
            <b-input-group :key="index">
              <b-form-input v-model="appToAdd.data_dirs[index]"></b-form-input>
              <b-input-group-append>
                <b-button variant="danger" @click="appToAdd.data_dirs.splice(index, 1)">
                  <b-icon-trash></b-icon-trash>
                </b-button>
              </b-input-group-append>
            </b-input-group>
          </template>
          <b-button variant="success" @click="appToAdd.data_dirs.push('')">
            <b-icon-plus-circle-fill></b-icon-plus-circle-fill>
          </b-button>
        </b-form-group>

        <b-form-group
            description="Environment variables to be set inside the container"
            label="Environment Vars">
          <template v-for="(entry, index) in appToAdd.env_vars">
            <b-input-group :key="index">
              <b-form-input v-model="entry.key"></b-form-input>
              <b-form-input v-model="entry.value"></b-form-input>
              <b-input-group-append>
                <b-button variant="danger" @click="appToAdd.env_vars.splice(index, 1)">
                  <b-icon-trash></b-icon-trash>
                </b-button>
              </b-input-group-append>
            </b-input-group>
          </template>
          <b-button variant="success" @click="appToAdd.env_vars.push({'key': '', 'value': ''})">
            <b-icon-plus-circle-fill></b-icon-plus-circle-fill>
          </b-button>
        </b-form-group>
      </b-form>

      <template #modal-footer>
        <b-button variant="success" @click="addApp">
          <b-icon-plus-circle-fill></b-icon-plus-circle-fill>
          Add
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

      appToAdd: {
        name: '',
        image: '',
        port: '',
        data_dirs: [],
        env_vars: [],
      },

      store: {
        apps: [],
        branch: {
          selected: 'master',
          updating: false,
          options: ['master', 'develop']
        }
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
      this.$bvModal.hide('add-app');
      let component = this;
      this.$http.post(`/core/app_controller/protected/apps/${this.appToAdd.name}`, this.appToAdd)
          .then(function () {
            component.refreshApps();
            component.refreshStore();
          })
    },

  },

  watch: {
    'store.branch.selected': function () {
      this.store.branch.updating = true;
      this.$http.post(`/core/app_controller/protected/store/ref?ref=${this.store.branch.selected}`)
      .then(() => this.refreshStore()
          .then(this.store.branch.updating = false))
    }
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