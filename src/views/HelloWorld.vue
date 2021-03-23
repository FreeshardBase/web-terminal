<template>
  <b-container>
    <b-row>
      <b-col></b-col>
      <b-col class="pb-3">
        <div>
          <img alt="Portal logo" src="../assets/logo.svg">
          <h1>Welcome to your Portal</h1>
        </div>

        <div class="mt-4">
          <p>Your Portal's ID is <br>
            <b-skeleton-wrapper :loading="!portal_id">
              <template #loading>
                <b-skeleton width="3em"></b-skeleton>
              </template>
              <b-form-input :value="portal_id.substring(0, 6)" class="text-monospace portal-id-input"
                            readonly></b-form-input>
            </b-skeleton-wrapper>
          </p>
        </div>

        <div class="mt-4">
          <p>Pair this browser to your Portal so that it becomes a <i>Terminal</i>. You only have to do this once per
            Terminal.</p>
          <b-form @submit.prevent="pair">

            <b-form-group
                description="The name under which your Portal will know this browser"
                label="Terminal Name"
            >
              <b-form-input
                  v-model="terminal_name"
                  placeholder="Enter Name"
              ></b-form-input>
            </b-form-group>

            <b-form-group
                description="Is this the first Terminal you pair with your Portal? Then the pairing code was given to you when you claimed your Portal. Otherwise, use a Terminal that is already paired to get a new pairing code."
                label="Pairing Code"
            >
              <b-form-input
                  v-model="pairing_code"
                  placeholder="Enter Pairing Code"
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
  width: 6em;
  text-align: center;
  display: inline-block;
}

img {
  padding: 3em;
}

div {
  text-align: center;
}
</style>
