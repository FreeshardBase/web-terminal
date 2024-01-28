<template>
  <b-container>
    <b-row align-v="start">
      <b-col xl="4" lg="6" sm="10">

        <span><small>{{ title }}</small></span>

        <div>
          <p style="white-space: pre-wrap">
            <AvatarWrapper
                size="7em"
                :src="image_ref"
                :name="name"
            ></AvatarWrapper>
          </p>
          <p>
            <b-form-file
                v-model="avatarFile"
                placeholder="Browse or drop an image here..."
                drop-placeholder="Drop file here..."
                accept="image/*"
            ></b-form-file>
            <small>
              <b-icon-exclamation-triangle-fill></b-icon-exclamation-triangle-fill>
              Image must be square or it will be distorted.
            </small>
          </p>
          <p>
            <b-button variant="success" :disabled="!Boolean(avatarFile)" @click="uploadImage">
              <b-icon-box-arrow-in-up></b-icon-box-arrow-in-up>
              Upload
            </b-button>
            <b-button variant="danger" @click="clearImage">
              <b-icon-trash></b-icon-trash>
              Clear
            </b-button>
          </p>
        </div>

      </b-col>
    </b-row>
  </b-container>
</template>

<script>

import AvatarWrapper from "@/components/AvatarWrapper.vue";

export default {
  name: 'EditableAvatar',
  components: {AvatarWrapper},

  data: function () {
    return {
      avatarFile: null,
      state: 'idle',
      render: true,
    }
  },

  props: [
    'title',
    'image_ref',
    'name',
  ],

  methods: {

    async uploadImage() {
      this.state = 'syncing';
      const component = this;
      const doneCallback = async function () {
        component.state = 'idle';
      }
      const eventBody = {
        value: this.avatarFile,
        doneCallback,
      }
      await this.$emit('edited', eventBody);
    },

    async clearImage() {
      await this.$emit('deleted');
    },
  },
}
</script>

<style scoped>
</style>
