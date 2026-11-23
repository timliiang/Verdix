package io.github.timliiang.movie.catalog;

import java.util.Arrays;

// The catalog's tabs. TMDB has a ready-made endpoint for each (/movie/popular, ...), but those take
// no genre or date filters, so each list is rebuilt as a preset of /discover/movie instead (see
// CatalogService#discoverParams). `param` is the URL spelling the frontend uses.
public enum CatalogList {
    POPULAR("popular", "popularity.desc"),
    NOW_PLAYING("now_playing", "popularity.desc"),
    UPCOMING("upcoming", "popularity.desc"),
    TOP_RATED("top_rated", "vote_average.desc");

    private final String param;
    // The list's own order, used when the user leaves Sort on its default.
    private final String tmdbSort;

    CatalogList(String param, String tmdbSort) {
        this.param = param;
        this.tmdbSort = tmdbSort;
    }

    public String tmdbSort() {
        return tmdbSort;
    }

    // Registered as a Spring converter (CatalogWebConfig). Throwing here becomes a 400, not a 500.
    public static CatalogList fromParam(String value) {
        return Arrays.stream(values())
                .filter(l -> l.param.equals(value))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Unknown list: " + value));
    }
}
