package io.github.timliiang.movie.catalog;

import io.github.timliiang.common.config.CacheConfig;
import io.github.timliiang.movie.tmdb.TmdbClient;
import io.github.timliiang.movie.tmdb.TmdbDiscoverResponse;
import lombok.AllArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import java.time.Clock;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

// The browse catalog: a cached proxy over TMDB's /discover/movie. Nothing is stored in our
// database; films enter the movies table only when someone opens or reviews one (MovieService).
@Service
@AllArgsConstructor
public class CatalogService {

    // TMDB's own lists, measured from the "dates" field of /movie/now_playing and /movie/upcoming:
    // now playing reaches back about six weeks, upcoming looks about three to four weeks ahead.
    static final int NOW_PLAYING_DAYS = 42;
    static final int UPCOMING_DAYS = 28;
    // Now playing and Upcoming are new films: first released (anywhere) no more than a year ago.
    static final int NEW_RELEASE_YEARS = 1;
    // Ranking by average alone is topped by films with three 10/10 votes; TMDB's list uses a floor.
    static final int TOP_RATED_MIN_VOTES = 300;
    // Re-sorting "popular" by date or title leaves no popularity cut-off, so it would surface
    // thousands of unknown entries first; a small vote floor keeps it to films people have seen.
    static final int RESORTED_POPULAR_MIN_VOTES = 100;

    private final TmdbClient tmdbClient;
    private final Clock clock;

    // Cached under the query itself (a record, so equal queries are equal keys). A thrown exception
    // is not cached, so a TMDB outage does not stick around for ten minutes.
    @Cacheable(CacheConfig.CATALOG)
    public CatalogPage discover(CatalogQuery query) {
        TmdbDiscoverResponse response = tmdbClient.discover(discoverParams(query));
        List<CatalogMovie> results = response.results() == null ? List.of()
                : response.results().stream().map(CatalogMovie::from).toList();
        return new CatalogPage(
                response.page(),
                Math.min(response.totalPages(), CatalogQuery.MAX_PAGE),
                response.totalResults(),
                results);
    }

    // Title search. Cached like discover: popular searches ("dune", "batman") are typed by many
    // people, and the frontend's debounce already trims the per-keystroke calls of one person.
    // A blank query is answered here without TMDB (which would reject it).
    @Cacheable(CacheConfig.SEARCH)
    public CatalogPage search(SearchQuery query) {
        if (query.isBlank()) return new CatalogPage(1, 0, 0, List.of());
        TmdbDiscoverResponse response = tmdbClient.searchMovies(query.text(), query.page());
        List<CatalogMovie> results = response.results() == null ? List.of()
                : response.results().stream().map(CatalogMovie::from).toList();
        return new CatalogPage(
                response.page(),
                Math.min(response.totalPages(), CatalogQuery.MAX_PAGE),
                response.totalResults(),
                results);
    }

    @Cacheable(CacheConfig.GENRES)
    public List<CatalogGenre> genres() {
        return tmdbClient.getGenres().stream()
                .map(g -> new CatalogGenre(g.id(), g.name()))
                .toList();
    }

    // Package-private for tests: the translation from our query to TMDB's parameters is the part
    // most worth pinning down, and it needs no HTTP to check.
    MultiValueMap<String, String> discoverParams(CatalogQuery query) {
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("include_adult", "false");
        params.add("include_video", "false");
        params.add("language", "en-US");
        params.add("page", String.valueOf(query.page()));

        LocalDate today = LocalDate.now(clock);
        // Bounds on the film's first release; the list and the decade filter can both set them.
        LocalDate firstReleasedFrom = null;
        LocalDate firstReleasedTo = null;

        switch (query.list()) {
            case POPULAR -> {
                if (query.sort() != CatalogSort.LIST) {
                    params.add("vote_count.gte", String.valueOf(RESORTED_POPULAR_MIN_VOTES));
                }
            }
            case TOP_RATED -> params.add("vote_count.gte", String.valueOf(TOP_RATED_MIN_VOTES));
            // release_date (any release, in any country) is the theatrical window; 2|3 = limited or
            // wide theatrical. That window alone also matches anniversary re-releases of old films,
            // and since TMDB can only sort by *first* release, "Oldest first" put 1920s classics at
            // the top of Upcoming. So both lists also require a first release within the last year
            // (not "since today": festival premieres often come months before the cinema run).
            case NOW_PLAYING -> {
                params.add("with_release_type", "2|3");
                params.add("release_date.gte", today.minusDays(NOW_PLAYING_DAYS).toString());
                params.add("release_date.lte", today.toString());
                firstReleasedFrom = today.minusYears(NEW_RELEASE_YEARS);
            }
            case UPCOMING -> {
                params.add("with_release_type", "2|3");
                params.add("release_date.gte", today.plusDays(1).toString());
                params.add("release_date.lte", today.plusDays(UPCOMING_DAYS).toString());
                firstReleasedFrom = today.minusYears(NEW_RELEASE_YEARS);
            }
        }

        params.add("sort_by", query.sort() == CatalogSort.LIST ? query.list().tmdbSort() : query.sort().tmdbSort());

        if (!query.genreIds().isEmpty()) {
            params.add("with_genres", query.genreIds().stream().map(String::valueOf).collect(Collectors.joining(",")));
        }

        // The decade narrows the same first-release range, so the two are intersected (the later
        // start, the earlier end) and sent once; sending a parameter twice leaves TMDB to pick one.
        // "Upcoming" + "1990s" then becomes an empty range, which TMDB answers with no results.
        if (query.decade() != null) {
            if (query.decade() == 0) {
                firstReleasedTo = earlier(firstReleasedTo, LocalDate.of(1989, 12, 31));
            } else {
                firstReleasedFrom = later(firstReleasedFrom, LocalDate.of(query.decade(), 1, 1));
                firstReleasedTo = earlier(firstReleasedTo, LocalDate.of(query.decade() + 9, 12, 31));
            }
        }
        if (firstReleasedFrom != null) params.add("primary_release_date.gte", firstReleasedFrom.toString());
        if (firstReleasedTo != null) params.add("primary_release_date.lte", firstReleasedTo.toString());
        return params;
    }

    private static LocalDate later(LocalDate current, LocalDate candidate) {
        return current == null || candidate.isAfter(current) ? candidate : current;
    }

    private static LocalDate earlier(LocalDate current, LocalDate candidate) {
        return current == null || candidate.isBefore(current) ? candidate : current;
    }
}
