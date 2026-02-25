let intervalId: number | null = null

const FOURTEEN_MINUTES_MS = 14 * 60 * 1000

export function startAuthRefreshScheduler(refreshFn: () => void) {
  if (intervalId != null) return

  // Refresh on a fixed cadence. The backend's access token lifespan is 900s,
  // and the product requirement calls for a refresh every 14 minutes.
  intervalId = window.setInterval(() => {
    refreshFn()
  }, FOURTEEN_MINUTES_MS)
}

export function stopAuthRefreshScheduler() {
  if (intervalId == null) return
  window.clearInterval(intervalId)
  intervalId = null
}
