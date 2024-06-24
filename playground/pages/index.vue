<template>
  <div :class="$style.wrapper">
    <main class="p-4">
      <div class="flex flex-col gap-4">
        <pre>{{ characters }}</pre>
      </div>
    </main>

    <footer class="border-t-1 border-slate flex justify-center items-center">
      nuxt-request-timeline playground
    </footer>
  </div>
</template>

<script setup lang="ts">
const result = useUrqlQuery({
  query: gql`
    query character($name: String!) {
      characters(page: 2, filter: { name: $name }) {
        info {
          count
        }
        results {
          name
        }
      }
    }
  `,
  variables: { name: 'rick' },
})

useAsyncData(result.hasFetched)

const characters = computed(() => result.data.value?.characters)
</script>

<style module lang="scss">
.wrapper {
  display: grid;
  grid-template-rows: 1fr 60px;
  min-height: 100vh;
}
</style>
