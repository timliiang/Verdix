export function initials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

// "Apr 30, 2008" in the reader's locale. TMDB dates are calendar days with no time zone, so they are
// read and printed as UTC; parsing "2008-04-30" as local time would show Apr 29 west of Greenwich.
const releaseDateFormat = new Intl.DateTimeFormat(undefined, { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" })

export function releaseYear(isoDate: string | null): number | null {
  const y = isoDate ? Number(isoDate.slice(0, 4)) : NaN
  return Number.isFinite(y) && y > 0 ? y : null
}

// 139 -> "2 hr, 19 min" in the reader's locale. Intl.DurationFormat is recent (2025), so older
// browsers get a plain "2h 19m".
type DurationFormatter = { format: (d: { hours?: number; minutes?: number }) => string }
const durationFormat: DurationFormatter | null = (() => {
  const DF = (Intl as unknown as { DurationFormat?: new (l?: string, o?: object) => DurationFormatter }).DurationFormat
  try {
    return DF ? new DF(undefined, { style: "short" }) : null
  } catch {
    return null
  }
})()

export function formatRuntime(minutes: number | null): string | null {
  if (!minutes) return null
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (durationFormat) return durationFormat.format(hours ? { hours, minutes: mins } : { minutes: mins })
  return hours ? `${hours}h ${mins}m` : `${mins}m`
}

const longDateFormat = new Intl.DateTimeFormat(undefined, { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" })

// "October 15, 1999". Same UTC reading as formatReleaseDate below.
export function formatLongDate(isoDate: string | null): string | null {
  if (!isoDate) return null
  const [y, m, d] = isoDate.slice(0, 10).split("-").map(Number)
  if (!y || !m || !d) return null
  return longDateFormat.format(new Date(Date.UTC(y, m - 1, d)))
}

export function formatReleaseDate(isoDate: string | null): string | null {
  if (!isoDate) return null
  const [y, m, d] = isoDate.split("-").map(Number)
  if (!y || !m || !d) return null
  return releaseDateFormat.format(new Date(Date.UTC(y, m - 1, d)))
}
