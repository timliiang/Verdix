// Query keys are arrays, and invalidation matches by prefix: invalidating ["movie", 550] refreshes
// both ["movie", 550, "details", "GB"] and ["movie", 550, "reviews"]. So everything about one film
// lives under one prefix, and a review write refreshes exactly that film's score and list.
export const movieKeys = {
    all: (tmdbId: number) => ['movie', tmdbId] as const,
    details: (tmdbId: number, region: string) => ['movie', tmdbId, 'details', region] as const,
    reviews: (tmdbId: number) => ['movie', tmdbId, 'reviews'] as const,
};
