<template>
  <div>
    <navbar></navbar>
    <b-container class="mt-4">

      <b-overlay :show="isUpdating" rounded="sm" variant="white" class="w-100 p-1">

        <b-row>
          <b-col>
            <h1>
              Settings
              <b-button @click="refresh(true)" variant="outline-secondary" size="sm">
                <b-icon-arrow-repeat></b-icon-arrow-repeat>
              </b-button>
            </h1>
          </b-col>
        </b-row>

        <b-alert show v-if="$store.state.profile === null" variant="warning">
          Some of this Shard's metadata could not be loaded,
          so some settings are not available.
        </b-alert>

        <b-row>
          <b-col>
            <b-card title="Disk Space">
              <b-progress
                  :max="disk_usage_total"
                  height="2em"
                  :variant="disk_usage_variant"
              >
                <b-progress-bar
                    :value="disk_usage_used"
                    class="text-center"
                >{{ (disk_usage_used / disk_usage_total * 100).toFixed(1) }} %
                </b-progress-bar>
              </b-progress>
              <b-card-text class="mt-2">
                Used: {{ disk_usage_used }} GiB of {{ disk_usage_total }} GiB
              </b-card-text>
              <b-alert show variant="danger" v-if="$store.state.disk_usage.disk_space_low">
                <b-icon-hdd-fill></b-icon-hdd-fill>
                Disk space critically low. All apps are stopped. Please upgrade your disk space or <a
                  href="mailto:contact@freeshard.net">contact us</a> for help.
              </b-alert>
              <b-alert show variant="warning" v-else-if="$store.state.disk_usage.disk_space_warning">
                <b-icon-hdd-fill></b-icon-hdd-fill>
                Disk space is getting low. If it gets critical, all apps will be stopped to prevent data loss.
                You should prune unused data or upgrade your disk space.
              </b-alert>

              <hr>

              <b-card-text>
                Prune unused data in order to free up disk space. This is also done automatically every night.
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
            <b-card title="Backup">

              <b-card-text>
                A backup is done automatically every night. New backups overwrite the old ones.
                Even after your Shard is deleted, you can still access your backups.
              </b-card-text>
              <b-card-text class="text-muted small">
                We are currently working on self-service access to your backups.
                Until then, please <a href="mailto:contact@freeshard.net">contact us</a> if you need access,
                so we can guide you through the process.
              </b-card-text>
              <div class="mt-1">
                <b-button variant="primary" v-b-toggle.accordion-1>Show latest backup stats</b-button>
                <b-button variant="primary" @click="startBackup" class="ml-1">Start backup now</b-button>
              </div>
              <b-collapse id="accordion-1" class="mt-1">
                <b-card>
                  <pre>{{ backupInfo.last_report || 'No backup was done yet.' }}</pre>
                </b-card>
              </b-collapse>

              <hr>

              <b-card-text class="mt-2">
                Backups are encrypted on this Shard before being sent to the backup server.
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
                    <b-button @click="fetchPassphrase" variant="warning" size="sm" class="ml-2" v-if="!passphrase">
                      Reveal now
                    </b-button>
                    <b-spinner v-if="passphraseLoading" small class="ml-2"></b-spinner>
                    <div v-if="passphrase">
                      <p>Your passphrase:</p>
                      <b-card class="text-monospace">{{ passphrase }}</b-card>
                    </div>
                  </b-alert>
                  <p v-if="backupInfo.last_passphrase_access_info" class="text-muted small">
                    Your passphrase was last revealed
                    {{ backupInfo.last_passphrase_access_info.time | formatDateHumanize }}
                    from device <i>{{ backupInfo.last_passphrase_access_info.terminal_name }}</i> (with ID:
                    {{ backupInfo.last_passphrase_access_info.terminal_id }}).
                  </p>
                </b-card>
              </b-collapse>

            </b-card>
          </b-col>
        </b-row>

        <b-row id="size" v-if="$store.state.profile">
          <b-col>
          <b-overlay :show="navOverlays.size" variant="primary" rounded="sm">

            <!-- to remove the spinner -->
            <template #overlay><div></div></template>

            <b-card title="Size">
              <b-card-text>
                Change the size of your Shard.
                This sets the number of CPUs and the amount of RAM your Shard can use.
              </b-card-text>
              <b-card-text class="text-muted small">
                To unlock larger sizes, please <a href="mailto:contact@freeshard.net">contact us</a>.
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
                <b-button variant="primary" @click="resizeShard" :disabled="resize.waitingForRestart">
                  <b-icon-arrow-clockwise></b-icon-arrow-clockwise>
                  Resize to {{ resize.selectedSize | uppercase }} and restart
                </b-button>
                <b-button variant="danger" @click="resize.selectedSize=null" :disabled="resize.waitingForRestart">
                  <b-icon-x-circle-fill></b-icon-x-circle-fill>
                  Cancel
                </b-button>
              </b-button-group>

            </b-card>
            </b-overlay>
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

        <b-row id="about">
          <b-col>
            <h1>About</h1>
          </b-col>
        </b-row>

        <b-row>

          <b-col>
            <TextField v-if="$store.state.profile" title="Machine ID"
                       :content="$store.state.profile.vm_id || 'unknown'"/>
            <TextField title="Shard ID" :content="shardIdWithBreaks || 'unknown'"
                       class="text-monospace"/>
            <TextField v-if="$store.state.profile" title="Owner" :content="$store.state.profile.owner || 'unknown'"/>
            <TextField v-if="$store.state.profile" title="Owner Email"
                       :content="$store.state.profile.owner_email || 'unknown'"/>
            <TextField v-if="$store.state.profile" title="Created"
                       :content="$store.state.profile.time_created | formatDateHumanize"/>
            <TextField v-if="$store.state.profile" title="Assigned"
                       :content="$store.state.profile.time_assigned | formatDateHumanize"/>
            <div v-if="$store.state.profile">
              <TextField v-if="$store.state.profile.delete_after" title="Scheduled to delete"
                         :content="$store.state.profile.delete_after | formatDateHumanize"/>
              <TextField v-else title="Scheduled to delete" content="never"/>
            </div>
            <TextField title="UI Version" :content="uiVersion"/>
            <TextField title="Public Key" :content="$store.state.meta.identity.public_key_pem || 'unknown'"
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
import {EventBus} from "@/event-bus";

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
      navOverlays: {
        size: false,
        about: false,
      }
    }
  },

  computed: {
    shardIdWithBreaks() {
      const segmentLength = 16;
      let pid = this.$store.state.meta.identity.id;
      let result = '';
      while (pid.length > segmentLength) {
        result = result.concat(pid.slice(0, segmentLength)).concat('\n');
        pid = pid.slice(segmentLength);
      }
      return result;
    },
    uiVersion() {
      return pjson.version;
    },
    disk_usage_total() {
      return this.$store.state.disk_usage.total_gb.toFixed(2);
    },
    disk_usage_used() {
      return (this.$store.state.disk_usage.total_gb - this.$store.state.disk_usage.free_gb).toFixed(2);
    },
    disk_usage_variant() {
      if (this.$store.state.disk_usage.disk_space_low) {
        return 'danger';
      } else if (this.$store.state.disk_usage.disk_space_warning) {
        return 'warning';
      } else {
        return 'success';
      }
    },
  },

  methods: {
    async refresh(force) {
      this.isUpdating = true;
      try {
        if (force) {
          await this.$store.dispatch("force_query_profile_data");
        } else {
          await this.$store.dispatch("query_profile_data");
        }
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
    async startBackup() {
      try {
        await this.$http.post('/core/protected/backup/start');
        this.toastSuccess('Backup started.');
      } catch (e) {
        this.toastError('Error during starting', e.response.data.detail);
      } finally {
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
      if (this.$store.state.profile.max_shard_size === undefined) {
        return false;
      }
      return this.resize.sizes.indexOf(size) <= this.resize.sizes.indexOf(this.$store.state.profile.max_shard_size)
          && size !== this.$store.state.profile.shard_size;
    },
    variantForSize(size) {
      if (size === this.$store.state.profile.shard_size) {
        return 'info';
      } else if (size === this.resize.selectedSize) {
        return 'primary';
      } else {
        return 'outline-secondary';
      }
    },
    async resizeShard() {
      this.resize.waitingForRestart = true;
      await this.$http.post('/core/protected/management/resize', {size: this.resize.selectedSize});
      await this.$router.replace('/restart');
    }
  },

  async mounted() {
    document.title = `Shard [${this.$store.getters.short_shard_id}] - About`;
    this.refreshBackupInfo(); // Load backup info in the background

    EventBus.$on('backup_update', () => {
      this.refreshBackupInfo();
    });

    const section = this.$router.currentRoute.hash.replace("#", "");
    if (section) {
      this.navOverlays[section] = true;
      this.$nextTick(() => {
        window.document.getElementById(section).scrollIntoView();
      });
      setTimeout(() => {
        this.navOverlays[section] = false;
      }, 400);
    }
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
