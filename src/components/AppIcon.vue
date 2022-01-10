<template>
  <div>
    <div v-if="app.status === 'running'">
      <a :href="href" target="_blank">
        <div>
          <img v-show="iconLoaded" :src="iconSrc" alt="🔲" class="app-icon" @load="iconLoaded=true">
          <b-icon-box v-show="!iconLoaded" class="app-icon"></b-icon-box>
          <p>{{ title }}</p>
        </div>
      </a>
    </div>
    <div v-else>
      <b-spinner class="app-icon"></b-spinner>
      <p class="text-secondary">{{ title }}</p>
    </div>
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
    title() {
      return this.app.name.toLowerCase().trim().replace(/^\w/, (c) => c.toUpperCase())
    },
    href() {
      return `https://${this.app.name}.${window.location.host}`
    },
  },
}
</script>

<style scoped>
.app-icon {
  height: 4em;
  width: 4em;
}

div {
  text-align: center;
  margin: 2em;
}

p {
  margin-top: 0.5em;
}

a {
  color: inherit;
}
</style>