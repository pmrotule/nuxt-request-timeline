<template>
  <div>
    <ol :class="$style.linkWrap">
      <li v-for="link in links" :key="link.to">
        <NuxtLink :class="$style.link" :to="link.to">{{ link.text }}</NuxtLink>
      </li>
    </ol>
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

const links: { to: string; text: string }[] = [
  {
    to: '/',
    text: 'Characters',
  },
  {
    to: '/locations',
    text: 'Locations',
  },
]

useAsyncData(summerResult.hasFetched)

const summers = computed(() =>
  summerResult.data.value?.characters?.results?.slice(0, 3).map((r: { name: string }) => r.name)
)
</script>

<style module lang="scss">
.linkWrap {
  display: flex;
  gap: 20px;
  margin: 10px;
}

.link {
  display: inline-block;
  background-color: darkSlateBlue;
  padding: 10px 20px;
  border-radius: 4px;
  color: white;
  transition: background-color 0.1s;

  &:hover {
    background-color: rgba(72, 61, 139, 0.6);
  }
}
</style>
