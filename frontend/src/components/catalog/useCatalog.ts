import { useEffect, useState } from "react"
import { fetchCatalog, fetchGenres, type CatalogResult } from "../../api/catalogApi"
import type { CatalogList, CatalogQuery, CatalogSort, Genre } from "../../lib/catalogTypes"

type Loaded = { key: string; base: string } & ({ ok: true; result: CatalogResult } | { ok: false })

export type CatalogState =
  | { status: "loading" }
  // A bigger page of the same query is on its way; the films already shown stay on screen.
  | { status: "loading-more"; result: CatalogResult }
  | { status: "ready"; result: CatalogResult }
  | { status: "error" }

// The status is derived, not stored: the effect only records what came back and which request it
// answered (key). If that key is not the current one, a request is in flight. Setting a "loading"
// flag inside the effect would cost an extra render, and react-hooks/set-state-in-effect flags it.
export function useCatalog(query: CatalogQuery) {
  const [loaded, setLoaded] = useState<Loaded | null>(null)
  const [attempt, setAttempt] = useState(0)

  const { list, sort, decade, page } = query
  const genreKey = query.genreIds.join(",")
  // base: everything but the page. Same base + new key means "Load more"; new base means a new list.
  const base = `${list}|${sort}|${genreKey}|${decade}`
  const key = `${base}|${page}|${attempt}`

  useEffect(() => {
    let cancelled = false
    const request: CatalogQuery = {
      list: list as CatalogList,
      sort: sort as CatalogSort,
      genreIds: genreKey ? genreKey.split(",").map(Number) : [],
      decade,
      page,
    }
    fetchCatalog(request).then(
      (result) => !cancelled && setLoaded({ key, base, ok: true, result }),
      () => !cancelled && setLoaded({ key, base, ok: false }),
    )
    // A stale response (the user changed filters mid-request) is ignored rather than shown.
    return () => {
      cancelled = true
    }
  }, [key, base, list, sort, genreKey, decade, page])

  let state: CatalogState
  if (loaded?.key === key) state = loaded.ok ? { status: "ready", result: loaded.result } : { status: "error" }
  else if (loaded?.ok && loaded.base === base) state = { status: "loading-more", result: loaded.result }
  else state = { status: "loading" }

  return { state, retry: () => setAttempt((a) => a + 1) }
}

export function useGenres() {
  const [genres, setGenres] = useState<Genre[]>([])
  useEffect(() => {
    let cancelled = false
    // A failure leaves the genre list empty; the filter panel says so instead of breaking the page.
    fetchGenres().then((g) => !cancelled && setGenres(g), () => {})
    return () => {
      cancelled = true
    }
  }, [])
  return genres
}
