export interface Reviewer {
  id: string
  name: string
  handle: string
  avatarColor: string
  followers: number
}

export interface Review {
  id: string
  author: Reviewer
  rating: number // 0 - 5, supports halves
  body: string
  createdAt: string
}

export interface HomeMovie {
  id: string
  title: string
  year: number
  genres: string[]
  runtimeMinutes: number
  posterUrl: string
  backdropUrl?: string
  synopsis: string
  averageRating: number // 0 - 5
  reviewCount: number
  latestReview: Review
}
