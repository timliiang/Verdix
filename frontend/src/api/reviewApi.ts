import api from "./axios"

// The signed-in review endpoints (backend ReviewController). All three need a token; the Axios
// interceptor adds it, and signs the user out if the backend answers 401.

// Mirrors ReviewCreateRequest / ReviewUpdateRequest. rating is a whole number from 1 to 10;
// reviewText may be "" (a score with no words) but not null; watchedDate is ISO (YYYY-MM-DD).
export interface ReviewInput {
  rating: number
  reviewText: string
  watchedDate: string
}

// Mirrors ReviewResponse: what the write endpoints return.
export interface SavedReview {
  id: number
  userId: number
  movieId: number
  rating: number
  reviewText: string
  watchedDate: string
  createdAt: string
}

// POST /api/reviews. The first review of a film is what stores the film in the Verdix database.
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
