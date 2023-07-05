<template>
  <div>
    <navbar></navbar>
    <b-container class="mt-4">

      <b-overlay :show="isUpdating" rounded="sm" variant="white" class="w-100 p-1">

        <b-row>
          <b-col>
            <h1>Settings</h1>
          </b-col>
        </b-row>

        <b-alert show v-if="$store.state.profile === null" variant="warning">
          Some of this Portal's metadata could not be loaded,
          so some settings are not available.
        </b-alert>

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

        <b-row v-if="$store.state.profile">
          <b-col>
            <b-card title="Size">
              <b-card-text>
                Change the size of your Portal.
                This sets the number of CPUs and the amount of RAM your Portal can use.
              </b-card-text>

              <b-button-group>
                <b-button
                    v-for="size in resize.sizes"
                    :key="size"
                    @click="resize.selectedSize=size"
                    :disabled="!sizeIsAvailable(size) || resize.waitingForRestart"
                    :variant="variantForSize(size)">
                  {{ size | uppercase }}
                </b-button>
              </b-button-group>

              <b-button-group v-if="resize.selectedSize" class="ml-3">
                <b-button variant="primary" @click="resizePortal" :disabled="resize.waitingForRestart">
                  <b-icon-arrow-clockwise></b-icon-arrow-clockwise>
                  Resize to {{ resize.selectedSize | uppercase }} and restart
                </b-button>
                <b-button variant="danger" @click="resize.selectedSize=null" :disabled="resize.waitingForRestart">
                  <b-icon-x-circle-fill></b-icon-x-circle-fill>
                  Cancel
                </b-button>
              </b-button-group>

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
        </b-row>

        <b-row>

          <b-col>
            <TextField v-if="$store.state.profile" title="Machine ID" :content="$store.state.profile.vm_id || 'unknown'"/>
            <TextField title="Portal ID" :content="portalIdWithBreaks || 'unknown'"
                       class="text-monospace"/>
            <TextField v-if="$store.state.profile" title="Owner" :content="$store.state.profile.owner || 'unknown'"/>
            <TextField v-if="$store.state.profile" title="Owner Email" :content="$store.state.profile.owner_email || 'unknown'"/>
            <TextField v-if="$store.state.profile" title="Created" :content="$store.state.profile.time_created | formatDateHumanize"/>
            <TextField v-if="$store.state.profile" title="Assigned" :content="$store.state.profile.time_assigned | formatDateHumanize"/>
            <div v-if="$store.state.profile">
              <TextField v-if="$store.state.profile.delete_after" title="Scheduled to delete"
                         :content="$store.state.profile.delete_after | formatDateHumanize"/>
              <TextField v-else title="Scheduled to delete" content="never"/>
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
import TextField from "@/components/TextField.vue";

export default {
  name: "Settings",
  components: {TextField, Navbar},

  data: function () {
    return {
      isUpdating: false,
      resize: {
        sizes: ['xs', 's', 'm', 'l', 'xl'],
        selectedSize: null,
        waitingForRestart: false,
      },
    }
  },

  computed: {
    portalIdWithBreaks() {
      const segmentLength = 16;
      let pid = this.$store.state.meta.portal_identity.id;
      let result = '';
      while (pid.length > segmentLength) {
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
        this.$store.dispatch("query_profile_data");
      } catch (e) {
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
        this.$bvToast.toast('Tours reset.', {
          variant: 'success',
        });

      } catch (e) {
        this.$bvToast.toast(e.response.data.detail, {
          title: 'Error during resetting',
          variant: 'danger',
        });
      } finally {
        await this.$store.dispatch('query_tour_data');
      }
    },
    async restartPortal() {
      await this.$http.post('/core/protected/restart');
      await this.$router.replace('/restart');
    },
    sizeIsAvailable(size) {
      if (this.$store.state.profile.max_portal_size === undefined) {
        return false;
      }
      return this.resize.sizes.indexOf(size) <= this.resize.sizes.indexOf(this.$store.state.profile.max_portal_size)
          && size !== this.$store.state.profile.portal_size;
    },
    variantForSize(size) {
      if (size === this.$store.state.profile.portal_size) {
        return 'info';
      } else if (size === this.resize.selectedSize) {
        return 'primary';
      } else {
        return 'outline-secondary';
      }
    },
    async resizePortal() {
      this.resize.waitingForRestart = true;
      await this.$http.post('/core/protected/management/resize', {size: this.resize.selectedSize});
      await this.$router.replace('/restart');
    }
  },

  async mounted() {
    document.title = `Portal [${this.$store.getters.short_portal_id}] - About`;
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
