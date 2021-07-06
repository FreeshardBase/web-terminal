<template>
  <b-container>
    <b-row>
      <b-col></b-col>
      <b-col class="pb-3">
        <div>
          <h1 class="mt-5">Welcome</h1>
        </div>

        <div class="mt-4">
          <p>This Portal is <br>
            <b-skeleton-wrapper :loading="!portal_id">
              <template #loading>
                <b-skeleton width="3em"></b-skeleton>
              </template>
              <b-input-group class="portal-id-input">
                <b-input-group-prepend>
                  <b-input-group-text>
                    <img class="h-100" style="max-height: 1.5em" alt="Portal logo" src="../assets/logo.svg">
                  </b-input-group-text>
                </b-input-group-prepend>
                <b-form-input class="text-monospace" readonly :value="portal_id.substring(0, 6)"></b-form-input>
              </b-input-group>
            </b-skeleton-wrapper>
          </p>
        </div>

        <div class="mt-4">
          <p>To <i>pair</i> this device, give it a name and enter a pairing code.</p>
          <b-form @submit.prevent="pair">

            <b-form-group
                label="Device Name"
            >
              <b-form-input
                  v-model="terminal_name"
                  placeholder="E.g. Notebook or Smartphone"
              ></b-form-input>
            </b-form-group>

            <b-form-group
                description="The one-time pairing code was given to you when you claimed your Portal. You can also get a new one by using a paired device."
                label="Pairing Code"
            >
              <b-form-input
                  v-model="pairing_code"
                  class="text-monospace"
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
export default {
  name: 'HelloWorld',

  data: function () {
    return {
      portal_id: null,
      terminal_name: null,
      pairing_code: null,
      pairing_in_progress: false,
      pairing_error: null,
      show_error: false,
    }
  },

  methods: {
    pair: function () {
      let component = this;
      this.pairing_in_progress = true;
      this.show_error = false;
      this.$http.post('/core/identity_handler/public/pair/terminal?code=' + this.pairing_code, {
        name: this.terminal_name,
      })
          .then(function () {
            component.$router.replace('/')
          })
          .catch(function (response) {
            component.pairing_in_progress = false;
            component.pairing_error = response;
            component.show_error = true;
          });
    }
  },

  mounted: function () {
    let component = this;
    this.$http.get('/core/identity_handler/public/meta/whoami')
        .then(function (response) {
          if (response.data.type === 'terminal') {
            component.$router.replace('/')
          }
        });

    this.$http.get('/core/identity_handler/public/meta/whoareyou')
        .then(response => (component.portal_id = response.data.id))
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
</style>
