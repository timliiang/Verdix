import { useState } from "react"
import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import { fetchMovieDetail, fetchMovieReviews } from "../../api/movieApi"
import { parseApiError } from "../../api/apiError"
import { movieKeys } from "../../lib/queryKeys"
import { viewerRegion } from "../../lib/region"

// The film page's data, through TanStack Query. Query owns what the old hand-rolled hooks did by
// hand: one request per key (StrictMode's double mount included), ignoring responses for a film
// the user already left, retries with backoff, and a cache that review writes can invalidate.

export function useMovieDetail(tmdbId: number) {
  // Read once per mount (lazy initializer): the browser language does not change mid-visit.
  const [region] = useState(viewerRegion)
  const query = useQuery({
    queryKey: movieKeys.details(tmdbId, region),
    queryFn: ({ signal }) => fetchMovieDetail(tmdbId, region, signal),
  })
  // A 404 means the id does not exist on TMDB: show the not-found page, not "try again".
  const error = query.isError ? parseApiError(query.error) : null
  return { query, region, error }
}

// Reviews, page by page ("Show More Reviews"). useInfiniteQuery keeps the loaded pages as one
// list and knows whether another page exists from the last page's "last" flag.
//
// enabled: only when the rating says reviews exist, so an unreviewed film (most of them) costs no
// request. Refetching on window focus is on here, unlike the global default: reviews are the part
// of the page other people change.
export function useMovieReviews(tmdbId: number, reviewCount: number) {
  const query = useInfiniteQuery({
    queryKey: movieKeys.reviews(tmdbId),
    queryFn: ({ pageParam, signal }) => fetchMovieReviews(tmdbId, pageParam, signal),
    initialPageParam: 0,
    getNextPageParam: (last) => (last.last ? undefined : last.number + 1),
    enabled: reviewCount > 0,
    refetchOnWindowFocus: true,
  })
  const reviews = query.data?.pages.flatMap((p) => p.content) ?? []
  const total = query.data?.pages.at(-1)?.totalElements ?? reviewCount
  return { query, reviews, total }
}
