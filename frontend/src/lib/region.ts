// The viewer's country, for age ratings and where-to-watch. Taken from the browser's language
// settings, not their IP: no lookup service, no location permission, and a traveller still sees
// their home services. "en-CA" gives CA directly; a bare "fr" is completed by Intl.Locale's
// maximize() to its likeliest country (fr-Latn-FR). Falls back to the US, as the backend does.
export function viewerRegion(): string {
  const tags = typeof navigator === "undefined" ? [] : (navigator.languages ?? [navigator.language])
  for (const tag of tags) {
    try {
      const region = new Intl.Locale(tag).maximize().region
      if (region && /^[A-Z]{2}$/.test(region)) return region
    } catch {
      // A malformed tag: try the next one.
    }
  }
  return "US"
}

const regionNames = (() => {
  try {
    return new Intl.DisplayNames(undefined, { type: "region" })
  } catch {
    return null
  }
})()

// "CA" -> "Canada" in the reader's language.
export function regionName(code: string): string {
  return regionNames?.of(code) ?? code
}

const languageNames = (() => {
  try {
    return new Intl.DisplayNames(undefined, { type: "language" })
  } catch {
    return null
  }
})()

// "ko" -> "Korean" in the reader's language.
export function languageName(code: string): string {
  try {
    return languageNames?.of(code) ?? code
  } catch {
    return code
  }
}
