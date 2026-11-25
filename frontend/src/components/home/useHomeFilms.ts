import { useState } from "react"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { requestPage } from "../../api/catalogApi"
import { fetchMovieDetail } from "../../api/movieApi"
import { movieKeys } from "../../lib/queryKeys"
import { viewerRegion } from "../../lib/region"
import type { CatalogMovie } from "../../lib/catalogTypes"

// The backend caches TMDB's lists for 10 minutes (CacheConfig.CATALOG), so polling faster would
// only get the same copy back. Matching it means the page follows TMDB as closely as it can.
const REFRESH_MS = 10 * 60_000

// TMDB's Now Playing list (films in cinemas, most popular first), live. Refetched every 10 minutes
// while the tab is visible and whenever the tab regains focus; the cached list keeps rendering
// during a refetch, so nothing flickers. Hidden tabs do not poll (refetchIntervalInBackground is
// false by default).
export function useNowPlayingFilms() {
  return useQuery({
    queryKey: ["catalog", "now_playing", 1],
    queryFn: ({ signal }) => requestPage({ list: "now_playing", sort: "list", genreIds: [], decade: null, page: 1 }, signal),
    staleTime: REFRESH_MS / 2,
    refetchInterval: REFRESH_MS,
    refetchOnWindowFocus: true,
  })
}

// The hero's pick from the list: the top entry with a poster (the hero is built around the art).
// Shared with the rail, which shows the films after it, so the two never repeat each other.
export function pickFeatured(results: CatalogMovie[] | undefined): CatalogMovie | null {
  return results?.find((m) => m.posterPath) ?? null
}

// The hero's film: whatever is #1 in cinemas right now, so it changes when TMDB's ranking does.
// The list has no backdrop, synopsis or runtime, so its details come from the film page's
// endpoint, under the film page's own query key: clicking through to it renders from cache.
// (Two requests in sequence: the details can only start once the list says which film is #1.)
export function useFeaturedFilm() {
  const [region] = useState(viewerRegion)
  const nowPlaying = useNowPlayingFilms()
  const featured = pickFeatured(nowPlaying.data?.results)
  const tmdbId = featured?.tmdbId

  const details = useQuery({
    queryKey: movieKeys.details(tmdbId ?? 0, region),
    queryFn: ({ signal }) => fetchMovieDetail(tmdbId!, region, signal),
    enabled: tmdbId !== undefined,
    staleTime: REFRESH_MS / 2,
    // When #1 changes, the old film stays up until the new one's details arrive: a straight swap,
    // no skeleton flash in between.
    placeholderData: keepPreviousData,
  })

  return { nowPlaying, featured, details }
}
