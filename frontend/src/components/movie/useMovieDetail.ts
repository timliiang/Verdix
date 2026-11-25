import { useEffect, useState } from "react"
import axios from "axios"
import { fetchMovieDetail, fetchMovieReviews } from "../../api/movieApi"
import { viewerRegion } from "../../lib/region"
import type { MovieDetail, MovieReview } from "../../lib/movieTypes"

export type MovieDetailState =
  | { status: "loading" }
  | { status: "ready"; movie: MovieDetail }
  // not-found: TMDB has no such id (a typo'd URL). failed: TMDB or the network let us down.
  | { status: "error"; reason: "not-found" | "failed" }

type Loaded = { key: string } & ({ ok: true; movie: MovieDetail } | { ok: false; reason: "not-found" | "failed" })

// Same pattern as useCatalog: the status is derived from which request the stored result answers,
// so a film opened from the similar rail shows its skeleton at once instead of the previous film.
export function useMovieDetail(tmdbId: number) {
  // Read once per mount (lazy initializer): the browser language does not change mid-visit.
  const [region] = useState(viewerRegion)
  const [loaded, setLoaded] = useState<Loaded | null>(null)
  const [attempt, setAttempt] = useState(0)
  const key = `${tmdbId}|${region}|${attempt}`

  useEffect(() => {
    let cancelled = false
    fetchMovieDetail(tmdbId, region).then(
      (movie) => !cancelled && setLoaded({ key, ok: true, movie }),
      (error) => {
        if (cancelled) return
        const notFound = axios.isAxiosError(error) && error.response?.status === 404
        setLoaded({ key, ok: false, reason: notFound ? "not-found" : "failed" })
      },
    )
    return () => {
      cancelled = true
    }
  }, [key, tmdbId, region])

  let state: MovieDetailState
  if (loaded?.key !== key) state = { status: "loading" }
  else if (loaded.ok) state = { status: "ready", movie: loaded.movie }
  else state = { status: "error", reason: loaded.reason }

  return { state, region, retry: () => setAttempt((a) => a + 1) }
}

export type ReviewsState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; reviews: MovieReview[]; total: number; hasMore: boolean; loadingMore: boolean }
  | { status: "error" }

// Reviews are fetched only when the rating says there are some: an unreviewed film (most of them)
// costs no request. Pages are appended for "Show more reviews".
export function useMovieReviews(tmdbId: number, reviewCount: number) {
  const [pages, setPages] = useState<{ key: string; reviews: MovieReview[]; total: number; last: boolean; page: number } | null>(null)
  const [pending, setPending] = useState<{ key: string; page: number } | null>(null)
  const [failedKey, setFailedKey] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)
  const key = `${tmdbId}|${attempt}`
  const enabled = reviewCount > 0

  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    fetchMovieReviews(tmdbId, 0).then(
      (p) => !cancelled && setPages({ key, reviews: p.content, total: p.totalElements, last: p.last, page: 0 }),
      () => !cancelled && setFailedKey(key),
    )
    return () => {
      cancelled = true
    }
  }, [key, tmdbId, enabled])

  const current = pages?.key === key ? pages : null

  const loadMore = () => {
    if (!current || current.last || pending) return
    const next = current.page + 1
    setPending({ key, page: next })
    fetchMovieReviews(tmdbId, next).then(
      (p) => {
        setPages((prev) =>
          prev && prev.key === key
            ? { key, reviews: [...prev.reviews, ...p.content], total: p.totalElements, last: p.last, page: next }
            : prev,
        )
        setPending(null)
      },
      () => setPending(null),
    )
  }

  let state: ReviewsState
  if (!enabled) state = { status: "idle" }
  else if (current)
    state = { status: "ready", reviews: current.reviews, total: current.total, hasMore: !current.last, loadingMore: pending?.key === key }
  else if (failedKey === key) state = { status: "error" }
  else state = { status: "loading" }

  return { state, loadMore, retry: () => setAttempt((a) => a + 1) }
}
