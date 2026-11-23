package io.github.timliiang.movie.catalog;

import java.util.Arrays;

// LIST keeps the list's own order; the others override it. TMDB silently ignores an unknown sort_by
// and falls back to its default, so only these known values are ever sent.
public enum CatalogSort {
    LIST("list", null),
    RELEASE_DESC("release_desc", "primary_release_date.desc"),
    RELEASE_ASC("release_asc", "primary_release_date.asc"),
    TITLE_ASC("title_asc", "title.asc");

    private final String param;
    private final String tmdbSort;

    CatalogSort(String param, String tmdbSort) {
        this.param = param;
        this.tmdbSort = tmdbSort;
    }

    public String tmdbSort() {
        return tmdbSort;
    }

    public static CatalogSort fromParam(String value) {
        return Arrays.stream(values())
                .filter(s -> s.param.equals(value))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Unknown sort: " + value));
    }
}
