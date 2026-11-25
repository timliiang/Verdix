import type { CatalogMovie, Genre } from "./catalogTypes"

// Shapes for the film page (/movies/:tmdbId). They mirror GET /api/movies/{tmdbId}/details and
// /reviews (backend movie/detail: MovieDetail, RatingSummary; review/dto: MovieReviewResponse).

export interface Certification {
  // "PG-13", "15", "R"
  rating: string
  // The board's country. Differs from the viewer's when their country has no rating on TMDB.
  region: string
}

// A YouTube video id plus its label; lib/tmdbImage.ts builds the thumbnail and embed URLs.
export interface Video {
  key: string
  name: string
  type: "Trailer" | "Teaser"
}

export interface ArtworkImage {
  path: string
  width: number
  height: number
}

export interface CastCredit {
  id: number
  name: string
  character: string | null
  profilePath: string | null
}

export type CrewRoleKey = "director" | "writer" | "producer" | "composer" | "cinematographer" | "editor"

export interface CrewCredit {
  id: number
  name: string
  profilePath: string | null
  // Writers only: the specific credit ("Screenplay", "Novel").
  detail: string | null
}

export interface CrewRole {
  role: CrewRoleKey
  people: CrewCredit[]
}

export interface Provider {
  id: number
  name: string
  logoPath: string | null
}

export interface WatchOptions {
  region: string
  // TMDB's watch page for the film; the API has no per-provider deep links.
  link: string
  stream: Provider[]
  free: Provider[]
  rent: Provider[]
  buy: Provider[]
}

export interface RatingSummary {
  reviewCount: number
  // The median of the 1-10 scores; null until the film has a review.
  median: number | null
  // distribution[i] = reviews that scored i + 1. Always 10 entries.
  distribution: number[]
}

export interface MovieDetail {
  tmdbId: number
  title: string
  tagline: string | null
  overview: string | null
  releaseDate: string | null
  runtime: number | null
  certification: Certification | null
  originalLanguage: string | null
  status: string | null
  posterPath: string | null
  backdropPath: string | null
  genres: Genre[]
  videos: Video[]
  artwork: { posters: ArtworkImage[]; backdrops: ArtworkImage[] }
  cast: CastCredit[]
  crew: CrewRole[]
  similar: CatalogMovie[]
  watch: WatchOptions | null
  rating: RatingSummary
}

export interface MovieReview {
  id: number
  username: string
  userImageUrl: string | null
  rating: number
  reviewText: string
  // ISO date
  watchedDate: string | null
  // ISO local date-time
  createdAt: string
}

// Spring Data's Page, trimmed to the fields the page reads.
export interface ReviewPage {
  content: MovieReview[]
  totalElements: number
  last: boolean
  number: number
}
