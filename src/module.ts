import {
  defineNuxtModule,
  createResolver,
  addPlugin,
  addTemplate,
  extendPages,
  addImports,
} from '@nuxt/kit'
import {
  REQUEST_TIMELINE_PKG_NAME,
  REQUEST_TIMELINE_KEY,
  REQUEST_TIMELINE_IMPORT_ALIAS,
  REQUEST_TIMELINE_ROUTE_NAME,
  REQUEST_TIMELINE_ROUTE_PATH,
} from './constants.js'
import type { RequestTimeline } from './runtime/RequestTimeline'
import type { ModuleOptions } from './types'

export type { RequestTimeline, ModuleOptions }

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: REQUEST_TIMELINE_PKG_NAME,
    configKey: REQUEST_TIMELINE_KEY,
  },
  // Not providing defaults here as they are not typed properly (not overwriting optional properties)
  defaults: {},

  setup(providedOptions, nuxt) {
    const defaultOptions = {
      isEnabled: process.env.NODE_ENV !== 'production',
    }
    const options = { ...defaultOptions, ...providedOptions }
    const { resolve } = createResolver(import.meta.url)

    addPlugin(resolve('./runtime/plugin'))

    extendPages(pages => {
      pages.push({
        name: REQUEST_TIMELINE_ROUTE_NAME,
        path: REQUEST_TIMELINE_ROUTE_PATH,
        file: resolve('./runtime/RequestTimeline.vue'),
      })
    })

    addTemplate({
      filename: 'requestTimeline.d.ts',
      getContents: () =>
        [
          `import type { ModuleOptions } from '${REQUEST_TIMELINE_PKG_NAME}/types'`,
          '',
          `declare module '${REQUEST_TIMELINE_IMPORT_ALIAS}' {`,
          `  export type * from '${REQUEST_TIMELINE_PKG_NAME}/types'`,
          '  export const options: {',
          `    isEnabled: ModuleOptions['isEnabled']`,
          '  }',
          '}',
        ].join('\n'),
    })

    addTemplate({
      filename: 'requestTimeline.mjs',
      getContents: () =>
        [
          // Make module options available in plugin
          'export const options = {',
          ` isEnabled: ${options.isEnabled},`,
          '}',
        ].join('\n'),
    })

    addImports([{ name: 'useRequestTimeline', from: resolve('runtime/composables') }])

    nuxt.options.alias[REQUEST_TIMELINE_IMPORT_ALIAS] = resolve(
      nuxt.options.buildDir,
      'requestTimeline'
    )
  },
})

export interface ModuleRuntimeConfig {}
export interface ModulePublicRuntimeConfig {}

declare module '@nuxt/schema' {
  interface NuxtConfig {
    requestTimeline?: Partial<ModuleOptions>
  }
  interface NuxtOptions {
    requestTimeline?: ModuleOptions
  }
  interface RuntimeConfig extends ModuleRuntimeConfig {}
  interface PublicRuntimeConfig extends ModulePublicRuntimeConfig {}
}
