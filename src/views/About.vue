<template>
  <div>
    <navbar></navbar>
    <b-container class="mt-4">
      <b-row>

        <b-col>
          <h1>About</h1>
        </b-col>

        <b-col class="text-right">
          <b-button variant="outline-secondary">
            <b-icon-arrow-repeat @click="refresh"></b-icon-arrow-repeat>
          </b-button>
        </b-col>

      </b-row>

      <b-overlay :show="isUpdating" rounded="sm" variant="white" class="w-100 p-1">
        <b-row>

          <b-col>
            <TextField title="Machine ID" :content="profile.vm_id || 'unknown'"/>
            <TextField title="Owner" :content="profile.owner || 'unknown'"/>
            <TextField title="Owner Email" :content="profile.owner_email || 'unknown'"/>
            <TextField title="Created" :content="profile.time_created | formatDateHumanize"/>
            <TextField title="Assigned" :content="profile.time_assigned | formatDateHumanize"/>
            <TextField v-if="profile.delete_after" title="Scheduled to delete"
                       :content="profile.delete_after | formatDateHumanize"/>
            <TextField v-else title="Scheduled to delete" content="never"/>

            <div>
              <span><small>Size</small></span>
              <small>
                <b-list-group horizontal>
                  <b-list-group-item :class="{'list-group-item-primary': profile.portal_size === 'xs'}">XS
                  </b-list-group-item>
                  <b-list-group-item :class="{'list-group-item-primary': profile.portal_size === 's'}">S
                  </b-list-group-item>
                  <b-list-group-item :class="{'list-group-item-primary': profile.portal_size === 'm'}">M
                  </b-list-group-item>
                  <b-list-group-item :class="{'list-group-item-primary': profile.portal_size === 'l'}">L
                  </b-list-group-item>
                  <b-list-group-item :class="{'list-group-item-primary': profile.portal_size === 'xl'}">XL
                  </b-list-group-item>
                </b-list-group>
              </small>
            </div>
          </b-col>

        </b-row>
      </b-overlay>
    </b-container>
  </div>
</template>

<script>
import Navbar from "@/components/Navbar";
import TextField from "@/views/TextField.vue";

export default {
  name: "About",
  components: {TextField, Navbar},

  data: function () {
    return {
      isUpdating: false,
      profile: {},
    }
  },

  methods: {
    async refresh() {
      this.isUpdating = true;
      try {
        const response = await this.$http.get('core/protected/management/profile');
        this.profile = response.data;
      } catch (e) {
        console.log(e.response);
        this.$bvToast.toast(e.response.data.detail, {
          title: 'Error during loading',
          autoHideDelay: 5000,
          appendToast: true,
          solid: true,
          variant: 'danger',
        });
      } finally {
        this.isUpdating = false;
      }
    },
  },

  async mounted() {
    document.title = `Portal [${this.$store.getters.short_portal_id}] - About`;
    await this.refresh();
  },
}
</script>

