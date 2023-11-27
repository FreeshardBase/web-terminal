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
              <small v-if="disabled" class="text-muted">{{ app.name | titlecase }} is already installed</small>
              <small v-else class="text-muted">Installs {{ app.name | titlecase }}</small>
              <small v-if="!canBeStarted" class="text-muted">
                <br>
                <b-icon-exclamation-triangle-fill variant="warning"></b-icon-exclamation-triangle-fill>
                Starting the app requires a Portal of size <b>{{ app.minimum_portal_size | uppercase }}</b> or larger -
                Current size: <b>{{ $store.state.profile.portal_size | uppercase }}</b>
              </small>
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
  props: ['app', 'title', 'image', 'checked', 'disabled'],
  model: {
    prop: 'checked',
    event: 'change',
  },

  computed: {
    canBeStarted() {
      const sizes = ['xs', 's', 'm', 'l', 'xl'];
      if (this.$store.state.profile) {
        const currentSize = sizes.indexOf(this.$store.state.profile.portal_size);
        const requiredSize = sizes.indexOf(this.app.minimum_portal_size);
        return currentSize >= requiredSize;
      } else {
        return true;
      }
    }
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
