import { REQUEST_TIMELINE_ROUTE_PATH, REQUEST_TIMELINE_ROUTE_QUERY } from '../constants'
import type { RequestTimeline } from '../types'

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
