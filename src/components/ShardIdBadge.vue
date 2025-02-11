<template>
  <b-input-group class="shard-id-badge">
    <b-input-group-prepend>
      <b-input-group-text>
        <img class="h-100" alt="Freeshard logo" src="../assets/logo.svg">
      </b-input-group-text>
    </b-input-group-prepend>
    <b-form-input
        class="shard-id-input text-monospace"
        readonly
        :value=shardId
    ></b-form-input>
  </b-input-group>
</template>
<script>
export default {
  name: 'ShardIdBadge',

  props: ['shardId']
}
</script>
<style scoped>

.shard-id-badge {
  width: 8em;
  text-align: center;
  display: inline-flex;
}

.shard-id-input {
  cursor: pointer;
  text-align: center;
}

img {
  max-height: 1.5em;
}

</style>
