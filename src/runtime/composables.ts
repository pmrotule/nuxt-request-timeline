import { useNuxtApp } from '#imports'
import { getRequestTimeline } from './utils.js'

export function useRequestTimeline() {
  return getRequestTimeline(useNuxtApp())
}
