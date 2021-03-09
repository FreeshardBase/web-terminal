<template>
  <div>
    <navbar></navbar>
    <h1>Apps</h1>
    <b-table :items="apps" :fields="fields" primary-key="name" hover>
      <template #cell(iconname)="data">
        <img :alt="data.item.name" :src="`/core/app_controller/protected/apps/${data.item.name}/icon`" class="icon">
        <span class="text-capitalize pl-1">{{ data.item.name }}</span>
      </template>
    </b-table>
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
      ]
    }
  },

  mounted() {
    let component = this;
    this.$http.get('/core/app_controller/protected/apps')
    .then(function (response) {
      component.apps = response.data;
    })
    .catch(function (response) {
      console.log(response)
    })
  }
}
</script>

<style scoped>

.icon {
  height: 1.5em;
}

</style>