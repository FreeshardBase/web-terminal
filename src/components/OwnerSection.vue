<template>
  <b-card title="Owner">

    <b-alert show variant="warning" v-if="loadFailed">
      Your owner details could not be loaded, so name and email cannot be changed right now.
    </b-alert>

    <div v-else-if="!user">
      <b-spinner small></b-spinner>
    </div>

    <template v-else>
      <EditableText title="Name" :value="user.display_name" @edited="saveName($event)"></EditableText>

      <b-container>
        <b-row>
          <b-col cols="10">
            <p class="hint">
              Your name as this Shard's owner. The name on your public page is a different one,
              edited under Public View.
            </p>
          </b-col>
        </b-row>
      </b-container>

      <EditableText title="Email" :value="user.email || ''" @edited="saveEmail($event)"></EditableText>

      <b-container>
        <b-row>
          <b-col cols="10">

            <p class="hint" v-if="emailState === 'none'">
              No address yet.
              <span v-if="emailEnabled">
                Add one so we can reach you about your Shard — storage warnings, billing and
                service messages all go there.
              </span>
            </p>

            <template v-else-if="emailState === 'pending'">
              <p class="hint" v-if="deliveryFailed">
                <b>{{ user.pending_email }}</b> was saved, but the confirmation email could not be
                sent yet. The address is waiting for confirmation; send the email again in a moment.
              </p>
              <p class="hint" v-else>
                <b>{{ user.pending_email }}</b> is waiting for confirmation. Open the link we sent
                there, or send it again if it never arrived. A link is valid for one hour.
              </p>
              <b-button
                  v-if="emailEnabled"
                  size="sm"
                  variant="outline-primary"
                  :disabled="busy"
                  @click="resendConfirmation">
                Send again
              </b-button>
              <b-button
                  size="sm"
                  variant="link"
                  class="text-danger"
                  :disabled="busy"
                  @click="cancelPending">
                Cancel
              </b-button>
            </template>

            <p class="hint" v-if="!emailEnabled">
              This Shard cannot send email, so the address is taken as typed, with no confirmation step.
            </p>

          </b-col>
        </b-row>
      </b-container>
    </template>

  </b-card>
</template>

<script>
import EditableText from "@/components/EditableText";
import {toastMixin} from "@/mixins";
import {errorDetail, isDeliveryFailure, ownerEmailState} from "@/lib/owner-email";

const USER_URL = '/core/protected/users/me';

export default {
  name: 'OwnerSection',
  components: {EditableText},
  mixins: [toastMixin],

  data: function () {
    return {
      user: null,
      emailEnabled: true,
      loadFailed: false,
      deliveryFailed: false,
      busy: false,
    }
  },

  computed: {
    emailState() {
      return ownerEmailState(this.user);
    },
  },

  async mounted() {
    await this.load();
  },

  methods: {
    async load() {
      const [user, settings] = await Promise.allSettled([
        this.$http.get(USER_URL),
        this.$http.get('/core/protected/settings'),
      ]);
      if (user.status === 'fulfilled') {
        this.user = user.value.data;
        this.loadFailed = false;
      } else {
        console.error('Failed to load the owner row', user.reason);
        this.loadFailed = true;
      }
      if (settings.status === 'fulfilled') {
        this.emailEnabled = settings.value.data.email_enabled;
      } else {
        console.error('Failed to load the shard settings', settings.reason);
      }
    },
    async reloadUser() {
      const response = await this.$http.get(USER_URL);
      this.user = response.data;
    },
    async saveName(eventBody) {
      const name = (eventBody.value || '').trim();
      if (!name) {
        this.toastError('Name cannot be empty');
        eventBody.doneCallback();
        return;
      }
      try {
        const response = await this.$http.patch(USER_URL, {display_name: name});
        this.user = response.data;
      } catch (e) {
        this.toastError('Could not save the name', errorDetail(e, 'Please try again.'));
      } finally {
        eventBody.doneCallback();
      }
    },
    async saveEmail(eventBody) {
      const address = (eventBody.value || '').trim();
      this.deliveryFailed = false;
      try {
        const response = await this.$http.patch(USER_URL, {email: address || null});
        this.user = response.data;
        if (this.emailState === 'pending') {
          this.toastSuccess('Confirmation email sent',
              `Open the link we sent to ${this.user.pending_email} to start using it.`);
        } else if (address) {
          this.toastSuccess('Address saved');
        } else {
          this.toastSuccess('Address removed');
        }
      } catch (e) {
        if (isDeliveryFailure(e)) {
          // The candidate was stored; only the mail did not go out.
          this.deliveryFailed = true;
          try {
            await this.reloadUser();
          } catch (reloadError) {
            this.user = {...this.user, pending_email: address};
          }
          this.toastError('Confirmation email not sent',
              'The address was saved, but the confirmation email could not be sent. Send it again in a moment.');
        } else {
          this.toastError('Could not save the address', errorDetail(e, 'Please try again.'));
        }
      } finally {
        eventBody.doneCallback();
      }
    },
    async resendConfirmation() {
      this.busy = true;
      try {
        await this.$http.post(`${USER_URL}/email/resend`);
        this.deliveryFailed = false;
        this.toastSuccess('Confirmation email sent',
            `Open the link we sent to ${this.user.pending_email}.`);
      } catch (e) {
        this.toastError('Could not send the confirmation email', errorDetail(e, 'Please try again.'));
      } finally {
        this.busy = false;
      }
    },
    async cancelPending() {
      this.busy = true;
      try {
        await this.$http.delete(`${USER_URL}/email/pending`);
        this.deliveryFailed = false;
        this.user = {...this.user, pending_email: null};
        this.toastSuccess('Address change cancelled');
      } catch (e) {
        this.toastError('Could not cancel the address change', errorDetail(e, 'Please try again.'));
      } finally {
        this.busy = false;
      }
    },
  },
}
</script>

<style scoped>

.hint {
  color: gray;
  font-size: small;
}

</style>
