import api from "./axios"
import type { CatalogPage } from "../lib/catalogTypes"

// Searches shorter than this are not sent: one or two letters match thousands of titles, and
// the results would be noise. The UI asks for more instead.
export const MIN_SEARCH_LENGTH = 2

// The same normalisation as the backend's SearchQuery (trim, collapse spaces, lowercase), so
// "Alien" and "alien " share one TanStack Query cache entry as they share one server cache entry.
export function normalizeSearch(text: string): string {
  return text.trim().replace(/\s+/g, " ").toLowerCase()
}

// The results page for a search; encodeURIComponent keeps "&" or "#" in a title inside q.
export function searchPath(text: string): string {
  const q = text.trim()
  return q ? `/search?q=${encodeURIComponent(q)}` : "/search"
}

// GET /api/movies/search: public, cached on the server, same page shape as the catalog.
export async function searchFilms(text: string, page: number, signal?: AbortSignal): Promise<CatalogPage> {
  const { data } = await api.get<CatalogPage>("/api/movies/search", { params: { query: text, page }, signal })
  return data
}
