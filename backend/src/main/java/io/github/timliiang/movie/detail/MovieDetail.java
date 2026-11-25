package io.github.timliiang.movie.detail;

import io.github.timliiang.movie.catalog.CatalogGenre;
import io.github.timliiang.movie.catalog.CatalogMovie;

import java.util.List;

// GET /api/movies/{tmdbId}/details: everything the film page shows. Our own shape, so TMDB can
// rename fields without the frontend noticing. Mirrors MovieDetail in frontend/src/lib/movieTypes.ts.
//
// Two sources, deliberately kept apart:
// - TMDB facts (everything but rating): cached per film and region by MovieDetailCatalog.
// - rating: Verdix's own reviews, read live from our database on every request, so a new review
//   shows up at once. Reading it never inserts a film; only writing a review does (ReviewService).
public record MovieDetail(
        Long tmdbId,
        String title,
        // Null when TMDB has none (common for older or smaller films).
        String tagline,
        String overview,
        // ISO date, or null when unannounced.
        String releaseDate,
        // Minutes; null when unknown (TMDB sends 0).
        Integer runtime,
        Certification certification,
        // ISO 639-1 code ("en", "ko"); the frontend names it in the reader's language with Intl.DisplayNames.
        String originalLanguage,
        String status,
        String posterPath,
        String backdropPath,
        List<CatalogGenre> genres,
        // Trailer first, then other official trailers and teasers. Empty when TMDB has none.
        List<Video> videos,
        Artwork artwork,
        List<CastCredit> cast,
        List<CrewRole> crew,
        List<CatalogMovie> similar,
        // Null when no provider offers the film in the requested region.
        WatchOptions watch,
        RatingSummary rating
) {
    // The cached copy has no rating; each request attaches a fresh one.
    public MovieDetail withRating(RatingSummary summary) {
        return new MovieDetail(tmdbId, title, tagline, overview, releaseDate, runtime, certification,
                originalLanguage, status, posterPath, backdropPath, genres, videos, artwork, cast, crew,
                similar, watch, summary);
    }

    // The age rating ("PG-13", "15") and the country whose board gave it, since the viewer's own
    // country may have none and the US rating is shown instead.
    public record Certification(String rating, String region) {}

    // A YouTube video id; the frontend builds the thumbnail and embed URLs from it.
    public record Video(String key, String name, String type) {}

    public record Artwork(List<Image> posters, List<Image> backdrops) {}

    public record Image(String path, int width, int height) {}

    public record CastCredit(Long id, String name, String character, String profilePath) {}

    // One role on the film ("director", "writer", ...) and who held it, in TMDB's order.
    public record CrewRole(String role, List<CrewCredit> people) {}

    // detail: the specific credit when a role merges several jobs ("Screenplay", "Novel"), else null.
    public record CrewCredit(Long id, String name, String profilePath, String detail) {}

    public record WatchOptions(
            String region,
            // TMDB's watch page for the film; TMDB's API has no per-provider deep links.
            String link,
            List<Provider> stream,
            // Free, with or without ads.
            List<Provider> free,
            List<Provider> rent,
            List<Provider> buy) {}

    public record Provider(Long id, String name, String logoPath) {}
}
