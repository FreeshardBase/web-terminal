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
                A backups is done automatically every night. New backups overwrite the old ones.
                Even after your Portal is deleted, you can still access your backups.
              </b-card-text>
              <b-card-text class="text-muted small">
                We are currently working on self-service access to your backups.
                Until then, please <a href="mailto:contact@getportal.org">contact us</a> if you need access,
                so we can guide you through the process.
              </b-card-text>
              <div class="mt-1">
                <b-button variant="primary" v-b-toggle.accordion-1>Show latest backup stats</b-button>
                <!-- TODO: Add a function to start a backup now -->
                <b-button variant="primary" class="ml-1">Start backup now</b-button>
              </div>
              <b-collapse id="accordion-1" class="mt-1">
                <b-card>
                  <pre>{{ backupInfo.last_report || 'No backup was done yet.' }}</pre>
                </b-card>
              </b-collapse>

              <hr>

              <b-card-text class="mt-2">
                Backups are encrypted on this Portal before being sent to the backup server.
                The encryption key is your personal passphrase.
                In order to access your backups later, it is essential to <b>write down your passphrase</b>.
                If you lose it, you will not be able to access your backups.
                There is no other way to recover them.
              </b-card-text>
              <b-alert show variant="danger" v-if="!backupInfo.last_passphrase_access_info">
                <b-icon-exclamation-triangle-fill></b-icon-exclamation-triangle-fill>
                You have never viewed your passphrase. Please write it down as soon as possible.
              </b-alert>
              <b-button v-b-toggle.accordion-2 class="mt-1" variant="warning">Reveal passphrase</b-button>
              <b-collapse id="accordion-2" class="mt-1">
                <b-card>
                  <b-alert show variant="warning" class="mt-2">
                    This is very sensitive information. Make sure no one else is watching!
                    <b-button @click="fetchPassphrase" variant="warning" size="sm" class="ml-2" v-if="!passphrase">Reveal now</b-button>
                    <b-spinner v-if="passphraseLoading" small class="ml-2"></b-spinner>
                    <div v-if="passphrase">
                      <p>Your passphrase:</p>
                      <b-card class="text-monospace">{{ passphrase }}</b-card>
                    </div>
                  </b-alert>
                  <p v-if="backupInfo.last_passphrase_access_info" class="text-muted small">
                    Your passphrase was last revealed {{ backupInfo.last_passphrase_access_info.time | formatDateHumanize }}
                    from device {{ backupInfo.last_passphrase_access_info.terminal_id }}.
                  </p>
                </b-card>
              </b-collapse>

            </b-card>
          </b-col>
        </b-row>

        <b-row v-if="$store.state.profile">
          <b-col>
            <b-card title="Size">
              <b-card-text>
                Change the size of your Portal.
                This sets the number of CPUs and the amount of RAM your Portal can use.
                <!-- TODO: Add information about how to contact us to unlock more sizes -->
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
            <b-card title="Reset Welcome Screen">
              <b-card-text>
                Reset the welcome screen so you can look at it again.
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
            <b-card title="Prune">
              <b-card-text>
                Prune unused data in order to free up disk space.
              </b-card-text>
              <b-button @click="pruneImages" variant="primary" :disabled="prune.inProgress">
                <b-icon-trash></b-icon-trash>
                Prune
              </b-button>
              &nbsp;<b-spinner v-if="prune.inProgress" small></b-spinner>
              {{ prune.result }}
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
            <TextField title="UI Version" :content="uiVersion"/>
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
import {toastMixin} from "@/mixins";
import pjson from "@/../package.json";

export default {
  name: "Settings",
  components: {TextField, Navbar},
  mixins: [toastMixin],

  data: function () {
    return {
      isUpdating: false,
      resize: {
        sizes: ['xs', 's', 'm', 'l', 'xl'],
        selectedSize: null,
        waitingForRestart: false,
      },
      prune: {
        inProgress: false,
        result: '',
      },
      backupInfo: {"last_report": null},
      passphraseLoading: false,
      passphrase: null, // This will be handled later
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
    },
    uiVersion() {
      return pjson.version;
    }
  },

  methods: {
    async refresh() {
      this.isUpdating = true;
      try {
        await this.$store.dispatch("query_profile_data");
      } catch (e) {
        this.toastError('Error during loading', e.response.data.detail);
      } finally {
        this.isUpdating = false;
      }
    },
    async refreshBackupInfo() {
      try {
        const response = await this.$http.get('/core/protected/backup/info');
        if (this.backupInfo) {
          this.backupInfo = response.data;
        }
      } catch (e) {
        this.toastError('Error during loading', e.response.data.detail);
      }
    },
    async fetchPassphrase() {
      this.passphraseLoading = true;
      try {
        const response = await this.$http.get('/core/protected/backup/passphrase');
        this.passphrase = response.data.passphrase;
      } catch (e) {
        this.toastError('Error during loading', e.response.data.detail);
      } finally {
        this.passphraseLoading = false;
        this.refreshBackupInfo();
      }
    },
    async resetTour() {
      try {
        await this.$http.delete('/core/protected/help/tours');
        this.toastSuccess('Tours reset.');
      } catch (e) {
        this.toastError('Error during resetting', e.response.data.detail);
      } finally {
        await this.$store.dispatch('query_tour_data');
      }
    },
    async pruneImages() {
      this.prune.inProgress = true;
      try {
        const response = await this.$http.post('/core/protected/settings/prune-images');
        this.prune.result = response.data.message;
      } catch (e) {
        this.prune.result = 'Error during pruning';
      } finally {
        this.prune.inProgress = false;
      }
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
    this.refreshBackupInfo(); // Load backup info in the background
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
