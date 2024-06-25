export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['@nuxt/ui', 'nuxt-request-timeline'],
  requestTimeline: {},

  imports: {
    presets: [
      {
        from: '@urql/vue',
        imports: ['gql'],
      },
    ],
  },
})
