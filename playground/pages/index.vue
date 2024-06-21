<script lang="ts" setup></script>

<template>
  <div :class="$style.wrapper">
    <main class="p-4">
      <div class="flex flex-col gap-4">Salut</div>
    </main>

    <footer class="border-t-1 border-slate flex justify-center items-center">
      nuxt-request-timeline playground
    </footer>
  </div>
</template>

<style module lang="scss">
.wrapper {
  display: grid;
  grid-template-rows: 1fr 60px;
  min-height: 100vh;
}
</style>
