<template>
  <div>
    <navbar></navbar>
    <b-container class="mt-4">

      <!-- Title -->
      <b-row>
        <b-col>
          <h1>Apps</h1>
        </b-col>
        <b-col class="text-right p-1">
          <!-- Settings -->
          <b-dropdown class="m-2" dropup no-caret right text="Drop-Up" variant="outline-secondary">
            <template #button-content>
              <b-icon-gear-fill></b-icon-gear-fill>
            </template>
            <b-dropdown-text>Tools for app developers</b-dropdown-text>
            <b-dropdown-divider></b-dropdown-divider>
            <!-- Refresh -->
            <b-dropdown-item>
              <b-button @click="refresh" variant="outline-secondary">
                <b-icon-arrow-repeat></b-icon-arrow-repeat>
                Refresh app store
              </b-button>
            </b-dropdown-item>
          </b-dropdown>
        </b-col>
      </b-row>

      <b-overlay :show="isUpdating" rounded="sm" variant="white" class="w-100 p-1" id="all-apps">

        <b-alert show v-if="storeBranch !== 'feature-docker-compose'">
          <p>
            You are viewing the app app store on branch <b>{{ storeBranch }}</b>.
            This is meant for development and testing only.
            Some apps that should be there might be missing.
            Apps that are not yet fully functional might be visible.
            Proceed with caution.
          </p>
          <b-button @click="setBranch('master')" variant="outline-info">
            <b-icon-backspace-fill></b-icon-backspace-fill>
            Reset App Store
          </b-button>
        </b-alert>

        <HorizontalSeparator title="Installed"></HorizontalSeparator>

        <!-- Installed Apps -->
        <b-row align-v="stretch" class="flex-grow-1" id="installed-apps">
          <b-col>
            <b-container>
              <!-- Entries -->
              <b-row cols="1" cols-md="2">
                <b-col v-for="app in $store.state.apps" :key="app.name" class="p-1">
                  <AppStoreEntry :app="app" is_installed="true" @changed="refresh"></AppStoreEntry>
                </b-col>
              </b-row>
            </b-container>
          </b-col>
        </b-row>

        <HorizontalSeparator title="Available"></HorizontalSeparator>

        <!-- Available Apps -->
        <b-row align-v="stretch" class="flex-grow-1" id="available-apps">
          <b-col>
            <b-container>
              <!-- Entries -->
              <b-row cols="1" cols-md="2">
                <b-col v-for="app in availableApps" :key="app.name" class="p-1">
                  <AppStoreEntry :app="app" @changed="refresh" :branch="storeBranch"></AppStoreEntry>
                </b-col>
              </b-row>
            </b-container>
          </b-col>
        </b-row>

      </b-overlay>

    </b-container>

    <v-tour name="AppsTour" :steps="tourSteps" :options="{highlight: true}"></v-tour>
  </div>
</template>

<script>
import Navbar from "@/components/Navbar";
import AppStoreEntry from "@/components/AppStoreEntry";
import HorizontalSeparator from "@/components/HorizontalSeparator";

export default {
  name: "Apps",
  components: {HorizontalSeparator, AppStoreEntry, Navbar},
  data: function () {
    return {
      storeApps: [],
      storeBranch: 'feature-docker-compose',
      isUpdating: false,
      tourSteps: [
        {
          target: '#all-apps',
          params: {placement: 'top', enableScrolling: false},
          content: 'This is the app store.<br>' +
              'Here you can browse, install, and remove apps.'
        },
        {
          target: '#installed-apps',
          params: {enableScrolling: false},
          content: 'These are the apps that are currently installed.'
        },
        {
          target: '#available-apps',
          params: {enableScrolling: false},
          content: 'And these are the apps you can install.'
        }
      ]
    }
  },

  computed: {
    availableApps() {
      const installedAppNames = this.$store.state.apps.map(a => a.name);
      return [...this.storeApps]
          .filter(a => !installedAppNames.includes(a.name))
          .sort((a, b) => {
            return a.store_info.is_featured < b.store_info.is_featured
          });
    }
  },

  methods: {
    async refresh() {
      this.isUpdating = true;
      try {
        await Promise.all([
          this.$store.dispatch("refresh_apps"),
          this.fetchStoreApps()
        ]);
      } finally {
        this.isUpdating = false;
      }
    },

    async fetchStoreApps() {
      this.storeApps = (await this.$http.get(`https://storageaccountportab0da.blob.core.windows.net/app-store/${this.storeBranch}/all_apps/store_metadata.json`)).data.apps
    },

    async setBranch(branch) {
      this.storeBranch = branch;
      await this.refresh();
    },

  },

  async mounted() {
    document.title = `Portal [${this.$store.getters.short_portal_id}] - Apps`;
    await this.refresh();
    if (!this.$store.getters.tour_seen('apps')) {
      this.$tours['AppsTour'].start();
      await this.$store.dispatch('mark_tour_as_seen', 'apps');
    }
  }
}
</script>

<style scoped>

.icon {
  height: 1.5em;
}

a {
  cursor: pointer;
}

</style>
