<template>
  <div @click="open" id="main" ref="main" class="grid" :class="{'active': !isBusy, 'blocked': !canBeStarted}">
    <div v-if="isBusy">
      <b-spinner class="app-icon"></b-spinner>
    </div>
    <div v-else>
      <img
          :id="app.name"
          v-show="iconLoaded"
          :src="iconSrc"
          alt="🔲"
          class="app-icon"
          @load="iconLoaded=true">
      <b-icon-box v-show="!iconLoaded" class="app-icon"></b-icon-box>
    </div>
    <div class="status text-secondary">
      <b-icon-circle-fill v-if="app.status === 'running'"></b-icon-circle-fill>
      <div v-else></div>
    </div>
    <div>{{ (app.meta && app.meta.pretty_name) || app.name }}</div>

    <b-popover :target="this.$refs.main" ref="popover" placement="bottom">
      This app requires a VM of size <b>{{ minimumVmSize | uppercase }}</b> or larger -
      Current size: <b>{{ $store.state.profile.vm_size | uppercase }}</b><br>
      <RouterLink to="/settings#size">Upgrade</RouterLink>
    </b-popover>
  </div>
</template>

<script>
export default {
  name: 'AppIcon',
  props: ['app'],
  data: function () {
    return {
      iconLoaded: false,
    }
  },
  computed: {
    iconSrc() {
      return `/core/protected/apps/${this.app.name}/icon`
    },
    isBusy() {
      return [
        'installation_queued',
        'installing',
        'uninstallation_queued',
        'uninstalling',
        'reinstallation_queued',
        'reinstalling',
      ].includes(this.app.status);
    },
    canBeStarted() {
      const sizes = ['xs', 's', 'm', 'l', 'xl'];
      if (this.$store.state.profile && this.app.meta) {
        const currentSize = sizes.indexOf(this.$store.state.profile.vm_size);
        const requiredSize = sizes.indexOf(this.app.meta.minimum_vm_size);
        return currentSize >= requiredSize;
      } else {
        return true;
      }
    },
    minimumVmSize() {
      if (this.app.meta) {
        return this.app.meta.minimum_vm_size;
      } else {
        return 'unknown';
      }
    },
  },
  methods: {
    open() {
      if (this.isBusy) {
        return;
      }
      if (!this.canBeStarted) {
        this.$refs.popover.$emit('open');
        setTimeout(() => {
          this.$refs.popover.$emit('close');
        }, 4000);
        return;
      }
      window.open(`https://${this.app.name}.${window.location.host}`, '_blank');
    }
  }
}
</script>

<style scoped>
.app-icon {
  height: 4em;
  width: 4em;
}

#main {
  text-align: center;
  padding-top: 2em;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

#main:not(.active) {
  cursor: progress;
}

#main.blocked {
  cursor: not-allowed;
  opacity: 0.5;
}

p {
  margin-top: 0.2em;
}

.status > * {
  height: 0.5em;
  width: 0.5em;
}

.grid {
  display: grid;
  row-gap: 0.2em;
}

.grid div {
  display: flex;
  flex-direction: row;
  justify-content: center;
}

</style>
