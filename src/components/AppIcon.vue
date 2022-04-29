<template>
  <div @click="open">
    <img :id="app.name" v-show="iconLoaded" :src="iconSrc" alt="🔲" class="app-icon" @load="iconLoaded=true">
    <b-icon-box v-show="!iconLoaded" class="app-icon"></b-icon-box>
    <p>{{ app.name | titlecase }}</p>
    <b-icon-dot v-if="app.status === 'running'"></b-icon-dot>
  </div>
</template>

<script>
export default {
  name: 'AppIcon',
  props: ['app'],
  data: function () {
    return {
      iconLoaded: false,
    }
  },
  computed: {
    iconSrc() {
      return `/core/protected/apps/${this.app.name}/icon`
    },
  },
  methods: {
    open() {
      window.open(`https://${this.app.name}.${window.location.host}`, '_blank');
    }
  }
}
</script>

<style scoped>
.app-icon {
  height: 4em;
  width: 4em;
}

div {
  text-align: center;
  padding-top: 2em;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

p {
  margin-top: 0.5em;
}

</style>