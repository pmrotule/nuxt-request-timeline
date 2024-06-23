import { generateUrl } from './utils'

type RequestRecord = [number, number]
type RequestChunks = Record<string, RequestRecord[]>

const RECORD_START = 0
const RECORD_END = 1

export class RequestTimeline {
  isEnabled: boolean
  requestChunks: RequestChunks
  private requestStartTime: number

  constructor() {
    this.isEnabled = true
    this.requestChunks = {}
    this.requestStartTime = this.getTimeNow()
  }

  /**
   * Reset the requestStartTime and the requestChunks (i.e. useful on router.beforeEach)
   */
  reset(): void {
    this.requestChunks = {}
    this.requestStartTime = this.getTimeNow()
  }

  private getTimeNow(): number {
    return new Date().getTime()
  }

  private getRequestTime(): number {
    return this.getTimeNow() - this.requestStartTime
  }

  private createEmptyRecord(): RequestRecord {
    return [0, 0]
  }

  private getComputedId(id: string | (() => string)): string {
    return typeof id === 'string' ? id : id()
  }

  /**
   * Generates the url which consists of the `/timeline` route together with `this.requestChunks`
   * object stringified as query parameter. RequestTimeline.vue will then parse (JSON.parse) the
   * query and generate the timeline graph.
   */
  generateUrl(options: Parameters<typeof generateUrl>[0] = {}): string {
    options.requestChunks = options.requestChunks || this.requestChunks
    return generateUrl(options)
  }

  /**
   * Records when a given request chunk starts. It returns a method to record the end of the same
   * request chunk (especially useful when the same chunk id can be recorded multiple times).
   *
   * @return "end" method for the same request chunk
   */
  start(id: string | (() => string)): () => void {
    // Overrides the "start" method with an empty function if the timeline is disabled
    if (!this.isEnabled) this.start = () => () => {}

    const record = this.createEmptyRecord()
    const computedId = this.getComputedId(id)
    this.requestChunks[computedId] = this.requestChunks[computedId] || []
    this.requestChunks[computedId].push(record)

    record[RECORD_START] = this.getRequestTime()
    return () => (record[RECORD_END] = this.getRequestTime())
  }

  /**
   * Records when a given request chunk ends. Use this method when "start" and "end" is not called
   * within the same file or scope. You have to make sure the id is unique.
   */
  end(id: string | (() => string)): void {
    // Overrides the "end" method with an empty function if the timeline is disabled
    if (!this.isEnabled) this.end = () => {}

    const computedId = this.getComputedId(id)
    this.requestChunks[computedId] = this.requestChunks[computedId] || [this.createEmptyRecord()]

    const lastIndex = this.requestChunks[computedId].length - 1
    this.requestChunks[computedId][lastIndex][RECORD_END] = this.getRequestTime()
  }
}
