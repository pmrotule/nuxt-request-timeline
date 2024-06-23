import { defineNuxtPlugin } from '#imports'
import type { RequestTimeline } from './RequestTimeline.js'
import { createServerRequestTimeline, getServerRequestTimeline, generateUrl } from './utils.js'
import { REQUEST_TIMELINE_KEY } from '../constants.js'

const LOG_STYLES = 'background-color: darkblue; border: 3px solid darkblue; color: white;'

declare module '#app' {
  interface NuxtApp {
    $requestTimeline: RequestTimeline
  }
}

export default defineNuxtPlugin(nuxtApp => {
  const { ssrContext } = nuxtApp
  const req = ssrContext?.event.node.req

  const requestTimeline = createServerRequestTimeline(req)

  if (import.meta.server) {
    requestTimeline?.start('ssr')
  } else {
    if (process.env.NODE_ENV !== 'production' && nuxtApp.payload.data[REQUEST_TIMELINE_KEY]) {
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
  nuxtApp.hook('app:rendered', renderContext => {
    const { ssrContext } = renderContext
    const req = ssrContext?.event.node.req
    const requestTimeline = getServerRequestTimeline(req)

    requestTimeline?.end('ssr')

    nuxtApp.payload.data[REQUEST_TIMELINE_KEY] = requestTimeline?.requestChunks || {}
  })
})
