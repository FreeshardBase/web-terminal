<template>
  <b-input-group class="portal-id-badge">
    <b-input-group-prepend>
      <b-input-group-text>
        <img class="h-100" alt="Portal logo" src="../assets/logo.svg">
      </b-input-group-text>
    </b-input-group-prepend>
    <b-form-input
        class="portal-id-input text-monospace"
        readonly
        :value=portalId
    ></b-form-input>
  </b-input-group>
</template>
<script>
export default {
  name: 'PortalIdBadge',

  props: ['portalId']
}
</script>
<style scoped>

.portal-id-badge {
  width: 8em;
  text-align: center;
  display: inline-flex;
}

.portal-id-input {
  cursor: pointer;
  text-align: center;
}

img {
  max-height: 1.5em;
}

</style>