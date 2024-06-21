import { defineNuxtPlugin } from '#app'
import { RequestTimeline } from './RequestTimeline.js'
import { generateUrl } from '../utils/timeline.js'
import { REQUEST_TIMELINE_KEY } from '../constants.js'

const LOG_STYLES = 'background-color: lightblue; border: 3px solid lightblue; color: black;'

declare module '#app' {
  interface NuxtApp {
    $requestTimeline: RequestTimeline
  }
}

export default defineNuxtPlugin(nuxtApp => {
  const { ssrContext } = nuxtApp
  const req = ssrContext?.event.node.req

  const requestTimeline =
    req && REQUEST_TIMELINE_KEY in req && req[REQUEST_TIMELINE_KEY] instanceof RequestTimeline
      ? req[REQUEST_TIMELINE_KEY]
      : new RequestTimeline()

  nuxtApp.provide(REQUEST_TIMELINE_KEY, requestTimeline)

  if (import.meta.server) {
    nuxtApp.hook('app:rendered', () => {
      nuxtApp.payload.data[REQUEST_TIMELINE_KEY] = requestTimeline.requestChunks
    })
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
})
