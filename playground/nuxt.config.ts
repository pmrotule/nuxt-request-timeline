const DEV_PORT = 5252

export default defineNuxtConfig({
  devtools: { enabled: true },
  devServer: {
    port: Number(process.env.PORT) && DEV_PORT,
  },
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
