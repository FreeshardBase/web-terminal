<template>
  <div>
    <navbar></navbar>
    <b-container class="mt-4">
      <b-row>

        <b-col>
          <h1>Terminals</h1>
        </b-col>

        <b-col class="text-right">
          <b-form-input
              id="pairing-code-box"
              v-show="pairing.code"
              :value="pairing.code ? pairing.code.code : ''"
              class="text-monospace"
              readonly></b-form-input>
          <b-button v-if="!pairing.code" variant="success" @click="newPairingCode">
            <b-spinner small v-if="pairing.loading"></b-spinner>
            <b-icon-plus-circle-fill v-else></b-icon-plus-circle-fill>
            <span> Add</span>
          </b-button>
        </b-col>

        <b-tooltip target="pairing-code-box" triggers="hover" placement="leftbottom">
          Open your Portal on another device and use this pairing code to turn it into a <i>Terminal</i>.
        </b-tooltip>

      </b-row>
      <b-row>

        <b-col>
          <b-table :items="terminals" hover>

            <template #cell(id)="data">
              <span class="text-monospace">{{ data.value }} </span>
              <b-badge
                  v-if="$store.state.meta.terminal_id.substring(0, 6) === data.value"
                  variant="primary">
                This
              </b-badge>
            </template>

          </b-table>
        </b-col>
      </b-row>

    </b-container>
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
      pairing: {
        code: null,
        loading: false,
      },
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
      this.pairing.loading = true;
      this.$http.get('/core/identity_handler/protected/terminals/pairing-code')
          .then(function (response) {
            component.pairing.code = response.data;
            component.pairing.loading = false;
          })
          .catch(function (response) {
            console.log(response)
            component.pairing.loading = false;
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

#pairing-code-box {
  width: 6em;
  text-align: center;
  display: inline-block;
}

</style>