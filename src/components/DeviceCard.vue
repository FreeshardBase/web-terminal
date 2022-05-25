<template>
  <div>
    <b-card class="overflow-hidden" no-body>
      <b-row>
        <b-col md="2" class="text-center device-icon">
          <b-icon-square v-if="device.icon=='unknown'" font-scale="3"></b-icon-square>
          <b-icon-phone v-if="device.icon=='smartphone'" font-scale="3"></b-icon-phone>
          <b-icon-tablet v-if="device.icon=='tablet'" font-scale="3"></b-icon-tablet>
          <b-icon-laptop v-if="device.icon=='notebook'" font-scale="3"></b-icon-laptop>
          <b-icon-tv v-if="device.icon=='desktop'" font-scale="3"></b-icon-tv>
          <b-badge
              id="this-badge"
              v-if="isThisDevice"
              variant="primary">
            This
          </b-badge>
        </b-col>
        <b-col md="10">
          <b-card-body>
            <b-row>
              <b-col cols="8">
                <b-form-input v-if="editMode.isOn" v-model="editMode.name"></b-form-input>
                <h4 v-else class="text-truncate">{{ device.name | titlecase }}</h4>
              </b-col>
              <b-col class="text-right">
                <div v-if="editMode.isOn">
                  <b-icon-x-circle
                      class="h5 cursor"
                      variant="secondary"
                      @click="editMode.isOn=false"
                  ></b-icon-x-circle>
                  &nbsp;
                  <b-icon-check-circle
                      class="h5 cursor"
                      variant="success"
                  ></b-icon-check-circle>
                </div>
                <div v-else>
                  <b-icon-pencil-fill
                      class="h5 cursor"
                      variant="secondary"
                      @click="editMode.isOn=true"></b-icon-pencil-fill>
                </div>
              </b-col>
            </b-row>
            <b-row>
              <b-col><small>{{ lastConnectionString }}</small></b-col>
              <b-col v-if="editMode.isOn" class="text-right">
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

export default {
  name: "DeviceCard",
  data: function () {
    return {
      editMode: {
        isOn: false,
        name: this.device.name,
      },
    }
  },
  props: ['device'],
  computed: {
    lastConnectionString() {
      if (this.device.last_connection) {
        return `Last connection: ${moment(this.device.last_connection).fromNow()}`;
      } else {
        return 'Last connection: unknown';
      }
    },
    isThisDevice() {
      return this.$store.state.meta.device_id.substring(0, 6) === this.device.id;
    },
  },
  methods: {
    async deleteDevice() {
      await this.$http.delete(`/core/protected/terminals/id/${this.device.id}`)
      this.$emit('refresh');
    }
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