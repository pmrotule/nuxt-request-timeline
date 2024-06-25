<template>
  <main class="p-4">
    <pre>{{ ricks }}</pre>
    <pre>{{ morties }}</pre>
  </main>
</template>

<script setup lang="ts">
const characterQuery = gql`
  query character($name: String!) {
    characters(page: 1, filter: { name: $name }) {
      info {
        count
      }
      results {
        id
        name
      }
    }
  }
`
const rickResult = useUrqlQuery({
  query: characterQuery,
  variables: { name: 'rick' },
})

const mortyResult = useUrqlQuery({
  query: characterQuery,
  variables: { name: 'morty' },
})

useAsyncData(rickResult.hasFetched)
useAsyncData(mortyResult.hasFetched)

const ricks = computed(() =>
  rickResult.data.value?.characters?.results?.slice(0, 3).map((r: { name: string }) => r.name)
)
const morties = computed(() =>
  mortyResult.data.value?.characters?.results?.slice(0, 3).map((r: { name: string }) => r.name)
)
</script>
