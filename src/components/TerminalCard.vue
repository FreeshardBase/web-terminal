<template>
  <div>
    <b-card no-body>
      <b-row>
        <b-col class="text-center padded" cols="2">
          <b-icon-phone v-if="displayIcon=='smartphone'" font-scale="3"></b-icon-phone>
          <b-icon-tablet v-else-if="displayIcon=='tablet'" font-scale="3"></b-icon-tablet>
          <b-icon-laptop v-else-if="displayIcon=='notebook'" font-scale="3"></b-icon-laptop>
          <b-icon-tv v-else-if="displayIcon=='desktop'" font-scale="3"></b-icon-tv>
          <b-icon-square v-else font-scale="3"></b-icon-square>
          <div v-if="editMode.state!=='off'">
            <b-button-group class="very-small">
              <b-button @click="rotateIcon(false)" variant="primary">
                <b-icon-caret-left-fill></b-icon-caret-left-fill>
              </b-button>
              <b-button @click="rotateIcon(true)" variant="primary">
                <b-icon-caret-right-fill></b-icon-caret-right-fill>
              </b-button>
            </b-button-group>
          </div>
          <b-badge
              id="this-badge"
              v-if="isThisTerminal && editMode.state==='off'"
              variant="primary">
            This
          </b-badge>
        </b-col>
        <b-col cols="7" class="padded">
          <b-row>
            <b-col>

              <h4 v-if="editMode.state==='off'" class="text-truncate">{{ terminal.name }}</h4>

              <b-form v-else @submit.prevent="confirmEditing">
                <b-form-input
                    ref="name-input"
                    :disabled="editMode.state==='syncing'"
                    v-model="editMode.editedTerminal.name"
                ></b-form-input>
              </b-form>

              <p><small>{{ lastConnectionText }}</small></p>

            </b-col>

          </b-row>
        </b-col>
        <b-col cols="3" class="padded">
          <b-row>
            <b-col class="text-center">

              <div v-if="editMode.state==='off'">
                <b-icon-pencil-fill
                    class="h5 cursor"
                    variant="secondary"
                    @click="startEditing"></b-icon-pencil-fill>
              </div>

              <div v-else>

                <b-icon-x-circle
                    class="h5 cursor"
                    variant="secondary"
                    @click="cancelEditing"
                ></b-icon-x-circle>
                &nbsp;
                <b-icon-check-circle
                    class="h5 cursor"
                    variant="success"
                    @click="confirmEditing"
                ></b-icon-check-circle>

              </div>

            </b-col>
          </b-row>
          <b-row>
            <b-col v-if="editMode.state!=='off' && !isThisTerminal" class="text-center">
                  <span class="text-danger cursor" @click="deleteTerminal">
                  <small>REMOVE</small>
                </span>
            </b-col>
          </b-row>
        </b-col>
      </b-row>
    </b-card>
  </div>
</template>

<script>
import moment from "moment/moment";
import _ from "lodash";

export default {
  name: "TerminalCard",
  data: function () {
    return {
      editMode: {
        state: 'off',  // off | on | syncing
        editedTerminal: _.cloneDeep(this.terminal),
      },
      now: moment.now(),
      tick: undefined,
    }
  },
  props: ['terminal'],
  computed: {
    lastConnectionText() {
      if (this.terminal.last_connection) {
        return `Last connection: ${moment.utc(this.terminal.last_connection).from(this.now)}`;
      } else {
        return 'Last connection: unknown';
      }
    },
    isThisTerminal() {
      return this.$store.state.meta.device_id.substring(0, 6) === this.terminal.id;
    },
    displayIcon() {
      if (this.editMode.state === 'off') {
        return this.terminal.icon;
      } else {
        return this.editMode.editedTerminal.icon;
      }
    },
  },
  methods: {
    startEditing() {
      this.editMode.state = 'on';
      this.$nextTick(() => {
        this.$refs['name-input'].focus();
      });
    },
    async confirmEditing() {
      this.editMode.state = 'syncing';
      await this.$http.put(`/core/protected/terminals/id/${this.terminal.id}`, this.editMode.editedTerminal);
      this.editMode.state = 'off';
    },
    cancelEditing() {
      this.editMode.state = 'off';
    },
    async deleteTerminal() {
      await this.$http.delete(`/core/protected/terminals/id/${this.terminal.id}`)
    },
    rotateIcon(forward) {
      const icons = ['unknown', 'smartphone', 'tablet', 'notebook', 'desktop'];
      const currentIconIndex = icons.indexOf(this.editMode.editedTerminal.icon);
      if (forward) {
        const nextIconIndex = (currentIconIndex + 1) % icons.length;
        this.editMode.editedTerminal.icon = icons[nextIconIndex];
      } else {
        const nextIconIndex = (currentIconIndex - 1 + icons.length) % icons.length;
        this.editMode.editedTerminal.icon = icons[nextIconIndex];
      }
    },
  },
  mounted: function () {
    const this_ = this;
    this.tick = setInterval(function () {
      this_.now = moment.now();
    }, 1000);
  },
  destroyed: function () {
    clearInterval(this.tick);
  },
}
</script>

<style scoped>

.card {
  max-width: 540px;
  height: 6em;
}

.cursor {
  cursor: pointer;
}

.padded {
  padding: 1em;
}

.very-small button {
  padding: 0.15rem 0.3rem;
  font-size: 0.675rem;
}

</style>
