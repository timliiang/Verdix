import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createReview, deleteReview, updateReview, type ReviewInput } from "../../api/reviewApi"
import { parseApiError, type ApiError, type ApiErrorKind } from "../../api/apiError"
import { movieKeys, myReviewKeys } from "../../lib/queryKeys"

// Review writes, pessimistic: nothing on screen changes until the server has accepted the write.
// The server can genuinely refuse (validation, someone else's review, a review already deleted),
// and the score is computed server-side, so showing a guess first would only have to be undone.
//
// Each hook's onSuccess returns the invalidation promise. TanStack Query waits for a promise
// returned there, so isPending stays true until the film's score and review list have been
// refetched: the button stops spinning at the moment the page shows the new numbers.
//
// Writes are never retried automatically (queryClient.ts). The error is parsed once here, so
// components get copy that fits the action and a kind to branch on.

function useInvalidateFilm(tmdbId: number) {
  const queryClient = useQueryClient()
  // The film's score and reviews, and the member's own list on /reviews (marked stale; it refetches
  // when next shown, so a review edited on a film page is current when they open Your reviews).
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: movieKeys.all(tmdbId) }),
      queryClient.invalidateQueries({ queryKey: myReviewKeys.all }),
    ])
}

function withParsedError<T extends { error: unknown }>(mutation: T, overrides: Partial<Record<ApiErrorKind, string>>) {
  const parseError = (err: unknown): ApiError => parseApiError(err, overrides)
  const error: ApiError | null = mutation.error ? parseError(mutation.error) : null
  // parseError too, for per-call onError callbacks (the toast) to word errors the same way.
  return { ...mutation, error, parseError }
}

export function useCreateReview(tmdbId: number) {
  const invalidate = useInvalidateFilm(tmdbId)
  const mutation = useMutation({
    mutationFn: (input: ReviewInput) => createReview(tmdbId, input),
    onSuccess: invalidate,
    // 409: they already reviewed it (another tab, a double-click). Refresh so the page swaps
    // "Rate This Film" for "Edit Your Review".
    onError: (err) => (parseApiError(err).kind === "conflict" ? invalidate() : undefined),
  })
  return withParsedError(mutation, {
    conflict: "You've already reviewed this film. Edit your existing review instead.",
    unauthorized: "Your session ended. Sign in again to post your review.",
    server: "Your review couldn't be posted. Try again in a moment.",
    "not-found": "This film is no longer available to review.",
  })
}

export function useUpdateReview(tmdbId: number) {
  const invalidate = useInvalidateFilm(tmdbId)
  const mutation = useMutation({
    mutationFn: ({ reviewId, input }: { reviewId: number; input: ReviewInput }) => updateReview(reviewId, input),
    onSuccess: invalidate,
    // A 404 means it was deleted elsewhere (another tab): refresh so the stale card disappears.
    onError: (err) => (parseApiError(err).kind === "not-found" ? invalidate() : undefined),
  })
  return withParsedError(mutation, {
    forbidden: "You can only edit your own reviews.",
    "not-found": "This review was deleted, so it can't be edited.",
    unauthorized: "Your session ended. Sign in again to save your changes.",
    server: "Your changes couldn't be saved. Try again in a moment.",
  })
}

export function useDeleteReview(tmdbId: number) {
  const invalidate = useInvalidateFilm(tmdbId)
  const mutation = useMutation({
    mutationFn: (reviewId: number) => deleteReview(reviewId),
    onSuccess: invalidate,
    onError: (err) => (parseApiError(err).kind === "not-found" ? invalidate() : undefined),
  })
  return withParsedError(mutation, {
    forbidden: "You can only delete your own reviews.",
    "not-found": "This review was already deleted.",
    unauthorized: "Your session ended. Sign in again to delete your review.",
    server: "Your review couldn't be deleted. Try again in a moment.",
  })
}
