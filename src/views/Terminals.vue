<template>
  <div>
    <navbar></navbar>
    <b-container class="mt-4">
      <b-row>

        <b-col>
          <h1>Terminals</h1>
        </b-col>

      </b-row>

      <b-row align-v="stretch" class="flex-grow-1">
        <b-col>
          <b-container id="terminal-container">
            <!-- Entries -->
            <b-row cols="1" cols-md="2">
              <b-col v-for="terminal in $store.state.terminals" :key="terminal.id" class="p-1">
                <TerminalCard :terminal="terminal"></TerminalCard>
              </b-col>
            </b-row>
            <b-row align-h="center">
              <b-button id="add-button" variant="success" @click="startPairing" size="lg">
                <b-icon-plus-circle-fill></b-icon-plus-circle-fill>
                <span> Pair terminal</span>
              </b-button>
            </b-row>
          </b-container>
        </b-col>
      </b-row>

    </b-container>

    <b-modal id="new-terminal-modal" title="Pair new terminal" hide-footer @hidden="stopPairing">
      <b-spinner v-if="pairing.loading"></b-spinner>
      <p v-else-if="pairing.error">
        {{ pairing.error }}
      </p>
      <div v-else-if="pairingCodeValidityProgress===0">
        <p>Pairing code expired</p>
        <b-button @click="startPairing" variant="primary">
          <b-icon-arrow-clockwise></b-icon-arrow-clockwise>
          <span> Refresh</span>
        </b-button>
      </div>
      <div v-else>
        <b-progress height="0.2em">
          <b-progress-bar :value="pairingCodeValidityProgress"></b-progress-bar>
        </b-progress>
        <p>Scan this QR-code with another terminal to pair it</p>
        <qrcode-vue :value="pairingLink" size="150"></qrcode-vue>
        <HorizontalSeparator title="or"></HorizontalSeparator>
        <p>Navigate to <a :href="$store.getters.portal_href">{{ $store.state.meta.portal_identity.domain }}</a> and use
          the one-time
          pairing code</p>
        <p>
          <b-form-input
              id="pairing-code-box"
              :value="pairingCode"
              class="text-monospace"
              readonly></b-form-input>
        </p>
      </div>
    </b-modal>

    <v-tour name="TerminalsTour" :steps="tourSteps" :options="{highlight: true}"></v-tour>
  </div>
</template>

<script>
import Navbar from "@/components/Navbar";
import HorizontalSeparator from "@/components/HorizontalSeparator";
import moment from "moment/moment";
import TerminalCard from "@/components/TerminalCard.vue";
import {EventBus} from "@/event-bus";

export default {
  name: "Terminals",
  components: {TerminalCard, HorizontalSeparator, Navbar},
  data: function () {
    return {
      pairing: {
        code: null,
        loading: false,
        error: null,
        updateTimer: null,
        now: null,
      },
      tourSteps: [
        {
          target: '#terminal-container',
          content: 'Here you can see and manage your paired terminals. They are the terminals from which you can control your Portal.'
        },
        {
          target: '#this-badge',
          content: 'The terminal that you currently use is marked.'
        },
        {
          target: '#add-button',
          content: 'It is a good idea to also pair other terminals that you own so you may access your Portal through them, too. ' +
              'Click here and follow the steps.'
        },
      ],
    }
  },

  computed: {
    pairingCode() {
      return this.pairing.code ? this.pairing.code.code : 'unknown';
    },
    pairingLink() {
      if (this.pairing.code) {
        return `https://${this.$store.state.meta.portal_identity.domain}/#/pair?code=${this.pairing.code.code}`;
      } else {
        return `https://${this.$store.state.meta.portal_identity.domain}`;
      }
    },
    pairingCodeValidityProgress() {
      if (this.pairing.code && this.pairing.now) {
        const validStart = moment.utc(this.pairing.code.created);
        const validEnd = moment.utc(this.pairing.code.valid_until);
        const totalSeconds = moment.duration(validEnd.diff(validStart)).asSeconds();
        const elapsedSeconds = moment.duration(validEnd.diff(this.pairing.now)).asSeconds();
        return Math.max(elapsedSeconds / totalSeconds * 100, 0);
      } else {
        return 100;
      }

    },
  },

  methods: {
    async startPairing() {
      await this.stopPairing();
      this.$bvModal.show('new-terminal-modal')
      this.pairing.loading = true;
      try {
        const response = await this.$http.get('/core/protected/terminals/pairing-code');
        this.pairing.code = response.data;
        this.pairing.updateTimer = setInterval(() => this.pairing.now = moment(), 1000);
      } catch (e) {
        this.pairing.error = e;
      } finally {
        this.pairing.loading = false;
      }
      EventBus.$once('terminal_add', this.stopPairing);
    },

    async stopPairing() {
      clearInterval(this.pairing.updateTimer);
      this.$bvModal.hide('new-terminal-modal');
    },

    async deleteTerminal(id) {
      await this.$http.delete(`/core/protected/terminals/id/${id}`);
    },

  },

  async mounted() {
    document.title = `Portal [${this.$store.getters.short_portal_id}] - Devices`;
    await this.$store.dispatch("refresh_terminals");
    if (!this.$store.getters.tour_seen('terminals')) {
      this.$tours['TerminalsTour'].start();
      await this.$store.dispatch('mark_tour_as_seen', 'terminals');
    }
  }
}
</script>

<style scoped>

.modal-body div {
  text-align: center;
}

#pairing-code-box {
  width: 6em;
  display: inline-flex;
  text-align: center;
}

.progress {
  margin-top: -1rem;
  margin-left: -1rem;
  margin-right: -1rem;
}

</style>
