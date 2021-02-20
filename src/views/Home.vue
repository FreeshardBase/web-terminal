<template>
  <div>
    <navbar></navbar>
    <b-container fluid>
      <b-row>
        <b-col>
          <h1>Apps</h1>
          <b-container fluid>
            <b-row align-h="start">
              <b-col cols="6" md="2"><AppIcon name="filebrowser"></AppIcon></b-col>
            </b-row>
          </b-container>
        </b-col>
        <b-col sm="3" class="border-left border-top">
          <p>Your Portal:
            <span>{{ $store.state.meta.portal_id.substring(0, 6) }}</span>
          </p>
          <p>This Terminal:
            <span>{{ $store.state.meta.terminal_id }} </span>
            <span>({{ $store.state.meta.terminal_name }})</span>
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
    }
  },
}
</script>

<style scoped>
</style>
