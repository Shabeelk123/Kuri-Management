// Pure date helpers — no external dependencies.
// Dates in/out are 'YYYY-MM-DD' strings (or Date where noted).

function parseDateStr(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number)
  return { year, month, day }
}

function lastDayOfMonth(year, month) {
  // month is 1-indexed here
  return new Date(year, month, 0).getDate()
}

/** start date + n months, clamped to the last valid day of that month. */
export function addMonths(dateStr, n) {
  const { year, month, day } = parseDateStr(dateStr)
  const totalMonths = month - 1 + n
  const targetYear = year + Math.floor(totalMonths / 12)
  const targetMonth = ((totalMonths % 12) + 12) % 12 // 0-indexed
  const clampedDay = Math.min(day, lastDayOfMonth(targetYear, targetMonth + 1))
  const mm = String(targetMonth + 1).padStart(2, '0')
  const dd = String(clampedDay).padStart(2, '0')
  return `${targetYear}-${mm}-${dd}`
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

/** e.g. "October 2026" for the given month index relative to startDate. */
export function monthLabel(startDate, index) {
  const target = addMonths(startDate, index)
  const { year, month } = parseDateStr(target)
  return `${MONTH_NAMES[month - 1]} ${year}`
}

/** due date for a given month index, using kuri.due_day (clamped). */
export function dueDateForMonth(kuri, index) {
  const target = addMonths(kuri.start_date, index)
  const { year, month } = parseDateStr(target)
  const clampedDay = Math.min(kuri.due_day, lastDayOfMonth(year, month))
  const mm = String(month).padStart(2, '0')
  const dd = String(clampedDay).padStart(2, '0')
  return `${year}-${mm}-${dd}`
}

/** today's position within the Kuri's timeline (0-indexed, clamped to num_months - 1). */
export function currentMonthIndex(kuri) {
  const today = new Date()
  const { year, month } = parseDateStr(kuri.start_date)
  const monthsElapsed =
    (today.getFullYear() - year) * 12 + (today.getMonth() + 1 - month)
  return Math.min(Math.max(monthsElapsed, 0), kuri.num_months - 1)
}
