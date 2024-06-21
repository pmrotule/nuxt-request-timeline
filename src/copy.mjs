import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const timelineComponentPath = path.resolve(__dirname, './RequestTimeline.vue')

fs.copyFileSync(timelineComponentPath, timelineComponentPath.replace('/src/', '/dist/'))
