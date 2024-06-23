import type { IncomingMessage } from 'node:http'
import {
  REQUEST_TIMELINE_KEY,
  REQUEST_TIMELINE_ROUTE_PATH,
  REQUEST_TIMELINE_ROUTE_QUERY,
} from '../constants'
import { RequestTimeline } from './RequestTimeline'

export function getServerRequestTimeline(req?: IncomingMessage) {
  if (req && REQUEST_TIMELINE_KEY in req && req[REQUEST_TIMELINE_KEY] instanceof RequestTimeline) {
    return req[REQUEST_TIMELINE_KEY]
  }
}

export function createServerRequestTimeline(req?: IncomingMessage) {
  const currentTimeline = getServerRequestTimeline(req)
  if (currentTimeline) return currentTimeline
  if (!req) return undefined

  const mutableReq = req as typeof req & { requestTimeline: RequestTimeline }
  mutableReq[REQUEST_TIMELINE_KEY] = new RequestTimeline()

  return mutableReq[REQUEST_TIMELINE_KEY]
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
