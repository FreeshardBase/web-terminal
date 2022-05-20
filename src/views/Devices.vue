<template>
  <div>
    <navbar></navbar>
    <b-container class="mt-4">
      <b-row>

        <b-col>
          <h1>Devices</h1>
        </b-col>

        <b-col class="text-right">
          <b-button id="add-button" variant="success" @click="startPairing">
            <b-icon-plus-circle-fill></b-icon-plus-circle-fill>
            <span> Add</span>
          </b-button>
        </b-col>

        <b-tooltip target="pairing-code-box" triggers="hover" placement="leftbottom">
          Browse to <a :href="$store.getters.portal_href">{{ $store.getters.portal_domain }}</a> on another device and use this <b>one-time pairing code</b> to pair them.
        </b-tooltip>

      </b-row>
      <b-row>

        <b-col>
          <b-table id="devices-table" :items="devices" :fields="devices_fields" hover>

            <template #cell(name)="data">
              <span class="text-monospace">{{ data.value }} </span>
              <b-badge
                  id="this-badge"
                  v-if="isThisDevice(data.item.id)"
                  variant="primary">
                This
              </b-badge>
            </template>

            <template #cell(actions)="data">
              <b-button
                  variant="danger" size="sm"
                  v-if="!isThisDevice(data.item.id)"
                  @click="deleteDevice(data.item.id)">
                <b-icon-trash></b-icon-trash>
              </b-button>
            </template>

          </b-table>
        </b-col>
      </b-row>

    </b-container>

    <b-modal id="new-device-modal">
      <b-spinner v-if="pairing.loading"></b-spinner>
      <p v-else-if="pairing.error">
        {{ pairing.error }}
      </p>
      <div v-else>
        <qrcode-vue :value="pairingLink" size="150"></qrcode-vue>
        {{ pairing.code }}
      </div>
    </b-modal>

    <v-tour name="DevicesTour" :steps="tourSteps" :options="{highlight: true}"></v-tour>
  </div>
</template>

<script>
import Navbar from "@/components/Navbar";

export default {
  name: "Devices",
  components: {Navbar},
  data: function () {
    return {
      devices: [],
      devices_fields: ['name', {key: 'actions', label: '', class: 'text-right'}],
      pairing: {
        code: null,
        loading: false,
        error: null,
      },
      tourSteps: [
        {
          target: '#devices-table',
          content: 'Here you can see and manage your paired devices. They are the devices from which you can control your Portal.'
        },
        {
          target: '#this-badge',
          content: 'The device that you currently use is marked.'
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
    pairingLink() {
      if (this.pairing.code) {
        return `https://${this.$store.getters.short_portal_id}.p.getportal.org/#/helloworld?code=${this.pairing.code.code}`;
      } else {
        return `https://${this.$store.getters.short_portal_id}.p.getportal.org`;
      }
    }
  },

  methods: {
    async startPairing() {
      this.$bvModal.show('new-device-modal')
      this.pairing.loading = true;
      try {
        const response = await this.$http.get('/core/protected/terminals/pairing-code');
        this.pairing.code = response.data;
      } catch (e) {
        this.pairing.error = e;
      } finally {
        this.pairing.loading = false;
      }
    },

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

    isThisDevice(id) {
      return this.$store.state.meta.device_id.substring(0, 6) === id;
    }
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

#pairing-code-box {
  width: 6em;
  text-align: center;
  display: inline-block;
}

</style>