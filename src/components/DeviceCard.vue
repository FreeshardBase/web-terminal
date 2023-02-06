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
              v-if="isThisDevice && editMode.state==='off'"
              variant="primary">
            This
          </b-badge>
        </b-col>
        <b-col cols="7" class="padded">
          <b-row>
            <b-col>

              <h4 v-if="editMode.state==='off'" class="text-truncate">{{ device.name }}</h4>

              <b-form v-else @submit.prevent="confirmEditing">
                <b-form-input
                    ref="name-input"
                    :disabled="editMode.state==='syncing'"
                    v-model="editMode.editedDevice.name"
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
            <b-col v-if="editMode.state!=='off' && !isThisDevice" class="text-center">
                  <span class="text-danger cursor" @click="deleteDevice">
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
  name: "DeviceCard",
  data: function () {
    return {
      editMode: {
        state: 'off',  // off | on | syncing
        editedDevice: _.cloneDeep(this.device),
      },
      now: moment.now(),
      tick: undefined,
    }
  },
  props: ['device'],
  computed: {
    lastConnectionText() {
      if (this.device.last_connection) {
        return `Last connection: ${moment.utc(this.device.last_connection).from(this.now)}`;
      } else {
        return 'Last connection: unknown';
      }
    },
    isThisDevice() {
      return this.$store.state.meta.device_id.substring(0, 6) === this.device.id;
    },
    displayIcon() {
      if (this.editMode.state === 'off') {
        return this.device.icon;
      } else {
        return this.editMode.editedDevice.icon;
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
      await this.$http.put(`/core/protected/terminals/id/${this.device.id}`, this.editMode.editedDevice);
      await this.$emit('refresh');
      this.editMode.state = 'off';
    },
    cancelEditing() {
      this.editMode.state = 'off';
    },
    async deleteDevice() {
      await this.$http.delete(`/core/protected/terminals/id/${this.device.id}`)
      this.$emit('refresh');
    },
    rotateIcon(forward) {
      const icons = ['unknown', 'smartphone', 'tablet', 'notebook', 'desktop'];
      const currentIconIndex = icons.indexOf(this.editMode.editedDevice.icon);
      if (forward) {
        const nextIconIndex = (currentIconIndex + 1) % icons.length;
        this.editMode.editedDevice.icon = icons[nextIconIndex];
      } else {
        const nextIconIndex = (currentIconIndex - 1 + icons.length) % icons.length;
        this.editMode.editedDevice.icon = icons[nextIconIndex];
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
