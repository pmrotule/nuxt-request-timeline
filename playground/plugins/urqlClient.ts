import { createClient, ssrExchange, fetchExchange } from '@urql/core'
import type { SSRData, Client } from '@urql/core'
import { cacheExchange } from '@urql/exchange-graphcache'
import { URQL_CLIENT_NUXT_APP_KEY } from '../composables/useUrqlClient.js'

const CACHE_KEY = '__URQL_DATA__'

declare module '#app' {
  interface NuxtApp {
    $urql: Client
  }
}

export default defineNuxtPlugin(nuxtApp => {
  /**
   * @see https://commerce.nearform.com/open-source/urql/docs/advanced/server-side-rendering/
   */
  const ssr = ssrExchange({ isClient: !!import.meta.browser })

  const client = createClient({
    url: 'https://rickandmortyapi.com/graphql',
    exchanges: [
      cacheExchange({}),
      ssr, // Add `ssr` in front of the `fetchExchange`
      fetchExchange,
    ],
  })

  nuxtApp.provide(URQL_CLIENT_NUXT_APP_KEY, client)

  nuxtApp.hook('app:rendered', () => {
    nuxtApp.payload.data[CACHE_KEY] = ssr.extractData()
  })

  if (import.meta.browser) {
    nuxtApp.hook('app:created', () => {
      try {
        ssr.restoreData(nuxtApp.payload.data[CACHE_KEY] as SSRData)
      } catch (e) {
        console.error(e)
      }
    })
  }
})
