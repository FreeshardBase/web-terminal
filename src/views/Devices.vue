<template>
  <div>
    <navbar></navbar>
    <b-container class="mt-4">
      <b-row>

        <b-col>
          <h1>Devices</h1>
        </b-col>

        <b-col class="text-right">
          <b-button variant="outline-secondary">
            <b-icon-arrow-repeat @click="refreshDevices"></b-icon-arrow-repeat>
          </b-button>
          &nbsp;
          <b-button id="add-button" variant="success" @click="startPairing">
            <b-icon-plus-circle-fill></b-icon-plus-circle-fill>
            <span> Pair Device</span>
          </b-button>
        </b-col>

      </b-row>

      <b-row align-v="stretch" class="flex-grow-1">
        <b-col>
          <b-container id="device-container">
            <!-- Entries -->
            <b-row cols="2">
              <b-col v-for="device in devices" :key="device.name" class="p-1">
                <DeviceCard :device="device" @refresh="refreshDevices"></DeviceCard>
              </b-col>
            </b-row>
          </b-container>
        </b-col>
      </b-row>

    </b-container>

    <b-modal id="new-device-modal" title="Pair new Device" hide-footer @hidden="stopPairing">
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
        <p>Scan this CR-code with another device to pair it</p>
        <qrcode-vue :value="pairingLink" size="150"></qrcode-vue>
        <HorizontalSeparator title="or"></HorizontalSeparator>
        <p>Navigate to <a :href="$store.getters.portal_href">{{ $store.getters.portal_domain }}</a> and use the one-time
          pairing code</p>
        <p><b-form-input
            id="pairing-code-box"
            :value="pairingCode"
            class="text-monospace"
            readonly></b-form-input></p>
      </div>
    </b-modal>

    <v-tour name="DevicesTour" :steps="tourSteps" :options="{highlight: true}"></v-tour>
  </div>
</template>

<script>
import Navbar from "@/components/Navbar";
import HorizontalSeparator from "@/components/HorizontalSeparator";
import moment from "moment/moment";
import DeviceCard from "@/components/DeviceCard";

export default {
  name: "Devices",
  components: {DeviceCard, HorizontalSeparator, Navbar},
  data: function () {
    return {
      devices: [],
      devices_fields: ['name', {key: 'actions', label: '', class: 'text-right'}],
      pairing: {
        code: null,
        loading: false,
        error: null,
        updateTimer: null,
        now: null,
      },
      tourSteps: [
        {
          target: '#device-container',
          content: 'Here you can see and manage your paired devices. They are the devices from which you can control your Portal.'
        },
        {
          target: '#this-badge',
          content: 'The device that you currently use is marked.'
        },
        {
          target: '#add-button',
          content: 'It is a good idea to also pair other devices that you own so you may access your Portal through them, too. ' +
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
        return `https://${this.$store.getters.portal_domain}/#/helloworld?code=${this.pairing.code.code}`;
      } else {
        return `https://${this.$store.getters.portal_domain}`;
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
      this.$bvModal.show('new-device-modal')
      this.pairing.loading = true;
      try {
        const response = await this.$http.get('/core/protected/terminals/pairing-code');
        this.pairing.code = response.data;
        this.pairing.updateTimer = setInterval(() => this.pairing.now = moment(), 1000);
      } catch (e) {
        this.pairing.error = e;
        return;
      } finally {
        this.pairing.loading = false;
      }
    },

    async stopPairing() {
      await this.refreshDevices();
      clearInterval(this.pairing.updateTimer);
    },

    async deleteDevice(id) {
      let component = this;
      await this.$http.delete(`/core/protected/terminals/id/${id}`)
      await component.refreshDevices();
    },

    async refreshDevices() {
      let component = this;
      const response = await this.$http.get('/core/protected/terminals')
      component.devices = response.data;
    },
  },

  async mounted() {
    document.title = `Portal [${this.$store.getters.short_portal_id}] - Devices`;
    await this.refreshDevices();
    if (!this.$store.getters.tour_seen('devices')) {
      this.$tours['DevicesTour'].start();
      await this.$store.dispatch('mark_tour_as_seen', 'devices');
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