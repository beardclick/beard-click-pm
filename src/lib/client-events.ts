export const APP_COUNTS_CHANGED_EVENT = 'app-counts-changed'

export function notifyAppCountsChanged() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event(APP_COUNTS_CHANGED_EVENT))
}
