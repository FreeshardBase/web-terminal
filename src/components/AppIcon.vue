<template>
  <a :href="href" target="_blank">
    <div>
      <img alt="🔲" :src="iconSrc" class="h-100">
      <p>{{ title }}</p>
    </div>
  </a>
</template>

<script>
export default {
  name: 'AppIcon',
  props: ['name'],
  computed: {
    iconSrc() {
      return `/core/app_controller/protected/apps/${this.name}/icon`
    },
    title() {
      return this.name.toLowerCase().trim().replace(/^\w/, (c) => c.toUpperCase())
    },
    href() {
      return `${this.name}.${window.location.host}`
    },
  },
}
</script>

<style scoped>
img {
  max-height: 4em;
  max-width: 4em;
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