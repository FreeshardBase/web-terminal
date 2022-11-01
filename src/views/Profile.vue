<template>
  <div>
    <navbar></navbar>
    <b-container class="mt-4">
      <b-row>

        <b-col>
          <h1>Profile</h1>

          <p>
            <b-icon-exclamation-triangle variant="warning"></b-icon-exclamation-triangle>
            This information about yourself is publicly visible at your <router-link to="/welcome">welcome screen</router-link>.
          </p>

          <EditableText title="Name" :value="identity.name"
                        @edited="updateField('name', $event)"></EditableText>
          <EditableText title="Email" :value="identity.email"
                        @edited="updateField('email', $event)"></EditableText>
          <EditableText title="Description" :value="identity.description" rows="5"
                        @edited="updateField('description', $event)"></EditableText>
        </b-col>

      </b-row>
    </b-container>
  </div>
</template>

<script>
import Navbar from "@/components/Navbar";
import EditableText from "@/components/EditableText";

export default {
  name: "Profile",
  components: {EditableText, Navbar},
  data: function () {
    return {
      identity: {
        id: '',
        name: '',
        email: '',
        description: '',
      }
    }
  },

  async mounted() {
    document.title = `Portal [${this.$store.getters.short_portal_id}] - Profile`;
    await this.refresh();
  },

  methods: {
    async refresh() {
      const response = await this.$http.get('/core/protected/identities/default');
      this.identity = response.data;
    },
    async updateField(field, eventBody) {
      const body = {
        id: this.identity.id,
      };
      body[field] = eventBody.value;
      await this.$http.put('/core/protected/identities', body);
      await this.refresh();
      eventBody.doneCallback();
    },
  }
}
</script>

<style scoped>

</style>
