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
          Browse to <a :href="$store.getters.portal_href">{{ $store.getters.portal_domain }}</a> on another device and use this <b>one-time pairing code</b> to pair them.
        </b-tooltip>

      </b-row>
      <b-row>

        <b-col>
          <b-table :items="terminals" :fields="terminals_fields" hover>

            <template #cell(name)="data">
              <span class="text-monospace">{{ data.value }} </span>
              <b-badge
                  v-if="isThisTerminal(data.item.id)"
                  variant="primary">
                This
              </b-badge>
            </template>

            <template #cell(actions)="data">
              <b-button
                  variant="danger" size="sm"
                  v-if="!isThisTerminal(data.item.id)"
                  @click="deleteTerminal(data.item.id)">
                <b-icon-trash></b-icon-trash>
              </b-button>
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
      terminals_fields: ['name', {key: 'actions', label: '', class: 'text-right'}],
      pairing: {
        code: null,
        loading: false,
      },
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
    },

    deleteTerminal(id) {
      let component = this;
      this.$http.delete(`/core/identity_handler/protected/terminals/id/${id}`)
          .then(function () {
            component.refreshTerminals();
          })
          .catch(function (response) {
            console.log(response);
          });
    },

    refreshTerminals() {
      let component = this;
      this.$http.get('/core/identity_handler/protected/terminals')
          .then(function (response) {
            component.terminals = response.data;
          })
          .catch(function (response) {
            console.log(response)
          })
    },

    isThisTerminal(id) {
      return this.$store.state.meta.terminal_id.substring(0, 6) === id;
    }
  },

  mounted: function () {
    this.refreshTerminals();
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