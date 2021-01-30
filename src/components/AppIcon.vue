<template>
  <a :href="href" target="_blank">
    <div>
      <img :alt="name" :src="iconSrc" class="h-100">
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
      return require(`../assets/${this.name}.svg`)
    },
    title() {
      return this.name.toLowerCase().trim().replace(/^\w/, (c) => c.toUpperCase())
    },
    href() {
      return `/app/${this.name}`
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