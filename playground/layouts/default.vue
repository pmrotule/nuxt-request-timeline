<template>
  <div>
    <pre style="background-color: blueviolet">{{ summers }}</pre>
    <slot />
  </div>
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
const summerResult = useUrqlQuery({
  query: characterQuery,
  variables: { name: 'summer' },
})

useAsyncData(summerResult.hasFetched)

const summers = computed(() =>
  summerResult.data.value?.characters?.results?.slice(0, 3).map((r: { name: string }) => r.name)
)
</script>
