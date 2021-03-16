<template>
  <div>
    <navbar></navbar>
    <h1>Apps</h1>

    <b-table :fields="fields" :items="apps" hover primary-key="name">
      <template #cell(iconname)="data">
        <img
            :src="`/core/app_controller/protected/apps/${data.item.name}/icon`"
            alt="🔲"
            class="icon">
        <a class="text-capitalize pl-1" @click="showDetails(data.item)">{{ data.item.name }}</a>
      </template>
    </b-table>

    <p class="text-center">
      <b-button v-b-modal:add-app variant="success">
        <b-icon-plus-circle-fill></b-icon-plus-circle-fill>
        Add
      </b-button>
    </p>


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

    <b-modal id="add-app" title="Add App">
      <p>
        Add an app by providing a docker image and tag.
        You can give it any name you want.
        Provide a data dir for Portal to mount an empty host directory.
        That way, your app can persist its data.
      </p>

      <b-form>
        <b-form-group label="Name">
          <b-input v-model="appToAdd.name"></b-input>
        </b-form-group>
        <b-form-group label="Image">
          <b-input v-model="appToAdd.image"></b-input>
        </b-form-group>
        <b-form-group label="Version">
          <b-input v-model="appToAdd.version"></b-input>
        </b-form-group>
        <b-form-group label="Data Dir">
          <b-input v-model="appToAdd.data_dir"></b-input>
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

export default {
  name: "Apps",
  components: {Navbar},
  data: function () {
    return {
      apps: [],
      fields: [
        {key: 'iconname', sortable: true, label: 'Name'},
        {key: 'version', sortable: true},
        {key: 'installation_reason', sortable: true},
      ],

      detailItem: {},

      appToAdd: {
        name: '',
        image: '',
        version: '',
        data_dir: '',
      },
    }
  },

  methods: {
    refresh() {
      let component = this;
      this.$http.get('/core/app_controller/protected/apps')
          .then(function (response) {
            component.apps = response.data;
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
            component.refresh();
          })
    },

    addApp() {
      this.$bvModal.hide('add-app');
      let component = this;
      this.$http.post(`/core/app_controller/protected/apps/${this.appToAdd.name}`, this.appToAdd)
          .then(function () {
            component.refresh();
          })
    },

  },

  mounted() {
    this.refresh();
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