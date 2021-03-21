<template>
  <a :href="href" target="_blank">
    <div>
      <img v-show="iconLoaded" alt="🔲" :src="iconSrc" class="h-100 app-icon" @load="iconLoaded=true">
      <b-icon-box v-show="!iconLoaded" class="app-icon"></b-icon-box>
      <p>{{ title }}</p>
    </div>
  </a>
</template>

<script>
export default {
  name: 'AppIcon',
  props: ['name'],
  data: function () {
    return {
      iconLoaded: false,
    }
  },
  computed: {
    iconSrc() {
      return `/core/app_controller/protected/apps/${this.name}/icon`
    },
    title() {
      return this.name.toLowerCase().trim().replace(/^\w/, (c) => c.toUpperCase())
    },
    href() {
      return `https://${this.name}.${window.location.host}`
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