// TMDB serves images from its own CDN, so posters load straight from there and never go through
// the Verdix backend. Posters are 2:3 (w500 is 500x750); the catalog cell uses the same ratio, so a
// standard poster fills it without cropping.
const IMAGE_BASE = "https://image.tmdb.org/t/p"

export const POSTER_WIDTHS = [185, 342, 500] as const
export type PosterWidth = (typeof POSTER_WIDTHS)[number]

export function posterUrl(path: string, width: PosterWidth | 780 = 342): string {
  return `${IMAGE_BASE}/w${width}${path}`
}

// Lets the browser pick the smallest file that is sharp at the cell's rendered width and DPR.
export function posterSrcSet(path: string): string {
  return POSTER_WIDTHS.map((w) => `${posterUrl(path, w)} ${w}w`).join(", ")
}

// Backdrops are 16:9. TMDB's sizes: w300, w780, w1280, original (often 4K, too heavy for a page).
export const BACKDROP_WIDTHS = [300, 780, 1280] as const
export type BackdropWidth = (typeof BACKDROP_WIDTHS)[number]

export function backdropUrl(path: string, width: BackdropWidth = 1280): string {
  return `${IMAGE_BASE}/w${width}${path}`
}

export function backdropSrcSet(path: string): string {
  return BACKDROP_WIDTHS.map((w) => `${backdropUrl(path, w)} ${w}w`).join(", ")
}

// Headshots are 2:3. w185 covers a ~120px card at 1.5x DPR; h632 is the large size.
export function profileUrl(path: string): string {
  return `${IMAGE_BASE}/w185${path}`
}

// Provider logos are square. w92 is sharp at 44px on 2x screens.
export function logoUrl(path: string): string {
  return `${IMAGE_BASE}/w92${path}`
}

// Artwork shown full size in the lightbox: big enough to inspect, far lighter than "original".
export function artworkUrl(path: string, kind: "poster" | "backdrop"): string {
  return kind === "poster" ? posterUrl(path, 780) : backdropUrl(path, 1280)
}

// YouTube: hqdefault (480x360) always exists; maxresdefault is missing for some older uploads.
// The "nocookie" host sets no tracking cookies until the viewer presses play.
export function youtubeThumbnail(key: string): string {
  return `https://i.ytimg.com/vi/${key}/hqdefault.jpg`
}

export function youtubeEmbed(key: string): string {
  return `https://www.youtube-nocookie.com/embed/${key}?autoplay=1&rel=0&modestbranding=1`
}
