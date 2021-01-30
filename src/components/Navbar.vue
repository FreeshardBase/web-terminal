<template>
  <div>
    <b-navbar toggleable="lg" type="dark" variant="dark">

      <b-navbar-brand to="/">
        <img class="h-100" style="max-height: 1.5em" alt="Portal logo" src="../assets/logo.svg">
      </b-navbar-brand>

      <b-nav-toggle target="nav-collapse"></b-nav-toggle>

      <b-collapse id="nav-collapse" is-nav>

        <b-navbar-nav>
          <b-nav-item to="/terminals">Terminals</b-nav-item>
        </b-navbar-nav>

      </b-collapse>
    </b-navbar>
  </div>
</template>

<script>
export default {
name: "Navbar"
}
</script>

<style scoped>

</style>