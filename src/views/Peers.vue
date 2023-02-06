<template>
  <div>
    <navbar></navbar>
    <b-container class="mt-4">
      <b-row>

        <b-col>
          <h1>Peers</h1>
        </b-col>

        <b-col class="text-right" cols="auto">

          <b-button v-if="addPeer.state === 'off'" variant="success" @click="addPeer.state='on'" id="add-peer-button">
            <b-icon-plus-circle-fill></b-icon-plus-circle-fill>
            <span> Add peer</span>
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
          <b-table :items="peers" :fields="peerFields" hover id="peers-table">
            <template #cell(id)="data">
              <a :href="`https://${data.value}.p.getportal.org`" target="_blank">{{ data.value }}</a>
            </template>
            <template #cell(name)="data">
              {{ data.value || '[Unknown]' }}
            </template>
            <template #cell(actions)="data">
              <b-button-group>
                <b-button
                    variant="outline-secondary" size="sm"
                    @click="refreshPeer(data.item.id)">
                  <b-icon-arrow-clockwise></b-icon-arrow-clockwise>
                </b-button>
                <b-button
                    variant="outline-danger" size="sm"
                    @click="deletePeer(data.item.id)">
                  <b-icon-trash></b-icon-trash>
                </b-button>
              </b-button-group>
            </template>
          </b-table>
        </b-col>
      </b-row>

    </b-container>

    <v-tour name="PeersTour" :steps="tourSteps" :options="{highlight: true}"></v-tour>
  </div>
</template>

<script>
import Navbar from "@/components/Navbar";

export default {
  name: "Peers",
  components: {Navbar},
  data: function () {
    return {
      addPeer: {
        state: 'off', // off | on | syncing,
        peerId: '',
      },
      peers: [],
      peerFields: [
        'name',
        {key: 'id', formatter: value => value.substring(0, 6)},
        {key: 'actions', label: '', class: 'text-right'}
      ],
      tourSteps: [
        {
          target: '#peers-table',
          content: 'This is where your peers are listed. Every Peer is another Portal ' +
              'and after mutual peering, apps that are installed on both Portals ' +
              'can use an encrypted channel to exchange data.<br>' +
              'In addition, your peer list serves as a kind of contact book.'
        },
        {
          target: '#add-peer-button',
          content: 'To add peers, click here and enter their ID. ' +
              'Your own ID is displayed in the top left and for others to peer with you, they need to know it.'
        }
      ],
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
    async deletePeer(id) {
      await this.$http.delete(`/core/protected/peers/${id}`);
      await this.refresh();
    },
    async refreshPeer(id) {
      await this.$http.put('/core/protected/peers', {id});
      await this.refresh();
    },
  },

  async mounted() {
    document.title = `Portal [${this.$store.getters.short_portal_id}] - Peers`;
    await this.refresh();
    if (!this.$store.getters.tour_seen('peers')) {
      this.$tours['PeersTour'].start();
      await this.$store.dispatch('mark_tour_as_seen', 'peers');
    }
  }
}
</script>

<style scoped>

.peer-id-input {
  width: 10em;
}

</style>
