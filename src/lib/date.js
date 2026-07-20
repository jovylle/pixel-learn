// Small date helpers kept pure/standalone so streak + activity logic
// (GAMIFICATION.md) stays unit-testable without mounting components.

/** Local (device) date as "YYYY-MM-DD", the format Streak.lastActiveDate uses. */
export function todayLocalDateString(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** Whole-day difference between two "YYYY-MM-DD" strings (b - a), DST-safe. */
export function daysBetween(dateStrA, dateStrB) {
  const [ay, am, ad] = dateStrA.split('-').map(Number)
  const [by, bm, bd] = dateStrB.split('-').map(Number)
  const a = Date.UTC(ay, am - 1, ad)
  const b = Date.UTC(by, bm - 1, bd)
  return Math.round((b - a) / 86400000)
}

/** Relative time label for the Recent Activity feed ("2h ago", "just now"). */
export function formatRelativeTime(iso, now = new Date()) {
  const then = new Date(iso).getTime()
  const diffMs = now.getTime() - then
  const diffSec = Math.max(0, Math.floor(diffMs / 1000))

  if (diffSec < 45) return 'just now'
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  const diffDay = Math.floor(diffHr / 24)
  if (diffDay < 7) return `${diffDay}d ago`
  const diffWeek = Math.floor(diffDay / 7)
  if (diffWeek < 5) return `${diffWeek}w ago`
  const diffMonth = Math.floor(diffDay / 30)
  return `${diffMonth}mo ago`
}
