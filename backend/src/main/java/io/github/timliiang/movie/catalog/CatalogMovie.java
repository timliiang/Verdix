package io.github.timliiang.movie.catalog;

import java.util.List;

// What the catalog grid needs per film: our own shape, so TMDB can rename fields without the
// frontend noticing. Mirrors CatalogMovie in frontend/src/lib/catalogTypes.ts.
public record CatalogMovie(
        Long tmdbId,
        String title,
        // ISO date, or null (TMDB sends "" when it has none).
        String releaseDate,
        // Relative image path ("/abc.jpg"); the frontend adds the CDN size. Null when TMDB has none.
        String posterPath,
        List<Long> genreIds,
        double popularity
) {}
