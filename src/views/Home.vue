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

  mounted() {
    this.$store.dispatch('query_meta')
  }
}
</script>

<style scoped>
</style>
