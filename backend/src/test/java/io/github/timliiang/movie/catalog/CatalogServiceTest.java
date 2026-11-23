package io.github.timliiang.movie.catalog;

import io.github.timliiang.common.exception.BadRequestException;
import io.github.timliiang.movie.tmdb.TmdbClient;
import io.github.timliiang.movie.tmdb.TmdbDiscoverResponse;
import io.github.timliiang.movie.tmdb.TmdbListMovie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.util.MultiValueMap;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

// Plain unit test, no Spring: the service is constructed by hand with a mocked client and a clock
// frozen on 2026-11-23, so the date windows are exact. (No proxy here, so @Cacheable is inert;
// caching is covered by CatalogCacheTest.)
class CatalogServiceTest {

    private TmdbClient tmdbClient;
    private CatalogService service;

    @BeforeEach
    void setUp() {
        tmdbClient = mock(TmdbClient.class);
        Clock fixed = Clock.fixed(Instant.parse("2026-11-23T12:00:00Z"), ZoneOffset.UTC);
        service = new CatalogService(tmdbClient, fixed);
    }

    private static CatalogQuery query(CatalogList list, CatalogSort sort, List<Long> genres, Integer decade) {
        return new CatalogQuery(list, sort, genres, decade, 1);
    }

    @Test
    void popular_usesPopularityAndNoDateWindow() {
        MultiValueMap<String, String> p = service.discoverParams(query(CatalogList.POPULAR, CatalogSort.LIST, null, null));

        assertThat(p.getFirst("sort_by")).isEqualTo("popularity.desc");
        assertThat(p.getFirst("include_adult")).isEqualTo("false");
        assertThat(p).doesNotContainKeys("release_date.gte", "vote_count.gte", "with_genres");
    }

    @Test
    void popular_resorted_addsVoteFloor() {
        MultiValueMap<String, String> p = service.discoverParams(query(CatalogList.POPULAR, CatalogSort.TITLE_ASC, null, null));

        assertThat(p.getFirst("sort_by")).isEqualTo("title.asc");
        assertThat(p.getFirst("vote_count.gte")).isEqualTo("100");
    }

    @Test
    void topRated_sortsByAverageWithVoteFloor() {
        MultiValueMap<String, String> p = service.discoverParams(query(CatalogList.TOP_RATED, CatalogSort.LIST, null, null));

        assertThat(p.getFirst("sort_by")).isEqualTo("vote_average.desc");
        assertThat(p.getFirst("vote_count.gte")).isEqualTo("300");
    }

    @Test
    void nowPlaying_isTheLastSixWeeksOfTheatricalReleases() {
        MultiValueMap<String, String> p = service.discoverParams(query(CatalogList.NOW_PLAYING, CatalogSort.LIST, null, null));

        assertThat(p.getFirst("release_date.gte")).isEqualTo("2026-10-12");
        assertThat(p.getFirst("release_date.lte")).isEqualTo("2026-11-23");
        assertThat(p.getFirst("with_release_type")).isEqualTo("2|3");
    }

    @Test
    void upcoming_startsTomorrow() {
        MultiValueMap<String, String> p = service.discoverParams(query(CatalogList.UPCOMING, CatalogSort.RELEASE_ASC, null, null));

        assertThat(p.getFirst("release_date.gte")).isEqualTo("2026-11-24");
        assertThat(p.getFirst("release_date.lte")).isEqualTo("2026-12-21");
        assertThat(p.getFirst("sort_by")).isEqualTo("primary_release_date.asc");
    }

    // Regression: re-releases of 1920s classics topped "Upcoming, oldest first" against live TMDB.
    @Test
    void windowedLists_onlyIncludeFilmsFirstReleasedInTheLastYear() {
        for (CatalogList list : List.of(CatalogList.NOW_PLAYING, CatalogList.UPCOMING)) {
            MultiValueMap<String, String> p = service.discoverParams(query(list, CatalogSort.LIST, null, null));
            assertThat(p.get("primary_release_date.gte")).containsExactly("2025-11-23");
            assertThat(p).doesNotContainKey("primary_release_date.lte");
        }
    }

