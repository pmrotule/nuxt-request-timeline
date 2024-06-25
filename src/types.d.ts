export type RequestTimeline = InstanceType<
  (typeof import('./runtime/RequestTimeline'))['RequestTimeline']
>

export interface ModuleOptions {
  isEnabled?: boolean
}
