import { genres, listOrder, movies } from "../lib/catalogData"
import type { CatalogMovie, CatalogPage, CatalogQuery, Genre } from "../lib/catalogTypes"

// TMDB's page size, kept so paging behaves the same once the backend is wired in.
export const CATALOG_PAGE_SIZE = 20

// MOCK. Runs the query against the snapshot in lib/catalogData.ts. The real version is one call,
// with the same CatalogPage coming back:
//
//   const { data } = await api.get<CatalogPage>("/movies/discover", {
//     params: { list, sort, genres: genreIds.join(","), decade, page },
//   })
//
// Async on purpose: callers already handle loading and failure, so the swap changes nothing else.
async function queryMock({ list, sort, genreIds, decade, page }: CatalogQuery): Promise<CatalogPage> {
  const byId = new Map(movies.map((m) => [m.tmdbId, m]))
  let results = listOrder[list].map((id) => byId.get(id)).filter((m): m is CatalogMovie => m !== undefined)

  if (genreIds.length > 0) {
    results = results.filter((m) => genreIds.every((g) => m.genreIds.includes(g)))
  }
  if (decade !== null) {
    results = results.filter((m) => {
      const year = m.releaseDate ? Number(m.releaseDate.slice(0, 4)) : null
      if (year === null) return false
      return decade === 0 ? year < 1990 : year >= decade && year < decade + 10
    })
  }

  // ISO dates compare correctly as strings; undated films go last either way.
  const dateKey = (m: CatalogMovie) => m.releaseDate ?? ""
  if (sort === "release_desc") results = [...results].sort((a, b) => dateKey(b).localeCompare(dateKey(a)))
  if (sort === "release_asc") results = [...results].sort((a, b) => (dateKey(a) || "9999").localeCompare(dateKey(b) || "9999"))
  if (sort === "title_asc") results = [...results].sort((a, b) => a.title.localeCompare(b.title))

  const start = (page - 1) * CATALOG_PAGE_SIZE
  return {
    page,
    totalPages: Math.max(1, Math.ceil(results.length / CATALOG_PAGE_SIZE)),
    totalResults: results.length,
    results: results.slice(start, start + CATALOG_PAGE_SIZE),
  }
}

// One promise per distinct query and page. "Load more" refetches pages 1..n so a deep link like
// ?page=3 works on its own; the cache makes the pages already shown free. A failed request is
// dropped from the cache so Retry really retries.
const pageCache = new Map<string, Promise<CatalogPage>>()

function fetchCatalogPage(query: CatalogQuery): Promise<CatalogPage> {
  const key = JSON.stringify(query)
  let request = pageCache.get(key)
  if (!request) {
    request = queryMock(query)
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

// MOCK. Will be GET /api/movies/genres (TMDB's /genre/movie/list, cached on the server).
export async function fetchGenres(): Promise<Genre[]> {
  return genres
}
