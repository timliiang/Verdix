import api from "./axios"
import type { CatalogMovie, CatalogPage, CatalogQuery, Genre } from "../lib/catalogTypes"

// TMDB's page size; the backend passes TMDB's pages through unchanged.
export const CATALOG_PAGE_SIZE = 20

// GET /api/movies/discover: the backend's cached proxy over TMDB's /discover/movie (public, no
// account needed). Defaults and empty filters are left out (axios drops undefined params), so the
// URL stays short and equal queries look equal to the server's cache.
async function requestPage({ list, sort, genreIds, decade, page }: CatalogQuery): Promise<CatalogPage> {
  const { data } = await api.get<CatalogPage>("/api/movies/discover", {
    params: {
      list,
      sort,
      genres: genreIds.length > 0 ? genreIds.join(",") : undefined,
      decade: decade ?? undefined,
      page,
    },
  })
  return data
}

// One promise per distinct query and page. "Load more" refetches pages 1..n so a deep link like
// ?page=3 works on its own; the cache makes the pages already shown free. A failed request is
// dropped from the cache so Retry really retries.
const pageCache = new Map<string, Promise<CatalogPage>>()

function fetchCatalogPage(query: CatalogQuery): Promise<CatalogPage> {
  const key = JSON.stringify(query)
  let request = pageCache.get(key)
  if (!request) {
    request = requestPage(query)
    request.catch(() => pageCache.delete(key))
    pageCache.set(key, request)
  }
  return request
}

export interface CatalogResult {
  movies: CatalogMovie[]
  totalResults: number
  hasMore: boolean
}

// Pages 1..query.page, concatenated: what the grid shows after the user has pressed "Load more".
export async function fetchCatalog(query: CatalogQuery): Promise<CatalogResult> {
  const pages = await Promise.all(
    Array.from({ length: query.page }, (_, i) => fetchCatalogPage({ ...query, page: i + 1 })),
  )
  const last = pages[pages.length - 1]
  return {
    movies: pages.flatMap((p) => p.results),
    totalResults: last.totalResults,
    hasMore: last.page < last.totalPages,
  }
}

// TMDB's genre list, cached for a day on the server. Fetched once per page load: the promise is
// kept, and dropped on failure so a later mount can try again.
let genresRequest: Promise<Genre[]> | null = null

export function fetchGenres(): Promise<Genre[]> {
  if (!genresRequest) {
    genresRequest = api.get<Genre[]>("/api/movies/genres").then((r) => r.data)
    genresRequest.catch(() => {
      genresRequest = null
    })
  }
  return genresRequest
}
