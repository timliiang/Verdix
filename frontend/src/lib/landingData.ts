// Sample content for the marketing landing page (src/pages/LandingPage.tsx).
// Titles match the artwork in public/movies. Scores and counts are mock data.

export interface LandingFilm {
  id: string
  title: string
  year: number
  genre: string
  posterUrl: string
}

export const films: Record<string, LandingFilm> = {
  "last-light": { id: "last-light", title: "The Last Light", year: 2026, genre: "Noir", posterUrl: "/movies/poster-crimson.png" },
  "golden-dusk": { id: "golden-dusk", title: "Golden Dusk", year: 2025, genre: "Romance", posterUrl: "/movies/poster-afterglow.png" },
  distance: { id: "distance", title: "The Distance Between Us", year: 2025, genre: "Drama", posterUrl: "/movies/poster-midnight.png" },
  "neon-drifter": { id: "neon-drifter", title: "Neon Drifter", year: 2026, genre: "Thriller", posterUrl: "/movies/poster-neon-drive.png" },
  "void-within": { id: "void-within", title: "The Void Within", year: 2024, genre: "Sci-Fi", posterUrl: "/movies/poster-echo.png" },
  voltage: { id: "voltage", title: "Voltage", year: 2026, genre: "Action", posterUrl: "/movies/poster-voltage.png" },
}

// Ranking demo: an existing list, plus the films the visitor places into it.
export const demoStartingList = ["last-light", "golden-dusk", "distance", "neon-drifter"]
export const demoQueue = ["void-within", "voltage"]

// Community rail (mock numbers).
export const trendingFilms: { id: string; score: number; rankings: number }[] = [
  { id: "distance", score: 9.1, rankings: 2847 },
  { id: "void-within", score: 8.8, rankings: 3112 },
  { id: "last-light", score: 8.4, rankings: 1963 },
  { id: "golden-dusk", score: 8.2, rankings: 2205 },
  { id: "neon-drifter", score: 7.9, rankings: 4376 },
  { id: "voltage", score: 7.3, rankings: 3590 },
]

export const featuredReview = {
  filmId: "distance",
  body: "Haunting, patient, and beautifully shot. Stayed with me for days.",
  author: "Lena Cruz",
  handle: "lenacinema",
  rank: 2,
}
