<template>
  <b-container>
    <b-row>
      <b-col></b-col>
      <b-col cols="8" class="pb-3">

        <h1 class="mt-5">Confirm your email address</h1>

        <div class="mt-4">
          <p>This Shard is <br>
            <ShardIdBadge :shard-id="$store.getters.short_shard_id"></ShardIdBadge>
          </p>
        </div>

        <div class="mt-4" v-if="!token">
          <b-alert show variant="danger">
            This link is incomplete, so there is nothing to confirm.
            Open the link from the confirmation email again, or use Send again in the Owner section
            in Settings, on a browser that is paired with this Shard.
          </b-alert>
        </div>

        <div class="mt-4" v-else-if="state === 'confirmed'">
          <b-alert show variant="success">
            That is everything we can do from here. If the link was still valid, this address now
            receives messages about your Shard.
          </b-alert>
          <p class="text-muted small">
            A confirmation link is valid for one hour and can be used once. If Settings still shows
            the address as waiting for confirmation, use Send again there.
          </p>
        </div>

        <div class="mt-4" v-else>
          <p>
            Confirm that this address should receive messages about your Shard —
            storage warnings, billing and service messages.
          </p>
          <b-alert show variant="danger" v-if="state === 'failed'">
            The confirmation could not be completed. Try again in a moment. If it keeps failing,
            use Send again in the Owner section in Settings, on a browser that is paired with this
            Shard.
          </b-alert>
          <b-button variant="primary" :disabled="state === 'confirming'" @click="confirm">
            <span v-if="state === 'confirming'"><b-spinner small></b-spinner></span>
            <span v-else>Confirm</span>
          </b-button>
        </div>

        <div class="mt-4">
          <b-button :variant="state === 'confirmed' ? 'primary' : 'outline-secondary'" :to="continueTarget">
            Continue to your Shard
          </b-button>
        </div>

      </b-col>
      <b-col></b-col>
    </b-row>
  </b-container>
</template>

<script>
import ShardIdBadge from "@/components/ShardIdBadge.vue";
import {readConfirmEmailToken} from "@/lib/owner-email";

export default {
  name: 'ConfirmEmail',
  components: {ShardIdBadge},

  data: function () {
    return {
      // Read once: the token is dropped from the URL after a confirmation.
      token: readConfirmEmailToken(window.location.search),
      state: 'idle', // idle | confirming | confirmed | failed
    }
  },

  computed: {
    continueTarget() {
      // The link is often opened on a device that was never paired, and the app
      // grid is useless there.
      return this.$store.state.meta.is_anonymous ? '/welcome' : '/';
    },
  },

  mounted() {
    // data() has the token, so the address bar and the session history do not
    // need to keep a single-use credential that a Referer header can carry out.
    this.dropTokenFromUrl();
    document.title = `Shard [${this.$store.getters.short_shard_id}] - Confirm Email`;
  },

  methods: {
    async confirm() {
      // Only on a click: a request the browser can make on its own would let a
      // mail scanner or a link prefetcher spend the single-use token.
      this.state = 'confirming';
      try {
        await this.$http.post('/core/public/users/confirm-email', {token: this.token});
        this.state = 'confirmed';
      } catch (e) {
        // Not the error object: it carries the request body, and with it the token.
        console.error('Failed to confirm the email address',
            (e.response && e.response.status) || e.message);
        this.state = 'failed';
      }
    },
    dropTokenFromUrl() {
      window.history.replaceState({}, '', window.location.pathname + window.location.hash);
    },
  },
}
</script>
