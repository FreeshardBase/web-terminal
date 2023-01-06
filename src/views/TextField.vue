<template>
  <div>
    <span><small>{{ title }}</small></span>
    <p>{{ content }}</p>
  </div>
</template>
<script>
export default {
  name: 'TextField',
  props: ['title', 'content'],

}
</script>
