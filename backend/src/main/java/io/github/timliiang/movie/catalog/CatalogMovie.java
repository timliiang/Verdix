package io.github.timliiang.movie.catalog;

import io.github.timliiang.movie.tmdb.TmdbListMovie;

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
) {
    // Shared by the catalog grid and the film page's similar-films rail, which show the same card.
    public static CatalogMovie from(TmdbListMovie m) {
        return new CatalogMovie(
                m.id(),
                m.title(),
                m.releaseDate() == null || m.releaseDate().isBlank() ? null : m.releaseDate(),
                m.posterPath(),
                m.genreIds() == null ? List.of() : m.genreIds(),
                m.popularity());
    }
}
