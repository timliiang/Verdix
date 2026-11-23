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

export function formatReleaseDate(isoDate: string | null): string | null {
  if (!isoDate) return null
  const [y, m, d] = isoDate.split("-").map(Number)
  if (!y || !m || !d) return null
  return releaseDateFormat.format(new Date(Date.UTC(y, m - 1, d)))
}
