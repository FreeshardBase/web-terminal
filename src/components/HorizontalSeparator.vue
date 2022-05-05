<template>
  <b-row align-v="stretch">
    <b-col>
      <hr>
    </b-col>
    <b-col md="auto"><h3>{{ title }}</h3></b-col>
    <b-col>
      <hr>
    </b-col>
  </b-row>
</template>

<script>
export default {
  name: "HorizontalSeparator",
  props: ['title']
}
</script>

<style scoped>
  .row {
    margin-top: 1em;
  }
</style>