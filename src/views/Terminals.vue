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
          <b-button id="add-button" v-if="!pairing.code" variant="success" @click="newPairingCode">
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
          <b-table id="terminals-table" :items="terminals" :fields="terminals_fields" hover>

            <template #cell(name)="data">
              <span class="text-monospace">{{ data.value }} </span>
              <b-badge
                  id="this-badge"
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
    <v-tour name="TerminalsTour" :steps="tourSteps" :options="{highlight: true}"></v-tour>
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
      tourSteps: [
        {
          target: '#terminals-table',
          content: 'Here you can see and manage your terminals. They are the devices from which you can control your Portal.'
        },
        {
          target: '#this-badge',
          content: 'The terminal that you currently use is marked.'
        },
        {
          target: '#add-button',
          content: 'It is a good idea to also pair other devices that you own so you may access your Portal through them, too. Click here and follow the steps in to tooltip.'
        },
      ],
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
      this.$http.get('/core/protected/terminals/pairing-code')
          .then(function (response) {
            component.pairing.code = response.data;
            component.pairing.loading = false;
          })
          .catch(function (response) {
            console.log(response)
            component.pairing.loading = false;
          })
    },

    async deleteTerminal(id) {
      let component = this;
      await this.$http.delete(`/core/protected/terminals/id/${id}`)
      await component.refreshTerminals();
    },

    async refreshTerminals() {
      let component = this;
      const response = await this.$http.get('/core/protected/terminals')
      component.terminals = response.data;
    },

    isThisTerminal(id) {
      return this.$store.state.meta.terminal_id.substring(0, 6) === id;
    }
  },

  async mounted() {
    await this.refreshTerminals();
    if (!this.$store.getters.tour_seen('terminals')) {
      this.$tours['TerminalsTour'].start();
      await this.$store.dispatch('mark_tour_as_seen', 'terminals');
    }
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