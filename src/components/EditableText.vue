<template>
  <b-container>
    <b-row align-v="center">
      <b-col cols="10">

        <span><small>{{ title }}</small></span>

        <div v-if="no_or_rows === 1">
          <p style="white-space: pre-wrap" v-if="editMode.state==='off'">{{ value || '[empty]' }}</p>
          <b-form v-else @submit.prevent="confirmEditing">
            <b-form-input
                ref="input"
                :disabled="editMode.state==='syncing'"
                v-model="editMode.editedValue"
            ></b-form-input>
          </b-form>
        </div>

        <div v-else>
          <div v-if="editMode.state==='off'" v-html="markdownToHtml(value)"></div>
          <b-form-textarea
              v-else
              ref="input"
              :disabled="editMode.state==='syncing'"
              v-model="editMode.editedValue"
              :rows="no_or_rows"
          ></b-form-textarea>
        </div>


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
import {marked} from "marked";

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
    'rows',
  ],

  computed: {
    no_or_rows() {
      return this.rows || 1;
    }
  },

  methods: {
    startEditing() {
      this.editMode = {
        state: 'on',
        editedValue: _.cloneDeep(this.value)
      };
      this.$nextTick(() => {
        this.$refs['input'].focus();
      })
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
    markdownToHtml(md) {
      return marked(md);
    },
  },
}
</script>

<style scoped>

.cursor {
  cursor: pointer;
}

</style>
