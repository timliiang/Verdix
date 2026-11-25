import api from "./axios"

// The signed-in review endpoints (backend ReviewController). All three need a token; the Axios
// interceptor adds it, and signs the user out if the backend answers 401.

// Mirrors ReviewCreateRequest / ReviewUpdateRequest. rating is a whole number from 1 to 10;
// reviewText may be "" (a score with no words) but not null; watchedDate is ISO (YYYY-MM-DD), or
// null when the member doesn't say when they watched it.
export interface ReviewInput {
  rating: number
  reviewText: string
  watchedDate: string | null
}

// Mirrors ReviewResponse: what the write endpoints return.
export interface SavedReview {
  id: number
  userId: number
  movieId: number
  rating: number
  reviewText: string
  watchedDate: string | null
  createdAt: string
}

// GET /api/reviews/mine?tmdbId=. The signed-in member's review of this film, or null. The backend
// answers 204 No Content (empty body) when there is none; Axios turns an empty body into "".
export async function fetchMyReview(tmdbId: number, signal?: AbortSignal): Promise<SavedReview | null> {
  const { data } = await api.get<SavedReview | "">("/api/reviews/mine", { params: { tmdbId }, signal })
  return data || null
}

// POST /api/reviews. The first review of a film is what stores the film in the Verdix database.
// 409 if this member already reviewed the film (one review per member per film).
export async function createReview(tmdbId: number, input: ReviewInput): Promise<SavedReview> {
  const { data } = await api.post<SavedReview>("/api/reviews", { tmdbId, ...input })
  return data
}

// PUT /api/reviews/{id}. 403 if it is someone else's review, 404 if it was deleted meanwhile.
export async function updateReview(reviewId: number, input: ReviewInput): Promise<SavedReview> {
  const { data } = await api.put<SavedReview>(`/api/reviews/${reviewId}`, input)
  return data
}

// DELETE /api/reviews/{id}. 204 on success; same 403/404 cases as update.
export async function deleteReview(reviewId: number): Promise<void> {
  await api.delete(`/api/reviews/${reviewId}`)
}

// --- "Your reviews" (/reviews, signed-in only) ---

// The orders GET /api/users/me/reviews accepts (backend MyReviewSort). Anything else is a 400.
export const myReviewSorts = [
  { value: "rating-desc", label: "Highest rated" },
  { value: "rating-asc", label: "Lowest rated" },
  { value: "newest", label: "Newest reviews" },
  { value: "oldest", label: "Oldest reviews" },
  { value: "watched", label: "Recently watched" },
  { value: "title", label: "Title A–Z" },
] as const

export type MyReviewSort = (typeof myReviewSorts)[number]["value"]
export const DEFAULT_MY_REVIEW_SORT: MyReviewSort = "rating-desc"

export function isMyReviewSort(value: string | null): value is MyReviewSort {
  return myReviewSorts.some((s) => s.value === value)
}

// Mirrors MyReviewResponse: a review plus the film it is about.
export interface MyReview {
  id: number
  tmdbId: number
  title: string
  releaseYear: number | null
  posterPath: string | null
  rating: number
  reviewText: string
  watchedDate: string | null
  // ISO local date-time
  createdAt: string
}

export interface MyReviewPage {
  content: MyReview[]
  totalElements: number
  last: boolean
  number: number
}

export const MY_REVIEWS_PAGE_SIZE = 20

// GET /api/users/me/reviews. "me" is the token's user, so this only ever lists the caller's own.
export async function fetchMyReviews(sort: MyReviewSort, page: number, signal?: AbortSignal): Promise<MyReviewPage> {
  const { data } = await api.get<MyReviewPage>("/api/users/me/reviews", {
    params: { sort, page, size: MY_REVIEWS_PAGE_SIZE },
    signal,
  })
  return data
}
