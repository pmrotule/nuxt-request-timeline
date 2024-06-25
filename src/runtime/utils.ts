import type { DocumentNode } from 'graphql'
import type { NuxtApp } from '#app'
import {
  REQUEST_TIMELINE_KEY,
  REQUEST_TIMELINE_ROUTE_PATH,
  REQUEST_TIMELINE_ROUTE_QUERY,
} from './constants'
import type { RequestTimeline } from '../types'

type AnyObject = Record<string, unknown>

const MAX_LENGTH_QUERY_VARS_TIMELINE = 60

export function getRequestTimeline(nuxtApp: NuxtApp) {
  return nuxtApp[`$${REQUEST_TIMELINE_KEY}`]
}

/**
 * Generates the url which consists of the `/timeline` route together with the `requestChunks`
 * object stringified as query parameters. RequestTimeline.vue will then parse (JSON.parse) the
 * query and generate the graph.
 */
export function generateUrl(requestChunks?: RequestTimeline['requestChunks']): string {
  if (typeof window === 'undefined') return ''

  const url = new URL(window.location.origin)
  url.pathname = REQUEST_TIMELINE_ROUTE_PATH
  url.searchParams.append(REQUEST_TIMELINE_ROUTE_QUERY, JSON.stringify(requestChunks))

  return url.toString()
}

/**
 * Generate name to display on the table of the RequestTimeline page.
 */
export function getQueryTimelineName<QueryVariables>(options: {
  query: DocumentNode
  variables: QueryVariables
  excludedVars?: string[]
}): string {
  const { query, variables, excludedVars = [] as string[] } = options

  const queryVars = {} as AnyObject
  for (const varKey in variables) {
    if (!excludedVars.includes(varKey)) queryVars[varKey] = variables[varKey]
  }

  return query.definitions
    ?.map(def => {
      if ('operation' in def && 'name' in def) {
        let name = def.operation === 'query' ? (def.name || {}).value || '' : ''
        if (Object.keys(queryVars).length) name += ` ${stringifyQueryVariables(queryVars)}`
        return name
      }
    })
    .filter(v => v)
    .join(',')
}

function stringifyQueryVariables(variables: AnyObject) {
  const strVars = JSON.stringify(variables)
  return strVars.length > MAX_LENGTH_QUERY_VARS_TIMELINE
    ? `${strVars.substring(0, MAX_LENGTH_QUERY_VARS_TIMELINE)}...}`
    : strVars
}
