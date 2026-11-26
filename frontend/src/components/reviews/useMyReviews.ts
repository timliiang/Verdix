import { useInfiniteQuery } from "@tanstack/react-query"
import { useSearchParams } from "react-router-dom"
import { DEFAULT_MY_REVIEW_SORT, fetchMyReviews, isMyReviewSort, type MyReviewSort } from "../../api/reviewApi"
import { useAuth } from "../../context/AuthContext"
import { myReviewKeys } from "../../lib/queryKeys"

// The sort lives in the URL (?sort=title), like the catalog's: it survives a refresh, the Back
// button walks through sort changes, and a link opens the same view. An unknown value (an old link,
// a typo) falls back to the default instead of erroring.
export function useMyReviewSort() {
  const [params, setParams] = useSearchParams()
  const raw = params.get("sort")
  const sort: MyReviewSort = isMyReviewSort(raw) ? raw : DEFAULT_MY_REVIEW_SORT

  const setSort = (next: MyReviewSort) => {
    setParams(
      (prev) => {
        const p = new URLSearchParams(prev)
        // The default is the bare URL, so /reviews and "Highest rated" are one address.
        if (next === DEFAULT_MY_REVIEW_SORT) p.delete("sort")
        else p.set("sort", next)
        return p
      },
      // Each sort is a history entry, but no scroll jump: the list re-sorts in place.
      { preventScrollReset: true },
    )
  }
  return { sort, setSort }
}

// The member's reviews, page by page ("Show more"). The route is signed-in only (ProtectedRoute),
// so username is always set here; the key still includes it so switching accounts can't show a
// cached list from the previous one.
export function useMyReviews(sort: MyReviewSort) {
  const { username } = useAuth()
  const query = useInfiniteQuery({
    queryKey: myReviewKeys.list(username ?? "", sort),
    queryFn: ({ pageParam, signal }) => fetchMyReviews(sort, pageParam, signal),
    initialPageParam: 0,
    getNextPageParam: (last) => (last.last ? undefined : last.number + 1),
    enabled: username !== null,
    // Keep the previous order's list on screen while the new order loads, instead of flashing the
    // skeleton on every sort change.
    placeholderData: (previous) => previous,
  })
  const reviews = query.data?.pages.flatMap((p) => p.content) ?? []
  const total = query.data?.pages.at(-1)?.totalElements ?? 0
  return { query, reviews, total }
}
