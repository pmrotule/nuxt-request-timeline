<template>
  <div ref="timelineRef" :class="$style.timeline" />
</template>

<script setup lang="ts">
import { ref, useRoute, useHead, onMounted, definePageMeta } from '#imports'
import type { RequestTimeline } from '#requestTimeline'

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    google: Record<string, any> | undefined
  }
}

const GOOGLE_CHART_SCRIPT_URL = 'https://www.gstatic.com/charts/loader.js'

definePageMeta({
  layout: false,
})

useHead({
  title: 'Nuxt Request Timeline',
  meta: [
    {
      name: 'description',
      content:
        'Visualize your request timeline in a waterfall chart by passing data as url parameters.',
    },
  ],
  htmlAttrs: {
    style: 'background-color: white',
  },
})

let google: typeof window.google

const route = useRoute()
const timelineRef = ref<Element | null>(null)

onMounted(initChart)

async function initChart() {
  await loadScript(GOOGLE_CHART_SCRIPT_URL)

  google = window.google

  if (typeof google !== 'undefined') {
    google.charts.load('current', { packages: ['timeline'] })
    google.charts.setOnLoadCallback(drawChart)
  }
}

function loadScript(url: string) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = url
    script.async = true

    script.addEventListener('load', resolve)
    script.addEventListener('error', reject)

    document.body.appendChild(script)
  })
}

function drawChart() {
  if (!timelineRef.value || typeof google === 'undefined') return

  const chart = new google.visualization.Timeline(timelineRef.value)
  const dataTable = new google.visualization.DataTable()

  dataTable.addColumn({ type: 'string', id: 'Description' })
  dataTable.addColumn({ type: 'string', id: 'Duration' })
  dataTable.addColumn({ type: 'number', id: 'Start' })
  dataTable.addColumn({ type: 'number', id: 'End' })

  let timeline: RequestTimeline['requestChunks']
  try {
    timeline = JSON.parse(route.query.tl as string)
  } catch (e) {
    dataTable.addRow(['ERROR', 'Invalid timeline query parameters', 0, 1000])
    return
  }
  const rows: [string, string, number, number][] = []
  let veryEnd = 0

  Object.entries(timeline).forEach(([queryName, records]) => {
    records.forEach(([start, end]) => {
      const duration = Math.max(end, start) - start
      const durationText = end >= start ? `${duration}ms` : 'invalid'
      rows.push([queryName, durationText, start, end])
      if (end > veryEnd) veryEnd = end
    })
  })
  if (!rows.length) return

  rows.forEach(row => {
    // if start > end, reset the end to the very end of the request
    if (row[2] > row[3]) {
      row[3] = veryEnd
      row[1] = `> ${row[3] - row[2]}ms`
    }
  })
  /**
   * If we don't have at least one row covering from the very beginning until the very end of the
   * total recorded time, it can be misleading when there is a big gap between the moment the
   * RequestTimeline instance is created and the first request being recorded. If the first
   * request recorded starts 1.2s after the instance is created, it would still be displayed at
   * the beginning of the column in the waterfall chart unless we add a column covering the whole
   * time.
   */
  if (!rows.some(([,, start, end]) => start === 0 && end === veryEnd)) {
    rows.unshift(['recorded time', `${veryEnd}ms`, 0, veryEnd])
  }

  rows.sort((a, b) => a[2] - b[2])
  dataTable.addRows(rows)

  chart.draw(dataTable, { timeline: { groupByRowLabel: false } })
}
</script>

<style module lang="scss">
.timeline {
  background-color: white;
  height: calc(100vh);
}
</style>
