package io.github.timliiang.movie.detail;

import io.github.timliiang.movie.catalog.CatalogMovie;
import io.github.timliiang.movie.tmdb.TmdbListMovie;
import io.github.timliiang.movie.tmdb.TmdbMovieFull;
import io.github.timliiang.movie.tmdb.TmdbMovieFull.*;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.groups.Tuple.tuple;

// The TMDB-to-page mapping, without Spring or HTTP.
class MovieDetailCatalogTest {

    static TmdbMovieFull film(Videos videos, Credits credits, ListPage recs, ListPage similar,
                              ReleaseDates releaseDates, WatchProviders watch) {
        return new TmdbMovieFull(550L, "Fight Club", " ", "Overview", "1999-10-15", 0, "Released", "en",
                "/p.jpg", "/b.jpg", List.of(), videos, null, credits, recs, similar, releaseDates, watch);
    }

    static TmdbListMovie listed(long id, String poster) {
        return new TmdbListMovie(id, "Film " + id, "2001-01-01", poster, List.of(), 1.0);
    }

    @Test
    void blankTaglineAndZeroRuntime_becomeNull() {
        MovieDetail d = MovieDetailCatalog.toDetail(film(null, null, null, null, null, null), "US");

        assertThat(d.tagline()).isNull();
        assertThat(d.runtime()).isNull();
        assertThat(d.videos()).isEmpty();
        assertThat(d.artwork().posters()).isEmpty();
        assertThat(d.watch()).isNull();
        assertThat(d.rating()).isNull();
    }

    @Test
    void videos_leadWithNewestOfficialYoutubeTrailer() {
        Videos v = new Videos(List.of(
                new Video("teaser", "Teaser", "YouTube", "Teaser", true, "2024-01-01"),
                new Video("old", "Trailer 1", "YouTube", "Trailer", true, "2023-01-01"),
                new Video("vimeo", "Trailer V", "Vimeo", "Trailer", true, "2025-01-01"),
                new Video("fan", "Fan trailer", "YouTube", "Trailer", false, "2025-06-01"),
                new Video("new", "Final trailer", "YouTube", "Trailer", true, "2024-06-01"),
                new Video("clip", "Clip", "YouTube", "Clip", true, "2024-07-01")));

        assertThat(MovieDetailCatalog.videos(v)).extracting(MovieDetail.Video::key)
                .containsExactly("new", "old", "fan", "teaser");
    }

    @Test
    void writers_mergeJobsPerPerson_andRolesKeepPageOrder() {
        Credits c = new Credits(List.of(), List.of(
                new CrewMember(2L, "Jim Uhls", "Screenplay", "Writing", null),
                new CrewMember(3L, "Chuck Palahniuk", "Novel", "Writing", null),
                new CrewMember(2L, "Jim Uhls", "Story", "Writing", null),
                new CrewMember(1L, "David Fincher", "Director", "Directing", "/f.jpg"),
                new CrewMember(9L, "Grip", "Key Grip", "Camera", null)));

        List<MovieDetail.CrewRole> roles = MovieDetailCatalog.crew(c);

        assertThat(roles).extracting(MovieDetail.CrewRole::role).containsExactly("director", "writer");
        assertThat(roles.get(1).people())
                .extracting(MovieDetail.CrewCredit::name, MovieDetail.CrewCredit::detail)
                .containsExactly(tuple("Jim Uhls", "Screenplay, Story"), tuple("Chuck Palahniuk", "Novel"));
    }

    @Test
    void similar_topsUpShortRecommendations_withoutDuplicatesPosterlessOrSelf() {
        ListPage recs = new ListPage(List.of(listed(1, "/1.jpg"), listed(2, null)));
        ListPage similar = new ListPage(List.of(listed(1, "/1.jpg"), listed(3, "/3.jpg"), listed(550, "/self.jpg")));

        assertThat(MovieDetailCatalog.similar(film(null, null, recs, similar, null, null)))
                .extracting(CatalogMovie::tmdbId).containsExactly(1L, 3L);
    }

    @Test
    void certification_prefersTheatrical_andFallsBackToUs() {
        ReleaseDates rd = new ReleaseDates(List.of(
                new CountryReleases("US", List.of(new ReleaseDate("", 1), new ReleaseDate("NR", 5), new ReleaseDate("R", 3))),
                new CountryReleases("GB", List.of(new ReleaseDate("18", 3)))));

        assertThat(MovieDetailCatalog.certification(rd, "GB")).isEqualTo(new MovieDetail.Certification("18", "GB"));
        assertThat(MovieDetailCatalog.certification(rd, "US")).isEqualTo(new MovieDetail.Certification("R", "US"));
        assertThat(MovieDetailCatalog.certification(rd, "FR")).isEqualTo(new MovieDetail.Certification("R", "US"));
    }

    @Test
    void watch_isOnlyForTheViewersRegion_andMergesFreeWithAds() {
        Provider netflix = new Provider(8L, "Netflix", "/n.png", 2);
        Provider pluto = new Provider(300L, "Pluto TV", "/p.png", 9);
        Provider tubi = new Provider(73L, "Tubi", "/t.png", 5);
        WatchProviders w = new WatchProviders(Map.of(
                "US", new RegionProviders("https://tmdb/watch", List.of(netflix), List.of(tubi), List.of(pluto), null, null)));

        MovieDetail.WatchOptions us = MovieDetailCatalog.watch(w, "US");

        assertThat(us.stream()).extracting(MovieDetail.Provider::name).containsExactly("Netflix");
        assertThat(us.free()).extracting(MovieDetail.Provider::name).containsExactly("Tubi", "Pluto TV");
        assertThat(us.rent()).isEmpty();
        assertThat(MovieDetailCatalog.watch(w, "GB")).isNull();
    }

    @Test
    void region_isNormalized() {
        assertThat(MovieDetailService.normalizeRegion("gb")).isEqualTo("GB");
        assertThat(MovieDetailService.normalizeRegion(null)).isEqualTo("US");
        assertThat(MovieDetailService.normalizeRegion("../x")).isEqualTo("US");
    }
}
