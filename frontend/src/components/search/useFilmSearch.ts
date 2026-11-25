import { keepPreviousData, useInfiniteQuery, useQuery } from "@tanstack/react-query"
import { MIN_SEARCH_LENGTH, normalizeSearch, searchFilms } from "../../api/searchApi"
import { searchKeys } from "../../lib/queryKeys"
import { useDebouncedValue } from "../../lib/useDebouncedValue"

export const SEARCH_DEBOUNCE_MS = 300

// Shared by both search surfaces: what the user typed, debounced and normalised into the text
// that is actually searched. "pending" is the gap between the two: typing has moved on but the
// debounce has not fired yet, which the UI shows the same way as a request in flight.
function useSearchText(input: string) {
  const text = normalizeSearch(useDebouncedValue(input, SEARCH_DEBOUNCE_MS))
  const enabled = text.length >= MIN_SEARCH_LENGTH
  const pending = normalizeSearch(input) !== text
  return { text, enabled, pending }
}

// The nav dropdown: page 1 only. placeholderData keeps the previous answer on screen while the
// next one loads, so the list does not flash empty on every pause in typing. (Stale answers can't
// show up as the new one: each response is cached under the text it was for.)
export function useSearchPreview(input: string) {
  const { text, enabled, pending } = useSearchText(input)
  const query = useQuery({
    queryKey: searchKeys.preview(text),
    queryFn: ({ signal }) => searchFilms(text, 1, signal),
    enabled,
    placeholderData: keepPreviousData,
    // Titles do not change minute to minute; repeat searches in a visit are served from cache.
    staleTime: 5 * 60_000,
  })
  return { query, text, enabled, pending }
}

// The /search page: every page so far, for "Load more".
export function useSearchResults(input: string) {
  const { text, enabled, pending } = useSearchText(input)
  const query = useInfiniteQuery({
    queryKey: searchKeys.pages(text),
    queryFn: ({ pageParam, signal }) => searchFilms(text, pageParam, signal),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.page < last.totalPages ? last.page + 1 : undefined),
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 5 * 60_000,
  })
  const films = query.data?.pages.flatMap((p) => p.results) ?? []
  const total = query.data?.pages[0]?.totalResults ?? 0
  return { query, text, enabled, pending, films, total }
}
