<template>
  <div @click="open" id="main" class="grid" :class="{'active': isActive}">
    <div v-if="!isActive">
      <b-spinner class="app-icon"></b-spinner>
    </div>
    <div v-else>
      <img
          :id="app.name"
          v-show="iconLoaded"
          :src="iconSrc"
          alt="🔲"
          class="app-icon"
          @load="iconLoaded=true">
      <b-icon-box v-show="!iconLoaded" class="app-icon"></b-icon-box>
    </div>
    <div class="status text-secondary">
      <b-icon-circle-fill v-if="app.status === 'running'"></b-icon-circle-fill>
      <div v-else></div>
    </div>
    <div>{{ app.name | titlecase }}</div>
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
    isActive() {
      return !['installing', 'installation_queued'].includes(this.app.status);
    },
  },
  methods: {
    open() {
      if (!this.isActive) {
        return;
      }
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

#main {
  text-align: center;
  padding-top: 2em;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

#main:not(.active) {
  cursor: progress;
}

p {
  margin-top: 0.2em;
}

.status>* {
  height: 0.5em;
  width: 0.5em;
}

.grid {
  display: grid;
  row-gap: 0.2em;
}

.grid div {
  display: flex;
  flex-direction: row;
  justify-content: center;
}

</style>
