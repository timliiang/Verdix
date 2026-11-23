import { useCallback, useMemo } from "react"
import { useSearchParams } from "react-router-dom"
import {
  catalogDecades,
  catalogLists,
  catalogSorts,
  type CatalogList,
  type CatalogQuery,
  type CatalogSort,
} from "../../lib/catalogTypes"

// The catalog's state lives in the URL (?list=top_rated&genres=18,53&decade=2010s&sort=title_asc&page=2),
// not in useState, so a filtered view can be bookmarked or shared, survives a reload, and Back undoes it.
// Defaults are left out of the URL, so plain /movies means "Popular, no filters".

const lists = new Set<string>(catalogLists.map((l) => l.value))
const sorts = new Set<string>(catalogSorts.map((s) => s.value))

// Decades read better in a URL as "2010s" or "earlier" than as the 2010 / 0 the query uses.
const decadeToParam = (d: number) => (d === 0 ? "earlier" : `${d}s`)
const paramToDecade = new Map(catalogDecades.map((d) => [decadeToParam(d.value), d.value]))

// Anything unrecognised falls back to the default instead of breaking the page: URLs get hand-edited.
function parse(params: URLSearchParams): CatalogQuery {
  const list = params.get("list") ?? ""
  const sort = params.get("sort") ?? ""
  const page = Number.parseInt(params.get("page") ?? "1", 10)
  const genreIds = (params.get("genres") ?? "")
    .split(",")
    .map((g) => Number.parseInt(g, 10))
    .filter((g) => Number.isInteger(g) && g > 0)
  return {
    list: lists.has(list) ? (list as CatalogList) : "popular",
    sort: sorts.has(sort) ? (sort as CatalogSort) : "list",
    genreIds: [...new Set(genreIds)].sort((a, b) => a - b),
    decade: paramToDecade.get(params.get("decade") ?? "") ?? null,
    // Capped like TMDB (page 500 max) so a hand-typed ?page=99999 cannot fan out into 99999 requests.
    page: Number.isInteger(page) ? Math.min(Math.max(page, 1), 500) : 1,
  }
}

export function catalogSearch(query: Partial<CatalogQuery>): string {
  const params = new URLSearchParams()
  if (query.list && query.list !== "popular") params.set("list", query.list)
  if (query.genreIds?.length) params.set("genres", query.genreIds.join(","))
  if (query.decade !== undefined && query.decade !== null) params.set("decade", decadeToParam(query.decade))
  if (query.sort && query.sort !== "list") params.set("sort", query.sort)
  if (query.page && query.page > 1) params.set("page", String(query.page))
  const search = params.toString()
  return search ? `?${search}` : ""
}

export function useCatalogParams() {
  const [params, setParams] = useSearchParams()
  const query = useMemo(() => parse(params), [params])

  // Filter and sort changes replace the history entry (ticking five genres should not take five Back
  // presses to undo) and go back to page 1, since the old page may not exist in the new result set.
  // List tabs are real links instead (see CatalogToolbar), so each list is its own history entry.
  const update = useCallback(
    (patch: Partial<Omit<CatalogQuery, "page">>) => {
      setParams(catalogSearch({ ...query, ...patch, page: 1 }), { replace: true, preventScrollReset: true })
    },
    [query, setParams],
  )

  // Load more pushes, so Back returns to the shorter list.
  const loadMore = useCallback(() => {
    setParams(catalogSearch({ ...query, page: query.page + 1 }), { preventScrollReset: true })
  }, [query, setParams])

  const toggleGenre = useCallback(
    (id: number) => {
      const has = query.genreIds.includes(id)
      update({ genreIds: has ? query.genreIds.filter((g) => g !== id) : [...query.genreIds, id].sort((a, b) => a - b) })
    },
    [query.genreIds, update],
  )

  const clearFilters = useCallback(() => update({ genreIds: [], decade: null }), [update])

  const activeFilterCount = query.genreIds.length + (query.decade === null ? 0 : 1)

  return { query, update, loadMore, toggleGenre, clearFilters, activeFilterCount }
}
