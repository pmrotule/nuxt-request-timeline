import { defineNuxtPlugin, useRouter } from '#imports'
import { options } from '#requestTimeline'
import { RequestTimeline } from './RequestTimeline.js'
import { generateUrl } from './utils.js'
import { REQUEST_TIMELINE_KEY } from '../constants.js'

const LOG_STYLES = 'background-color: darkblue; border: 3px solid darkblue; color: white;'

declare module '#app' {
  interface NuxtApp {
    $requestTimeline: RequestTimeline
  }
}

declare global {
  interface Window {
    __NUXT_REQUEST_TIMELINE: RequestTimeline
  }
}

export default defineNuxtPlugin(nuxtApp => {
  const requestTimeline = new RequestTimeline()
  nuxtApp.provide(REQUEST_TIMELINE_KEY, requestTimeline)

  // Stop here if the module is not enabled
  if (!options.isEnabled) {
    requestTimeline.isEnabled = false
    return
  }

  if (import.meta.server) {
    requestTimeline?.start('ssr')
  } else {
    window.__NUXT_REQUEST_TIMELINE = requestTimeline

    if (nuxtApp.payload.data[REQUEST_TIMELINE_KEY]) {
      const timelineUrl = generateUrl(nuxtApp.payload.data[REQUEST_TIMELINE_KEY])
      console.log(`%cRequest timeline available at:\n${timelineUrl}`, LOG_STYLES)
    }
    const router = useRouter()

    // Reset the timeline on router.beforeEach for the following navigations within the SPA.
    const unregisterAfterEach = router.afterEach(() => {
      router.beforeEach((_to, _from, next) => {
        requestTimeline.reset()
        next()
      })
      unregisterAfterEach?.()
    })
  }

  /**
   * 'app:rendered' is only called on the server
   * @see https://nuxt.com/docs/api/advanced/hooks#app-hooks-runtime
   */
  nuxtApp.hook('app:rendered', () => {
    requestTimeline?.end('ssr')
    nuxtApp.payload.data[REQUEST_TIMELINE_KEY] = requestTimeline?.requestChunks || {}
  })
})
