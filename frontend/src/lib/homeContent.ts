// Content for the home page (src/pages/HomePage.tsx): the featured film, the weekly ranking,
// recent reviews and reviewers to follow.
// Titles match the poster art in public/movies. Scores, counts and reviews are mock data.
import { films, trendingFilms, type LandingFilm } from "./landingData"
import { topReviewers } from "./homeData"
import type { Reviewer } from "./homeTypes"

export interface RankedFilm extends LandingFilm {
  rank: number
  score: number
  rankings: number
}

export interface DirectionReview {
  id: string
  film: LandingFilm
  author: Reviewer
  body: string
  placedAt: number
  listSize: number
}

export const rankedThisWeek: RankedFilm[] = trendingFilms.map((entry, i) => ({
  ...films[entry.id],
  rank: i + 1,
  score: entry.score,
  rankings: entry.rankings,
}))

// The most-ranked film this week, not the top-scored one: it is the film people are talking about.
const neonDrifter = rankedThisWeek.find((f) => f.id === "neon-drifter")!
export const featuredFilm = {
  ...neonDrifter,
  synopsis: "A getaway driver takes one last job across a flooded, neon-lit city, and the city fights back.",
  runtime: "2h 11m",
  backdropUrl: "/movies/hero-backdrop.png",
}

export const recentReviews: DirectionReview[] = [
  {
    id: "rv1",
    film: films.distance,
    author: topReviewers[2],
    body: "Haunting, patient, and beautifully shot. It stayed with me for days.",
    placedAt: 2,
    listSize: 318,
  },
  {
    id: "rv2",
    film: films["void-within"],
    author: topReviewers[1],
    body: "The best sci-fi score in years. I moved it straight to the top of my list.",
    placedAt: 1,
    listSize: 204,
  },
  {
    id: "rv3",
    film: films["last-light"],
    author: topReviewers[3],
    body: "Stylish and mean in all the right ways, even if the third act wobbles.",
    placedAt: 7,
    listSize: 412,
  },
  {
    id: "rv4",
    film: films["golden-dusk"],
    author: topReviewers[4],
    body: "Tender, warm, and quietly devastating. A perfect late-night watch.",
    placedAt: 11,
    listSize: 189,
  },
]

export const reviewersToFollow: Reviewer[] = topReviewers

const countFormat = new Intl.NumberFormat("en-US")
export const formatNumber = (n: number) => countFormat.format(n)
