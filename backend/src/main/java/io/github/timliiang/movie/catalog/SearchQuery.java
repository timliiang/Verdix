package io.github.timliiang.movie.catalog;

import io.github.timliiang.common.exception.BadRequestException;

import java.util.Locale;

// One title search, and its cache key. Like CatalogQuery, the compact constructor normalises, so
// "Alien", " alien " and "ALIEN" are one cache entry and one TMDB call: TMDB's search ignores case
// and extra spaces anyway, so the answers would be identical.
public record SearchQuery(String text, int page) {

    // Long enough for any real title; caps what a caller can make us forward to TMDB.
    public static final int MAX_LENGTH = 100;

    public SearchQuery {
        text = text == null ? "" : text.strip().replaceAll("\\s+", " ").toLowerCase(Locale.ROOT);
        if (text.length() > MAX_LENGTH) {
            throw new BadRequestException("Search text must be at most " + MAX_LENGTH + " characters");
        }
        if (page < 1 || page > CatalogQuery.MAX_PAGE) {
            throw new BadRequestException("Page must be between 1 and " + CatalogQuery.MAX_PAGE);
        }
    }

    public boolean isBlank() {
        return text.isEmpty();
    }
}
