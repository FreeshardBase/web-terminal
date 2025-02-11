<template>
  <b-container>
    <b-row>
      <b-col></b-col>
      <b-col cols="8" class="pb-3">
        <div>
          <h1 class="mt-5">Restarting Shard</h1>
        </div>

        <div class="mt-4 mb-4">
          <ShardIdBadge :shard-id="$store.state.meta.identity.id"></ShardIdBadge>
        </div>

        <b-spinner style="width: 4rem; height: 4rem;" class="mb-4" variant="secondary"></b-spinner>

        <div v-if="phase === 'pending'">
          <p v-if="seconds < 10">Shard restart was triggered</p>
          <p v-else-if="seconds < 30">Restarting Shard soon</p>
          <p v-else-if="seconds < 50">Any second now...</p>
          <p v-else>
            Shard is still alive and kicking.
            Maybe something went wrong.
            Try again or contact support <a href="mailto:contact@freeshard.net">here</a>.
          </p>
        </div>
        <div v-else-if="phase === 'unresponsive'">
          <p v-if="seconds < 45">Shard went down, waiting for restart</p>
          <p v-else-if="seconds < 90">Be patient, sometimes it may take a moment</p>
          <p v-else-if="seconds < 60*4">Perhaps this time there is a lot to do...</p>
          <p v-else-if="seconds < 60*7">Something is strange, it usually does not take so long</p>
          <p v-else-if="seconds < 60*12">
            It seems like something went wrong.
            Better contact support <a href="mailto:contact@freeshard.net">here</a>.
          </p>
          <p v-else-if="seconds < 60*20">
            Wow, you are really patient.
            But this Shard is most probably broken.
            You should really <a href="mailto:contact@freeshard.net">contact support</a>.
          </p>
          <p v-else>
            Knock knock!
            Is someone there?
            This Shard broke down and needs help.
            Please <a href="mailto:contact@freeshard.net">contact support</a>.
          </p>
        </div>

      </b-col>
      <b-col></b-col>
    </b-row>
  </b-container>
</template>

<script>
import ShardIdBadge from "@/components/ShardIdBadge.vue";

export default {
  name: "Restart",
  components: {ShardIdBadge},

  data: function () {
    return {
      message: 'Your Shard will restart soon',
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
        window.location.replace('/');
      }
    },
  },

  async mounted() {
    document.title = `Shard [${this.$store.getters.short_shard_id}] - Restarting`;
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
