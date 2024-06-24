import { useNuxtApp } from '#imports'
import { getRequestTimeline, getQueryTimelineName } from './utils.js'

export function useRequestTimeline() {
  return getRequestTimeline(useNuxtApp())
}

export function useRequestTimelineUtils() {
  return { getQueryTimelineName }
}
