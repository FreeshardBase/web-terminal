<template>
  <div>
    <b-card class="overflow-hidden" no-body>
      <b-row>
        <b-col md="2" class="text-center device-icon">
          <b-icon-phone v-if="displayIcon=='smartphone'" font-scale="3"></b-icon-phone>
          <b-icon-tablet v-else-if="displayIcon=='tablet'" font-scale="3"></b-icon-tablet>
          <b-icon-laptop v-else-if="displayIcon=='notebook'" font-scale="3"></b-icon-laptop>
          <b-icon-tv v-else-if="displayIcon=='desktop'" font-scale="3"></b-icon-tv>
          <b-icon-square v-else font-scale="3"></b-icon-square>
          <div v-if="editMode.state!=='off'" class="cursor" @click="rotateIcon">
            <b-icon-arrow-return-right></b-icon-arrow-return-right>
          </div>
          <b-badge
              id="this-badge"
              v-if="isThisDevice && editMode.state==='off'"
              variant="primary">
            This
          </b-badge>
        </b-col>
        <b-col md="10">
          <b-card-body>
            <b-row>
              <b-col cols="8">

                <h4 v-if="editMode.state==='off'" class="text-truncate">{{ device.name }}</h4>

                <b-form-input
                    v-else
                    :disabled="editMode.state==='syncing'"
                    v-model="editMode.editedDevice.name"></b-form-input>

              </b-col>
              <b-col class="text-right">

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
              <b-col><small>{{ lastConnectionText }}</small></b-col>
              <b-col v-if="editMode.state!=='off' && !isThisDevice" class="text-right">
                  <span class="text-danger cursor" @click="deleteDevice">
                  <small>REMOVE</small>
                </span>
              </b-col>
            </b-row>
          </b-card-body>
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
    }
  },
  props: ['device'],
  computed: {
    lastConnectionText() {
      if (this.device.last_connection) {
        return `Last connection: ${moment(this.device.last_connection).fromNow()}`;
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
    rotateIcon() {
      const icons = ['unknown', 'smartphone', 'tablet', 'notebook', 'desktop'];
      const currentIconIndex = icons.indexOf(this.editMode.editedDevice.icon);
      const nextIconIndex = (currentIconIndex + 1) % icons.length;
      this.editMode.editedDevice.icon = icons[nextIconIndex];
    },
  }
}
</script>

<style scoped>

.device-icon {
  margin-top: 1em;
}

.card {
  max-width: 540px;
  height: 6em;
}

.cursor {
  cursor: pointer;
}

</style>