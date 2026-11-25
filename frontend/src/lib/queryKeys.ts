// Query keys are arrays, and invalidation matches by prefix: invalidating ["movie", 550] refreshes
// both ["movie", 550, "details", "GB"] and ["movie", 550, "reviews"]. So everything about one film
// lives under one prefix, and a review write refreshes exactly that film's score and list.
// Search results: the first page alone (nav dropdown) and the paged list (/search) are separate
// keys because one is a plain query and the other an infinite query, which cache different shapes.
export const searchKeys = {
    preview: (text: string) => ['search', text, 'preview'] as const,
    pages: (text: string) => ['search', text, 'pages'] as const,
};

export const movieKeys = {
    all: (tmdbId: number) => ['movie', tmdbId] as const,
    details: (tmdbId: number, region: string) => ['movie', tmdbId, 'details', region] as const,
    reviews: (tmdbId: number) => ['movie', tmdbId, 'reviews'] as const,
    // The signed-in member's own review. Keyed by username too, so signing in as someone else never
    // shows the previous account's cached review. Still under ['movie', id], so writes refresh it.
    mine: (tmdbId: number, username: string) => ['movie', tmdbId, 'mine', username] as const,
};
