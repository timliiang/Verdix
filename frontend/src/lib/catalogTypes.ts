// Shapes for the movie catalog (/movies). They mirror the planned GET /api/movies/discover response,
// so swapping the mock in api/catalogApi.ts for the real endpoint changes no component.

// TMDB's ready-made lists. On the backend each becomes a preset of /discover/movie parameters.
export type CatalogList = "popular" | "now_playing" | "upcoming" | "top_rated"

// "list" keeps the list's own order (popularity, or rating for Top rated); the rest re-sort it.
export type CatalogSort = "list" | "release_desc" | "release_asc" | "title_asc"

export interface Genre {
  id: number
  name: string
}

export interface CatalogMovie {
  tmdbId: number
  title: string
  // ISO date (YYYY-MM-DD). TMDB leaves it empty for some unreleased films.
  releaseDate: string | null
  // Relative TMDB image path ("/abc.jpg"); build URLs with lib/tmdbImage.ts. Null when TMDB has none.
  posterPath: string | null
  genreIds: number[]
  popularity: number
}

export interface CatalogQuery {
  list: CatalogList
  sort: CatalogSort
  // A film must have every selected genre (TMDB's with_genres=a,b is AND).
  genreIds: number[]
  // First year of a decade (2010 = 2010-2019), or null for any year.
  decade: number | null
  page: number
}

export interface CatalogPage {
  page: number
  totalPages: number
  totalResults: number
  results: CatalogMovie[]
}

export const catalogLists: { value: CatalogList; label: string; heading: string }[] = [
  { value: "popular", label: "Popular", heading: "Popular films" },
  { value: "now_playing", label: "Now playing", heading: "Now playing" },
  { value: "upcoming", label: "Upcoming", heading: "Upcoming films" },
  { value: "top_rated", label: "Top rated", heading: "Top rated films" },
]

// What "list" order means for each list, so the Sort menu names it honestly.
export const listOrderLabel: Record<CatalogList, string> = {
  popular: "Most popular",
  now_playing: "Most popular",
  upcoming: "Most popular",
  top_rated: "Highest rated",
}

export const catalogSorts: { value: Exclude<CatalogSort, "list">; label: string }[] = [
  { value: "release_desc", label: "Newest first" },
  { value: "release_asc", label: "Oldest first" },
  { value: "title_asc", label: "Title, A to Z" },
]

// Oldest bucket is open-ended: the Top rated list reaches back to the 1950s.
export const catalogDecades: { value: number; label: string }[] = [
  { value: 2020, label: "2020s" },
  { value: 2010, label: "2010s" },
  { value: 2000, label: "2000s" },
  { value: 1990, label: "1990s" },
  { value: 0, label: "Before 1990" },
]