    @Test
    void decade_isIntersectedWithTheNewReleaseBound_andSentOnce() {
        MultiValueMap<String, String> twenties = service.discoverParams(query(CatalogList.UPCOMING, CatalogSort.LIST, null, 2020));
        // The later start wins (a year ago, not 2020-01-01); the decade still caps the end.
        assertThat(twenties.get("primary_release_date.gte")).containsExactly("2025-11-23");
        assertThat(twenties.get("primary_release_date.lte")).containsExactly("2029-12-31");

        // A decade wholly before the bound: an empty range, so TMDB returns nothing.
        MultiValueMap<String, String> nineties = service.discoverParams(query(CatalogList.NOW_PLAYING, CatalogSort.LIST, null, 1990));
        assertThat(nineties.get("primary_release_date.gte")).containsExactly("2025-11-23");
        assertThat(nineties.get("primary_release_date.lte")).containsExactly("1999-12-31");
    }

    @Test
    void genresAndDecade_becomeTmdbFilters() {
        MultiValueMap<String, String> p = service.discoverParams(query(CatalogList.POPULAR, CatalogSort.LIST, List.of(53L, 18L), 2010));

        assertThat(p.getFirst("with_genres")).isEqualTo("18,53");
        assertThat(p.getFirst("primary_release_date.gte")).isEqualTo("2010-01-01");
        assertThat(p.getFirst("primary_release_date.lte")).isEqualTo("2019-12-31");
    }

    @Test
    void decadeZero_meansBefore1990() {
        MultiValueMap<String, String> p = service.discoverParams(query(CatalogList.POPULAR, CatalogSort.LIST, null, 0));

        assertThat(p.getFirst("primary_release_date.lte")).isEqualTo("1989-12-31");
        assertThat(p).doesNotContainKey("primary_release_date.gte");
    }

    @Test
    void query_normalisesGenresSoEqualRequestsShareACacheKey() {
        CatalogQuery a = query(CatalogList.POPULAR, CatalogSort.LIST, List.of(53L, 18L, 53L), null);
        CatalogQuery b = query(CatalogList.POPULAR, CatalogSort.LIST, List.of(18L, 53L), null);

        assertThat(a.genreIds()).containsExactly(18L, 53L);
        assertThat(a).isEqualTo(b).hasSameHashCodeAs(b);
    }

    @Test
    void query_rejectsWhatTmdbWouldRefuse() {
        assertThatThrownBy(() -> new CatalogQuery(CatalogList.POPULAR, CatalogSort.LIST, null, null, 501))
                .isInstanceOf(BadRequestException.class);
        assertThatThrownBy(() -> new CatalogQuery(CatalogList.POPULAR, CatalogSort.LIST, null, null, 0))
                .isInstanceOf(BadRequestException.class);
        assertThatThrownBy(() -> new CatalogQuery(CatalogList.POPULAR, CatalogSort.LIST, null, 2015, 1))
                .isInstanceOf(BadRequestException.class);
        assertThatThrownBy(() -> new CatalogQuery(CatalogList.POPULAR, CatalogSort.LIST, List.of(-1L), null, 1))
                .isInstanceOf(BadRequestException.class);
    }

    @Test
    void discover_mapsTmdbIntoOurShape() {
        TmdbListMovie dated = new TmdbListMovie(550L, "Fight Club", "1999-10-15", "/p.jpg", List.of(18L), 61.2);
        TmdbListMovie undated = new TmdbListMovie(1L, "Untitled", "", null, null, 3.0);
        when(tmdbClient.discover(any())).thenReturn(new TmdbDiscoverResponse(1, List.of(dated, undated), 48_000, 960_000));

        CatalogPage page = service.discover(query(CatalogList.POPULAR, CatalogSort.LIST, null, null));

        // TMDB reports 48,000 pages but serves only 500, so "Load more" must stop at 500.
        assertThat(page.totalPages()).isEqualTo(500);
        assertThat(page.totalResults()).isEqualTo(960_000);
        assertThat(page.results()).extracting(CatalogMovie::tmdbId).containsExactly(550L, 1L);
        assertThat(page.results().get(1).releaseDate()).isNull();
        assertThat(page.results().get(1).genreIds()).isEmpty();
    }
}
