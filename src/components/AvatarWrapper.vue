<template>
  <b-avatar
      :size="size"
      :src="src"
      :text="text"
  ></b-avatar>
</template>

<script>

export default {
  name: 'AvatarWrapper',

  props: [
    'src',
    'name',
    'size',
  ],

  computed: {
    text() {
      if (this.name === undefined) {
        return undefined;
      }
      const nameElems = this.name.split(' ');
      if (nameElems.length === 1) {
        return this.name.charAt(0).toUpperCase();
      } else {
        const firstChar = nameElems[0].charAt(0).toUpperCase();
        const secondChar = nameElems[nameElems.length - 1].charAt(0).toUpperCase();
        return firstChar + secondChar;
      }
    },
  },

}
</script>

<style scoped>
</style>
