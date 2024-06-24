import type { DocumentNode } from 'graphql'
import { provideClient, useQuery } from '@urql/vue'
import type { AnyVariables } from '@urql/vue'
import { getQueryTimelineName } from '../utils'

export const URQL_CLIENT_NUXT_APP_KEY = 'urql'

export function useUrqlClient() {
  return useNuxtApp()[`$${URQL_CLIENT_NUXT_APP_KEY}`]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useUrqlQuery<T = any, V extends AnyVariables = AnyVariables>(
  options: Omit<Parameters<typeof useQuery<T, V>>[0], 'query'> & { query: DocumentNode }
) {
  const { query, variables } = options

  const timeline = useRequestTimeline()
  const client = useUrqlClient()
  provideClient(client)

  const end = timeline?.start(() => getQueryTimelineName({ query, variables }))

  const result = useQuery(options as Parameters<typeof useQuery<T, V>>[0])
  const hasFetched = result.then(() => end?.())

  return { ...result, hasFetched: async () => await hasFetched }
}
