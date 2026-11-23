// TMDB serves images from its own CDN, so posters load straight from there and never go through
// the Verdix backend. Posters are 2:3 (w500 is 500x750); the catalog cell uses the same ratio, so a
// standard poster fills it without cropping.
const IMAGE_BASE = "https://image.tmdb.org/t/p"

export const POSTER_WIDTHS = [185, 342, 500] as const
export type PosterWidth = (typeof POSTER_WIDTHS)[number]

export function posterUrl(path: string, width: PosterWidth = 342): string {
  return `${IMAGE_BASE}/w${width}${path}`
}

// Lets the browser pick the smallest file that is sharp at the cell's rendered width and DPR.
export function posterSrcSet(path: string): string {
  return POSTER_WIDTHS.map((w) => `${posterUrl(path, w)} ${w}w`).join(", ")
}
