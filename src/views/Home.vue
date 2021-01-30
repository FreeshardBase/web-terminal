<template>
  <div>
    <navbar></navbar>
    <b-container fluid>
      <b-row>
        <b-col>
          <b-container fluid>
            <b-row align-h="start">
              <b-col cols="6" md="2"><AppIcon name="filebrowser"></AppIcon></b-col>
            </b-row>
          </b-container>
        </b-col>
        <b-col sm="3" class="border-left border-top">
          <p>Your Portal:
            <b-skeleton-wrapper :loading="!portal_id">
              <template #loading>
                <b-skeleton width="4em"></b-skeleton>
              </template>
              <span v-if="portal_id">{{ portal_id.substring(0, 6) }}</span>
            </b-skeleton-wrapper>
          </p>
          <p>This Terminal:
            <b-skeleton-wrapper :loading="!terminal_id">
              <template #loading>
                <b-skeleton width="4em"></b-skeleton>
              </template>
              <span v-if="terminal_id">{{ terminal_id }} </span>
            </b-skeleton-wrapper>
            <b-skeleton-wrapper :loading="!terminal_name">
              <template #loading>
                <b-skeleton width="4em"></b-skeleton>
              </template>
              <span v-if="terminal_name">({{ terminal_name }})</span>
            </b-skeleton-wrapper>
          </p>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
import navbar from "@/components/Navbar";
import AppIcon from "@/components/AppIcon";

export default {
  name: 'Home',
  components: {AppIcon, navbar},
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
