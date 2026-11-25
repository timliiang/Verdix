import api from "./axios"
import type { MovieDetail, ReviewPage } from "../lib/movieTypes"

export const REVIEW_PAGE_SIZE = 10

// GET /api/movies/{tmdbId}/details: public and read-only. Opening a film never stores it in the
// Verdix database; only a review does. One promise per film and region, so going back to a film
// (or React StrictMode's double effect) costs no second request; a failure is dropped so Retry works.
const detailCache = new Map<string, Promise<MovieDetail>>()

export function fetchMovieDetail(tmdbId: number, region: string): Promise<MovieDetail> {
  const key = `${tmdbId}|${region}`
  let request = detailCache.get(key)
  if (!request) {
    request = api.get<MovieDetail>(`/api/movies/${tmdbId}/details`, { params: { region } }).then((r) => r.data)
    request.catch(() => detailCache.delete(key))
    detailCache.set(key, request)
  }
  return request
}

// GET /api/movies/{tmdbId}/reviews: newest first. Not cached here: reviews are the live part.
export async function fetchMovieReviews(tmdbId: number, page: number): Promise<ReviewPage> {
  const { data } = await api.get<ReviewPage>(`/api/movies/${tmdbId}/reviews`, {
    params: { page, size: REVIEW_PAGE_SIZE },
  })
  return data
}
