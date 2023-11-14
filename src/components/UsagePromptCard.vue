<template>
  <b-card
      no-body
      class="overflow-hidden"
      :class="disabled ? 'disabled' : null"
      :border-variant="checked ? 'success' : null"
      @click.prevent="toggle">
    <b-row no-gutters>
      <b-col md="2">
        <b-card-img :src="image" class="rounded-0"></b-card-img>
      </b-col>
      <b-col md="10">
        <b-card-body>
          <b-card-title class="title" :class="disabled ? 'text-muted' : null">
            <span>{{ title }}</span>
            <span>
              <b-form-checkbox
                  switch
                  size="lg"
                  :state="checked ? true : null"
                  :disabled="disabled"
                  v-model="checked"
                  @input="$emit('change', $event)">
              </b-form-checkbox>
            </span>
          </b-card-title>
          <b-card-text>
            <p :class="disabled ? 'text-muted' : null">
              <slot></slot>
            </p>
            <p>
              <small v-if="disabled" class="text-muted">{{ appName | titlecase }} is already installed</small>
              <small v-else class="text-muted">Installs {{ appName | titlecase }}</small>
            </p>
          </b-card-text>
        </b-card-body>
      </b-col>
    </b-row>
  </b-card>
</template>

<script>

export default {
  name: "UsagePromptCard",
  props: ['appName', 'title', 'image', 'checked', 'disabled'],
  model: {
    prop: 'checked',
    event: 'change',
  },

  methods: {
    toggle() {
      if (!this.disabled) {
        this.checked = !this.checked;
      }
    }
  }
}

</script>

<style scoped>

.title {
  display: flex;
  justify-content: space-between;
}

.card {
  cursor: pointer;
  &.disabled {
    cursor: not-allowed;
  }
}

</style>
