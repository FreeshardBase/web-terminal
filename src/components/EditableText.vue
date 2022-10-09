<template>
  <b-container>
    <b-row align-v="center">
      <b-col cols="10">

        <span><small>{{ title }}</small></span>
        <p v-if="editMode.state==='off'">{{ value || '[empty]'}}</p>
        <b-form-input
            v-else
            :disabled="editMode.state==='syncing'"
            v-model="editMode.editedValue"
        ></b-form-input>

      </b-col>
      <b-col cols="2">

        <div v-if="editMode.state==='off'">
          <b-icon-pencil-fill
              variant="secondary"
              class="cursor"
              @click="startEditing"
          ></b-icon-pencil-fill>
        </div>

        <div v-else>
          <b-icon-x-circle
              class="cursor"
              variant="secondary"
              @click="cancelEditing"
          ></b-icon-x-circle>
          &nbsp;
          <b-icon-check-circle
              class="cursor"
              variant="success"
              @click="confirmEditing"
          ></b-icon-check-circle>
        </div>

      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import _ from "lodash";

export default {
  name: 'EditableText',

  data: function () {
    return {
      editMode: {
        state: 'off', // off | on | syncing
        editedValue: _.cloneDeep(this.value),
      }
    }
  },

  props: [
      'title',
      'value',
  ],

  methods: {
    startEditing() {
      this.editMode = {
        state: 'on',
        editedValue: _.cloneDeep(this.value)
      };
    },
    async confirmEditing() {
      this.editMode.state = 'syncing';
      const component = this;
      const doneCallback = function () {
        component.editMode = {
          state: 'off',
          editedValue: _.cloneDeep(this.value)
        };
      }
      const eventBody = {
        value: this.editMode.editedValue,
        doneCallback,
      }
      await this.$emit('edited', eventBody);
    },
    cancelEditing() {
      this.editMode = {
        state: 'off',
        editedValue: _.cloneDeep(this.value)
      };
    },
  },
}
</script>

<style scoped>

.cursor {
  cursor: pointer;
}

</style>
