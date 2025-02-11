<template>
  <div>
    <navbar></navbar>
    <b-container class="mt-4">
      <b-row>

        <b-col>
          <h1>Public View</h1>

          <p>
            <b-icon-exclamation-triangle variant="warning"></b-icon-exclamation-triangle>
            This information about yourself is visible at your
            <a href="/#/welcome" target="_blank">public page
              <b-icon-box-arrow-up-right></b-icon-box-arrow-up-right>
            </a>.
          </p>

          <EditableAvatar title="Image" :image_ref="avatarRef" :name="identity.name"
                          @edited="uploadAvatar($event)" @deleted="clearAvatar"></EditableAvatar>
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
import EditableAvatar from "@/components/EditableAvatar.vue";

export default {
  name: "Profile",
  components: {EditableAvatar, EditableText, Navbar},
  data: function () {
    return {
      identity: {
        id: '',
        name: '',
        email: '',
        description: '',
      },
      avatarRef: ''
    }
  },

  async mounted() {
    document.title = `Shard [${this.$store.getters.short_shard_id}] - Profile`;
    this.refreshAvatar();
    await this.refresh();
  },

  methods: {
    async refresh() {
      const response = await this.$http.get('/core/protected/identities/default');
      this.identity = response.data;
      await this.$store.dispatch('query_meta_data');
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
    async uploadAvatar(eventBody) {
      const formData = new FormData();
      formData.append('file', eventBody.value);
      await this.$http.put(`/core/protected/identities/default/avatar`, formData);
      await eventBody.doneCallback();
      this.refreshAvatar();
    },
    async clearAvatar() {
      await this.$http.delete(`/core/protected/identities/default/avatar`);
      this.refreshAvatar();
    },
    refreshAvatar() {
      this.avatarRef = 'core/protected/identities/default/avatar?' + performance.now()
    },
  }
}
</script>

<style scoped>

</style>
