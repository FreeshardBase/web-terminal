<template>
  <b-container>
    <b-row>
      <b-col></b-col>
      <b-col cols="5">
        <img alt="Portal logo" src="../assets/logo.svg">
        <h1>Welcome to your Portal</h1>

        <p>Your Portal's ID is <br>
          <span v-if="portal_id">{{ portal_id.substring(0, 6) }}</span>
          <span v-else><b-spinner small></b-spinner></span>
        </p>

        <p>Pair this browser to your Portal.</p>
        <b-form @submit.prevent="pair">
          <b-form-group
              label="Terminal Name"
              description="The name under which your Portal will know this browser"
          >
            <b-form-input
                v-model="terminal_name"
                placeholder="Enter Name"
            ></b-form-input>
          </b-form-group>
          <b-form-group
              label="Pairing Code"
              description="The pairing code was given to you when you claimed your Portal"
          >
            <b-form-input
                v-model="pairing_code"
                placeholder="Enter Pairing Code"
            ></b-form-input>
          </b-form-group>
          <b-button type="submit" variant="primary">
            <span v-if="pairing_in_progress"><b-spinner small></b-spinner></span>
            <span v-else>Pair</span>
          </b-button>
        </b-form>

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
    }
  },

  methods: {
    pair: function () {
      this.pairing_in_progress = true;
      let component = this;
      this.$http.post('/core/identity_handler/public/pair/terminal?code=' + this.pairing_code, {
        name: this.terminal_name,
      })
          .then(function () {
            component.$router.replace('/')
          })
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
img {
  padding: 3em;
}
</style>
