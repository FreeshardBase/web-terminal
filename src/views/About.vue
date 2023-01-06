<template>
  <div>
    <navbar></navbar>
    <b-container class="mt-4">
      <b-row>

        <b-col>
          <h1>About</h1>
          <p>About page</p>
        </b-col>

      </b-row>
    </b-container>
  </div>
</template>

<script>
import Navbar from "@/components/Navbar";
export default {
  name: "About",
  components: {Navbar}
}
</script>

<style scoped>

</style>
