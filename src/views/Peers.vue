<template>
  <div>
    <navbar></navbar>
    <b-container class="mt-4">
      <b-row>

        <b-col>
          <h1>Peers</h1>
        </b-col>

        <b-col class="text-right" cols="auto">

          <b-button v-if="addPeer.state === 'off'" variant="success" @click="addPeer.state='on'">
            <b-icon-plus-circle-fill></b-icon-plus-circle-fill>
            <span> Add Peer</span>
          </b-button>

          <b-input-group v-else class="peer-id-input">
            <b-form-input
                :disabled="addPeer.state === 'syncing'"
                class="text-monospace"
                v-model="addPeer.peerId"
            ></b-form-input>
            <b-input-group-append>
              <b-button variant="success" @click="putPeer" :disabled="addPeer.state === 'syncing'">
                <b-icon-plus-circle-fill></b-icon-plus-circle-fill>
              </b-button>
            </b-input-group-append>
          </b-input-group>

        </b-col>

      </b-row>

      <b-row>
        <b-col>
          <b-table :items="peers" :fields="peerFields">
            <template #cell(id)="data">
              <a :href="`https://${data.value}.p.getportal.org`" target="_blank">{{ data.value }}</a>
            </template>
            <template #cell(name)="data">
              {{ data.value || '[Unknown]' }}
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
  name: "Peers",
  components: { Navbar},
  data: function () {
    return {
      addPeer: {
        state: 'off', // off | on | syncing,
        peerId: '',
      },
      peers: [],
      peerFields: ['name', 'id'],
    }
  },

  methods: {
    async refresh() {
      const response = await this.$http.get('/core/protected/peers')
      this.peers = response.data;
    },
    async putPeer() {
      try {
        await this.$http.put('/core/protected/peers', {id: this.addPeer.peerId});
      } catch (e) {
        console.log(e);
      }
      await this.refresh();
      this.addPeer = {state: 'off', peerId: ''};
    },
  },

  async mounted() {
    document.title = `Portal [${this.$store.getters.short_portal_id}] - Peers`;
    await this.refresh();
  }
}
</script>

<style scoped>

.peer-id-input {
  width: 10em;
}

</style>
