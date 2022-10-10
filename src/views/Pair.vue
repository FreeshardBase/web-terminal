<template>
  <b-container>
    <b-row>
      <b-col></b-col>
      <b-col cols="8" class="pb-3">
        <div>
          <h1 class="mt-5">Pair this browser</h1>
        </div>

        <div class="mt-4">
          <p>This Portal is <br>
            <PortalIdBadge :portal-id="short_id"></PortalIdBadge>
          </p>
        </div>

        <div class="mt-4">
          <b-form @submit.prevent="pair">

            <b-form-group
                label="Enter a Pairing Code"
            >
              <b-form-input
                  v-model="pairing_code"
                  class="text-monospace text-center"
                  placeholder="******"
                  size="lg"
                  autofocus
              ></b-form-input>
            </b-form-group>

            <b-button type="submit" variant="primary">
              <span v-if="pairing_in_progress"><b-spinner small></b-spinner></span>
              <span v-else><b-icon-link45deg></b-icon-link45deg> Pair</span>
            </b-button>
          </b-form>
        </div>

        <b-alert v-model="show_error" dismissible variant="danger">{{ pairing_error }}</b-alert>

      </b-col>
      <b-col></b-col>
    </b-row>
  </b-container>
</template>

<script>
import {
  browserName,
  isBrowser,
  isMobileOnly,
  isTablet,
  osName
} from "mobile-device-detect";
import PortalIdBadge from "@/components/PortalIdBadge";

export default {
  name: 'Pair',
  components: {PortalIdBadge},
  data: function () {
    return {
      portal_id: null,
      device_name: null,
      pairing_code: null,
      pairing_in_progress: false,
      pairing_error: null,
      show_error: false,
    }
  },

  computed: {
    short_id: function () {
      if (this.portal_id) {
        return this.portal_id.substring(0, 6);
      } else {
        return 'unknown';
      }
    },
  },

  methods: {
    pair: async function () {
      let component = this;
      this.pairing_in_progress = true;
      this.show_error = false;
      try {
        await this.$http.post('/core/public/pair/terminal?code=' + this.pairing_code, this._makeDeviceObject());
      } catch (response) {
        component.pairing_in_progress = false;
        component.pairing_error = response;
        component.show_error = true;
      }
      await this.$store.dispatch('query_meta_data');
      await this.$store.dispatch('query_tour_data');
      await component.$router.replace('/');
    },
    _makeDeviceObject: function () {
      const result = {
        name: `${browserName} on ${osName}`,
      }
      if (isMobileOnly) {
        result.icon = 'smartphone';
      } else if (isTablet) {
        result.icon = 'tablet';
      } else if (isBrowser) {
        result.icon = 'notebook';
      } else {
        result.icon = 'unknown';
      }
      return result;
    },
  },

  mounted: async function () {
    const whoami = await this.$http.get('/core/public/meta/whoami');
    if (whoami.data.type === 'terminal') {
      await this.$router.replace('/')
    }

    const whoareyou = await this.$http.get('/core/public/meta/whoareyou');
    this.portal_id = whoareyou.data.id;
    document.title = `Portal [${this.short_id}] - Hello`;
  },

  beforeMount: async function () {
    const pairing_code = this.$route.query.code;
    if (pairing_code !== undefined) {
      try {
        await this.$http.post('/core/public/pair/terminal?code=' + pairing_code, this._makeDeviceObject());
        window.location.replace('');
      } catch (response) {
        console.log('Error during auto-pairing', response);
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.portal-id-input {
  width: 8em;
  text-align: center;
  display: inline-flex;
}

div {
  text-align: center;
}

input {
  max-width: 8em;
  margin: auto;
}

.alert {
  margin-top: 1em;
}

</style>
