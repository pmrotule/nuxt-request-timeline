import { useNuxtApp } from '#imports'

export function useRequestTimeline() {
  return useNuxtApp().$requestTimeline
}
