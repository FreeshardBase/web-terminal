<template>
  <div>
    <navbar></navbar>
    <h1>Terminals</h1>
    <b-table :items="terminals" hover></b-table>

    <b-button variant="primary" @click="newPairingCode">Add Terminal</b-button>
    <div v-if="pairingCodeLoading || pairingCode">
      <p>
        Browse to {{ hostname }} on your new terminal and use this pairing code to pair it.
      </p>
      <p>
        <b-skeleton-wrapper :loading="pairingCodeLoading">
          <template #loading>
            <b-skeleton width="4em"></b-skeleton>
          </template>
          <span v-if="pairingCode"><strong>{{ pairingCode.code }}</strong></span>
        </b-skeleton-wrapper>
      </p>
    </div>
  </div>
</template>

<script>
import Navbar from "@/components/Navbar";

export default {
  name: "Terminals",
  components: {Navbar},
  data: function () {
    return {
      terminals: [],
      pairingCode: null,
      pairingCodeLoading: false,
    }
  },

  computed: {
    hostname() {
      return document.location.hostname
    },
  },

  methods: {
    newPairingCode() {
      let component = this;
      this.pairingCodeLoading = true;
      this.$http.get('/core/identity_handler/protected/terminals/pairing-code')
          .then(function (response) {
            component.pairingCode = response.data;
            component.pairingCodeLoading = false;
          })
          .catch(function (response) {
            console.log(response)
            component.pairingCodeLoading = false;
          })
    }
  },

  mounted: function () {
    let component = this;
    this.$http.get('/core/identity_handler/protected/terminals')
        .then(function (response) {
          component.terminals = response.data;
        })
        .catch(function (response) {
          console.log(response)
        })
  }
}
</script>

<style scoped>

</style>