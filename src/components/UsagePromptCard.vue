<template>
  <b-card
      no-body
      class="overflow-hidden"
      :border-variant="checked ? 'success' : null"
      @click.prevent="checked = !checked">
    <b-row no-gutters>
      <b-col md="2">
        <b-card-img :src="image" class="rounded-0"></b-card-img>
      </b-col>
      <b-col md="10">
        <b-card-body>
          <b-card-title class="title">
            <span>{{ title }}</span>
            <span>
              <b-form-checkbox
                  switch
                  size="lg"
                  :state="checked ? true : null"
                  v-model="checked"
                  @input="$emit('change', $event)">
              </b-form-checkbox>
            </span>
          </b-card-title>
          <b-card-text>
            <slot></slot>
            <p><small class="text-muted">Installs {{ appName | titlecase }}</small></p>
          </b-card-text>
        </b-card-body>
      </b-col>
    </b-row>
  </b-card>
</template>

<script>

export default {
  name: "UsagePromptCard",
  props: ['appName', 'title', 'image', 'checked'],
  model: {
    prop: 'checked',
    event: 'change',
  },
}

</script>

<style scoped>

.title {
  display: flex;
  justify-content: space-between;
}

</style>
