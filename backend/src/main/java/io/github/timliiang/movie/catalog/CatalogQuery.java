package io.github.timliiang.movie.catalog;

import io.github.timliiang.common.exception.BadRequestException;

import java.util.List;
import java.util.Objects;

// One catalog request, and the key it is cached under. A record's equals/hashCode compare every
// field, so equal queries share a cache entry. The compact constructor runs on every construction:
// it normalises (genres 53,18 and 18,53 become the same key) and rejects what TMDB would refuse,
// so a CatalogQuery that exists is always a valid one.
public record CatalogQuery(
        CatalogList list,
        CatalogSort sort,
        // A film must have every genre (TMDB's with_genres=a,b means AND).
        List<Long> genreIds,
        // First year of a decade (2010 = 2010-2019), 0 for "before 1990", null for any year.
        Integer decade,
        int page
) {
    // TMDB answers page 501+ with an error.
    public static final int MAX_PAGE = 500;
    public static final int MAX_GENRES = 10;

    public CatalogQuery {
        Objects.requireNonNull(list, "list");
        Objects.requireNonNull(sort, "sort");

        genreIds = genreIds == null ? List.of() : genreIds.stream()
                .filter(Objects::nonNull)
                .distinct()
                .sorted()
                .toList();
        if (genreIds.size() > MAX_GENRES) {
            throw new BadRequestException("Pick at most " + MAX_GENRES + " genres");
        }
        if (genreIds.stream().anyMatch(id -> id <= 0)) {
            throw new BadRequestException("Genre ids must be positive");
        }
        if (decade != null && decade != 0 && (decade < 1900 || decade > 2100 || decade % 10 != 0)) {
            throw new BadRequestException("Decade must be the first year of a decade, e.g. 2010, or 0 for before 1990");
        }
        if (page < 1 || page > MAX_PAGE) {
            throw new BadRequestException("Page must be between 1 and " + MAX_PAGE);
        }
    }
}
