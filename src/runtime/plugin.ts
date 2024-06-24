import { defineNuxtPlugin } from '#imports'
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

export default defineNuxtPlugin(nuxtApp => {
  const requestTimeline = new RequestTimeline()
  nuxtApp.provide(REQUEST_TIMELINE_KEY, requestTimeline)

  if (import.meta.server) {
    requestTimeline?.start('ssr')
  } else {
    if (options.isEnabled && nuxtApp.payload.data[REQUEST_TIMELINE_KEY]) {
      const timelineUrl = generateUrl(nuxtApp.payload.data[REQUEST_TIMELINE_KEY])
      console.log(`%cRequest timeline available at:\n${timelineUrl}`, LOG_STYLES)
    }
    // Reset the timeline on router.beforeEach for the following navigations within the SPA.
    // const unregisterAfterEach = ctx.app.router?.afterEach(() => {
    //   ctx.app.router?.beforeEach((_to, _from, next) => {
    //     requestTimeline.reset()
    //     next()
    //   })
    //   unregisterAfterEach?.()
    // })
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
