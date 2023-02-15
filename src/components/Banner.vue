<template>
  <div id="banner" :class="`badge-${variant}`">
    <b-container fluid>
      <b-row align-v="baseline">
        <b-col><slot></slot></b-col>
        <b-col md="auto">
          <b-button-group size="sm">
          <b-button :variant="`${variant}`">Remind me later</b-button>
          <b-button :variant="`${variant}`">Dismiss</b-button>
            </b-button-group>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
export default {
  name: "Banner",

  props: [
      'variant',
  ]
}
</script>

<style scoped>

  #banner p {
    margin: 0;
  }

  #banner {
    padding: 0.3em;
  }

</style>
