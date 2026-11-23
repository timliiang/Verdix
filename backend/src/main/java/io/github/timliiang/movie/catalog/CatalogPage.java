package io.github.timliiang.movie.catalog;

import java.util.List;

// Mirrors CatalogPage in frontend/src/lib/catalogTypes.ts.
public record CatalogPage(
        int page,
        // Capped at CatalogQuery.MAX_PAGE, so the frontend's "Load more" stops where TMDB does.
        int totalPages,
        int totalResults,
        List<CatalogMovie> results
) {}
