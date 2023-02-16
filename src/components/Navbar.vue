<template>
  <div>
    <Banner></Banner>
    <b-navbar toggleable="lg" type="dark" variant="dark" sticky>

      <b-navbar-brand to="/">
        <PortalIdBadge :portal-id="$store.getters.short_portal_id"/>
      </b-navbar-brand>

      <b-nav-toggle target="nav-collapse"></b-nav-toggle>

      <b-collapse id="nav-collapse" is-nav>

        <b-navbar-nav id="nav-home">
          <b-nav-item v-if="$route.name==='Portal'">
            <b><b-icon-house-fill></b-icon-house-fill> Home</b>
          </b-nav-item>
          <b-nav-item v-else to="/">
            <b-icon-house></b-icon-house> Home
          </b-nav-item>
        </b-navbar-nav>

        <b-navbar-nav id="nav-apps">
          <b-nav-item v-if="$route.name==='Apps'">
            <b><b-icon-grid-fill></b-icon-grid-fill> Apps</b>
          </b-nav-item>
          <b-nav-item v-else to="/apps">
            <b-icon-grid></b-icon-grid> Apps
          </b-nav-item>
        </b-navbar-nav>

        <b-navbar-nav id="nav-devices">
          <b-nav-item v-if="$route.name==='Devices'">
            <b><b-icon-laptop-fill></b-icon-laptop-fill> Devices</b>
          </b-nav-item>
          <b-nav-item v-else to="/devices">
            <b-icon-laptop></b-icon-laptop> Devices
          </b-nav-item>
        </b-navbar-nav>

        <b-navbar-nav id="nav-public">
          <b-nav-item v-if="$route.name==='Public'">
            <b><b-icon-person-fill></b-icon-person-fill> Public</b>
          </b-nav-item>
          <b-nav-item v-else to="/public">
            <b-icon-person></b-icon-person> Public
          </b-nav-item>
        </b-navbar-nav>

        <b-navbar-nav id="nav-peers" v-if="false">
          <b-nav-item v-if="$route.name==='Peers'">
            <b><b-icon-people-fill></b-icon-people-fill> Peers</b>
          </b-nav-item>
          <b-nav-item v-else to="/peers">
            <b-icon-people></b-icon-people> Peers
          </b-nav-item>
        </b-navbar-nav>

        <b-navbar-nav id="nav-feedback" class="ml-auto">
          <b-nav-item id="nav-feedback" v-b-modal.feedback-modal>
            <b-icon-chat-right-text></b-icon-chat-right-text>
            Feedback
          </b-nav-item>
        </b-navbar-nav>

        <b-navbar-nav id="nav-settings">
          <b-nav-item v-if="$route.name==='Settings'">
            <b><b-icon-gear-fill></b-icon-gear-fill> {{ $store.state.meta.portal_identity.name }}</b>
          </b-nav-item>
          <b-nav-item v-else to="/settings">
            <b-icon-gear></b-icon-gear> {{ $store.state.meta.portal_identity.name }}
          </b-nav-item>
        </b-navbar-nav>

      </b-collapse>
    </b-navbar>

    <b-modal id="feedback-modal" title="Quick feedback" cancel-disabled>
      <b-form-textarea
          v-model="feedback.text"
          rows="3"
          max-rows="9"
          :disabled="feedback.isSending || feedback.sendConfirmed || feedback.sendError"
      ></b-form-textarea>
      <p class="text-muted"><small>What you write here is a one-off message for us
        and currently we have no way of responding directly to it.
        For more elaborate feedback or a dialogue, you can use our
        <a href="https://feedback.getportal.org" target="_blank">feedback platform</a>
        or <a href="mailto:contact@getportal.org">write us</a>
        or visit our <a href="https://discord.gg/ZXQDuTGcCf" target="_blank">Discord</a>.</small></p>
      <template #modal-footer>
        <b-button
            :variant="feedback.sendConfirmed ? 'success' : feedback.sendError ? 'danger' : 'primary'"
            :disabled="feedback.text.length===0 || feedback.isSending || feedback.sendConfirmed || feedback.sendError"
            @click="sendFeedback"
        >
          <span v-if="feedback.sendConfirmed"><b-icon-check></b-icon-check></span>
          <span v-else-if="feedback.sendError"><b-icon-x></b-icon-x></span>
          <span v-else-if="feedback.isSending"><b-spinner small></b-spinner></span>
          <span v-else>Send</span>
        </b-button>
      </template>
    </b-modal>

  </div>
</template>

<script>
import PortalIdBadge from "@/components/PortalIdBadge";
import Banner from "@/components/Banner.vue";

export default {
  name: "Navbar",
  components: {Banner, PortalIdBadge},
  data() {
    return {
      feedback: {
        text: '',
        isSending: false,
        sendConfirmed: false,
        sendError: false,
      }
    }
  },
  methods: {
    async sendFeedback() {
      this.feedback.isSending = true;
      try {
        await this.$http.post('/core/protected/feedback/quick', {'text': this.feedback.text});
      } catch (e) {
        console.log(e);
        this.feedback.sendError = true;
        await new Promise(r => setTimeout(r, 1000));
        this.feedback.isSending = false;
        this.feedback.sendError = false;
        return;
      }
      this.feedback.sendConfirmed = true;
      await new Promise(r => setTimeout(r, 1000));
      this.$bvModal.hide('feedback-modal');
      await new Promise(r => setTimeout(r, 500));
      this.feedback.isSending = false;
      this.feedback.sendConfirmed = false;
      this.feedback.text = '';
    },
  },
}
</script>

