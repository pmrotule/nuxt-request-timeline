<template>
  <main class="p-4">
    <pre>{{ locations }}</pre>
  </main>
</template>

<script setup lang="ts">
const locationQuery = gql`
  query locations($dimension: String!) {
    locations(filter: { dimension: $dimension }) {
      results {
        id
        name
      }
    }
  }
`
const locationResult = useUrqlQuery({
  query: locationQuery,
  variables: { dimension: 'C-137' },
})

useAsyncData(locationResult.hasFetched)

const locations = computed(() =>
  locationResult.data.value?.locations?.results?.slice(0, 3).map((r: { name: string }) => r.name)
)
</script>
