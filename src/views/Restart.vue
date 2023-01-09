<template>
  <b-container>
    <b-row>
      <b-col></b-col>
      <b-col cols="8" class="pb-3">
        <div>
          <h1 class="mt-5">Restarting Portal</h1>
        </div>

        <div class="mt-4 mb-4">
          <PortalIdBadge :portal-id="$store.state.meta.portal_identity.id"></PortalIdBadge>
        </div>

        <b-spinner style="width: 4rem; height: 4rem;" class="mb-4" variant="secondary"></b-spinner>

        <div v-if="phase === 'pending'">
          <p v-if="seconds < 10">Portal restart was triggered</p>
          <p v-else-if="seconds < 30">Restarting Portal soon</p>
          <p v-else-if="seconds < 50">Any second now...</p>
          <p v-else>
            Portal is still alive and kicking.
            Maybe something went wrong.
            Try again or contact support <a href="mailto:contact@getportal.org">here</a>.
          </p>
        </div>
        <div v-else-if="phase === 'unresponsive'">
          <p v-if="seconds < 30">Portal went down, waiting for restart</p>
          <p v-else-if="seconds < 60">Be patient, sometimes it may take a moment</p>
          <p v-else-if="seconds < 60*3">Perhaps this time there is a lot to do...</p>
          <p v-else-if="seconds < 60*5">Something is strange, it usually does not take so long</p>
          <p v-else-if="seconds < 60*10">
            It seems like something went wrong.
            Better contact support <a href="mailto:contact@getportal.org">here</a>.
          </p>
          <p v-else-if="seconds < 60*20">
            Wow, you are really patient.
            But this Portal is most probably broken.
            You should really <a href="mailto:contact@getportal.org">contact support</a>.
          </p>
          <p v-else>
            Knock knock!
            Is someone there?
            This Portal broke down and needs help.
            Please <a href="mailto:contact@getportal.org">contact support</a>.
          </p>
        </div>

      </b-col>
      <b-col></b-col>
    </b-row>
  </b-container>
</template>

<script>
import PortalIdBadge from "@/components/PortalIdBadge.vue";

export default {
  name: "Restart",
  components: {PortalIdBadge},

  data: function () {
    return {
      message: 'Your Portal will restart soon',
      intervals: [],
      // phases are 'pending', 'unresponsive'
      phase: 'pending',
      seconds: 0,
    }
  },

  methods: {
    async retry() {
      try {
        await this.$http.get('/core/public/meta/whoareyou');
      } catch (e) {
        if (this.phase === 'pending') {
          this.phase = 'unresponsive';
          this.seconds = 0;
        }
        return;
      }
      if (this.phase === 'unresponsive') {
        await this.$router.replace('/');
      }
    },
  },

  async mounted() {
    document.title = `Portal [${this.$store.getters.short_portal_id}] - Restarting`;
    this.intervals.push(setInterval(this.retry, 2000));
    this.intervals.push(setInterval(() => {this.seconds += 1;}, 1000));
  },

  beforeDestroy() {
    this.intervals.forEach(i => clearInterval(i));
  }
}
</script>

<style scoped>

div {
  text-align: center;
}

</style>
