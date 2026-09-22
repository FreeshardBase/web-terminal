<template>
  <div>
    <span><small>{{ title }}</small></span>
    <p v-b-tooltip.hover :title="tooltip">{{ content }}</p>
  </div>
</template>
<script>
export default {
  name: 'TextField',
  props: ['title', 'content', 'tooltip'],

}
</script>
