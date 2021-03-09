<template>
  <div>
    <navbar></navbar>
    <h1>Apps</h1>

    <b-table :items="apps" :fields="fields" primary-key="name" hover>
      <template #cell(iconname)="data">
        <img :alt="data.item.name" :src="`/core/app_controller/protected/apps/${data.item.name}/icon`" class="icon">
        <a @click="showDetails(data.item)" class="text-capitalize pl-1">{{ data.item.name }}</a>
      </template>
    </b-table>

    <b-modal id="apps-details">
      <template #modal-header>
        <span class="text-capitalize">
          {{ detailItem.name }}
        </span>
      </template>

      <template #modal-footer>
        <b-button variant="outline-danger" @click="removeApp(detailItem.name)">Remove</b-button>
      </template>

      <b-table
          :items="Object.entries(detailItem)"
          :fields="[{key: '0', label: 'property'}, {key: '1', label: 'value'}]">
      </b-table>
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
      let component = this;
      this.$http.delete(`/core/app_controller/protected/apps/${name}`)
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