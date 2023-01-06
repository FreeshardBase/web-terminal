<template>
  <div>
    <navbar></navbar>
    <b-container class="mt-4">

      <b-row>
        <b-col>
          <h1>Settings</h1>
        </b-col>
      </b-row>

      <b-row>
        <b-col>
          <b-card title="Backup">
            <b-card-text>
              Download a zip archive containing all of your Portal's personal data.
            </b-card-text>
            <b-button variant="primary" href="/core/protected/backup/export">
              <b-icon-download></b-icon-download>
              Download
            </b-button>
          </b-card>
        </b-col>
      </b-row>

      <b-row>
        <b-col>
          <b-card title="Restart">
            <b-card-text>
              Restart this Portal. Download and install a new software version if available.
            </b-card-text>
            <b-button @click="restartPortal" variant="primary">
              <b-icon-arrow-clockwise></b-icon-arrow-clockwise>
              Restart
            </b-button>
          </b-card>
        </b-col>
      </b-row>

      <b-row>
        <b-col>
          <b-card title="Tour">
            <b-card-text>
              Reset the guided tour through your Portal's features so you can look at it again.
            </b-card-text>
            <b-button @click="resetTour" variant="primary">
              <b-icon-caret-left></b-icon-caret-left>
              Reset
            </b-button>
          </b-card>
        </b-col>
      </b-row>

      <b-row>
        <b-col>
          <h1>About</h1>
        </b-col>
        <b-col class="text-right">
          <b-button variant="outline-secondary">
            <b-icon-arrow-repeat @click="refresh"></b-icon-arrow-repeat>
          </b-button>
        </b-col>
      </b-row>

      <b-overlay :show="isUpdating" rounded="sm" variant="white" class="w-100 p-1">
        <b-row>

          <b-col>
            <TextField title="Machine ID" :content="profile.vm_id || 'unknown'"/>
            <TextField title="Portal ID" :content="portalIdWithBreaks || 'unknown'"
                       class="text-monospace"/>
            <TextField title="Owner" :content="profile.owner || 'unknown'"/>
            <TextField title="Owner Email" :content="profile.owner_email || 'unknown'"/>
            <TextField title="Created" :content="profile.time_created | formatDateHumanize"/>
            <TextField title="Assigned" :content="profile.time_assigned | formatDateHumanize"/>
            <TextField v-if="profile.delete_after" title="Scheduled to delete"
                       :content="profile.delete_after | formatDateHumanize"/>
            <TextField v-else title="Scheduled to delete" content="never"/>

            <div>
              <span><small>Size</small></span>
              <small>
                <b-list-group horizontal>
                  <b-list-group-item :class="{'list-group-item-primary': profile.portal_size === 'xs'}">XS
                  </b-list-group-item>
                  <b-list-group-item :class="{'list-group-item-primary': profile.portal_size === 's'}">S
                  </b-list-group-item>
                  <b-list-group-item :class="{'list-group-item-primary': profile.portal_size === 'm'}">M
                  </b-list-group-item>
                  <b-list-group-item :class="{'list-group-item-primary': profile.portal_size === 'l'}">L
                  </b-list-group-item>
                  <b-list-group-item :class="{'list-group-item-primary': profile.portal_size === 'xl'}">XL
                  </b-list-group-item>
                </b-list-group>
              </small>
            </div>

            <TextField title="Public Key" :content="$store.state.meta.portal_identity.public_key_pem || 'unknown'"
                       class="text-monospace"/>

          </b-col>

        </b-row>
      </b-overlay>
    </b-container>
  </div>
</template>

<script>
import Navbar from "@/components/Navbar";
import TextField from "@/views/TextField.vue";

export default {
  name: "Settings",
  components: {TextField, Navbar},

  data: function () {
    return {
      isUpdating: false,
      profile: {},
    }
  },

  computed: {
    portalIdWithBreaks() {
      const segmentLength = 16;
      let pid = this.$store.state.meta.portal_identity.id;
      let result = '';
      while (pid.length > segmentLength) {
        console.log(pid);
        result = result.concat(pid.slice(0, segmentLength)).concat('\n');
        pid = pid.slice(segmentLength);
      }
      return result;
    }
  },

  methods: {
    async refresh() {
      this.isUpdating = true;
      try {
        const response = await this.$http.get('core/protected/management/profile');
        this.profile = response.data;
      } catch (e) {
        console.log(e.response);
        this.$bvToast.toast(e.response.data.detail, {
          title: 'Error during loading',
          autoHideDelay: 5000,
          appendToast: true,
          solid: true,
          variant: 'danger',
        });
      } finally {
        this.isUpdating = false;
      }
    },
    async resetTour() {
      try {
        await this.$http.delete('/core/protected/help/tours');
      } finally {
        await this.$store.dispatch('query_tour_data');
      }
    },
    async restartPortal() {
      await this.$http.post('/core/protected/restart');
    },
  },

  async mounted() {
    document.title = `Portal [${this.$store.getters.short_portal_id}] - About`;
    await this.refresh();
  },
}
</script>

<style>

.card {
  margin-bottom: 1.5em;
}

.list-group {
  margin-bottom: 1.5em;
}

.text-monospace {
  white-space: pre;
}

</style>
