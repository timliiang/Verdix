import api from "./axios"
import type { MovieDetail, ReviewPage } from "../lib/movieTypes"

export const REVIEW_PAGE_SIZE = 10

// Plain request functions. Caching, retries and loading state live in TanStack Query
// (components/movie/useMovieDetail.ts), so a review write can invalidate them in one place.

// GET /api/movies/{tmdbId}/details: public and read-only. Opening a film never stores it in the
// Verdix database; only a review does. The signal lets Query cancel a request nobody needs any
// more (the user left the page mid-load).
export async function fetchMovieDetail(tmdbId: number, region: string, signal?: AbortSignal): Promise<MovieDetail> {
  const { data } = await api.get<MovieDetail>(`/api/movies/${tmdbId}/details`, { params: { region }, signal })
  return data
}

// GET /api/movies/{tmdbId}/reviews: newest first, Spring's zero-based pages.
export async function fetchMovieReviews(tmdbId: number, page: number, signal?: AbortSignal): Promise<ReviewPage> {
  const { data } = await api.get<ReviewPage>(`/api/movies/${tmdbId}/reviews`, {
    params: { page, size: REVIEW_PAGE_SIZE },
    signal,
  })
  return data
}
