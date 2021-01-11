<template>
  <b-container>
    <b-row>
      <b-col>
        <p>Home sweet Home</p>
        <p>Your Portal's ID is <br>
          <b-skeleton-wrapper :loading="!portal_id">
            <template #loading><b-skeleton width="4em"></b-skeleton></template>
            <span v-if="portal_id">{{ portal_id.substring(0, 6) }}</span>
          </b-skeleton-wrapper>
        </p>
        <p>Your Terminal's ID is <br>
          <b-skeleton-wrapper :loading="!terminal_id">
            <template #loading><b-skeleton width="4em"></b-skeleton></template>
            <span v-if="terminal_id">{{ terminal_id }}</span>
          </b-skeleton-wrapper>
        </p>
        <p>Your Terminal's Name is <br>
          <b-skeleton-wrapper :loading="!terminal_name">
            <template #loading><b-skeleton width="4em"></b-skeleton></template>
            <span v-if="terminal_name">{{ terminal_name }}</span>
          </b-skeleton-wrapper>
        </p>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
export default {
  name: 'Home',

  data: function () {
    return {
      portal_id: null,
      terminal_id: null,
      terminal_name: null,
    }
  },

  mounted: function () {
    let component = this;
    this.$http.get('/core/identity_handler/public/meta/whoami')
        .then(function (response) {

          if (response.data.type === 'anonymous') {
            console.log('No token, redirecting to hello world');
            component.$router.replace('/helloworld');

          } else if (response.data.type === 'terminal') {
            component.terminal_id = response.data.id;
            component.terminal_name = response.data.name;
            component.$http.get('/core/identity_handler/public/meta/whoareyou')
                .then(function (response) {
                  component.portal_id = response.data.id;
                });
          }
        });
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
