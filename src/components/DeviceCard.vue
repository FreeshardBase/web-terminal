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
            <b-card-title class="text-truncate">
              {{ device.name | titlecase }}
            </b-card-title>
            <b-row>
              <b-col><small>{{ lastConnectionString }}</small></b-col>
              <b-col class="text-right">
                <b-col><span class="text-danger delete-button" @click="deleteDevice">
                  <small>Remove</small>
                </span></b-col>
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

.delete-button {
  cursor: pointer;
}

</style>