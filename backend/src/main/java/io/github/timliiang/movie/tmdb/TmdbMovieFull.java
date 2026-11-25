package io.github.timliiang.movie.tmdb;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;
import java.util.Map;

// GET /movie/{id}?append_to_response=videos,images,credits,recommendations,similar,release_dates,watch/providers
// One request instead of seven: TMDB nests each appended endpoint's response under its own name.
// Only the fields the film page uses are declared; Spring's Jackson setup ignores the rest.
// Missing numbers bind as 0 and missing objects as null, so the mapper (MovieDetailCatalog) null-checks.
public record TmdbMovieFull(
        Long id,
        String title,
        String tagline,
        String overview,
        @JsonProperty("release_date") String releaseDate,
        Integer runtime,
        // "Released", "Post Production", "In Production", "Planned", "Rumored", "Canceled".
        String status,
        @JsonProperty("original_language") String originalLanguage,
        @JsonProperty("poster_path") String posterPath,
        @JsonProperty("backdrop_path") String backdropPath,
        List<TmdbGenre> genres,
        Videos videos,
        Images images,
        Credits credits,
        ListPage recommendations,
        ListPage similar,
        @JsonProperty("release_dates") ReleaseDates releaseDates,
        @JsonProperty("watch/providers") WatchProviders watchProviders
) {
    public record Videos(List<Video> results) {}

    public record Video(
            String key,
            String name,
            // "YouTube" or "Vimeo".
            String site,
            // "Trailer", "Teaser", "Clip", "Featurette", "Behind the Scenes", ...
            String type,
            boolean official,
            @JsonProperty("published_at") String publishedAt) {}

    // Posters and backdrops come pre-filtered by include_image_language (English + text-free).
    public record Images(List<Image> posters, List<Image> backdrops) {}

    public record Image(
            @JsonProperty("file_path") String filePath,
            int width,
            int height,
            // null means the image has no text on it (a "clean" backdrop or poster).
            @JsonProperty("iso_639_1") String language,
            @JsonProperty("vote_average") double voteAverage,
            @JsonProperty("vote_count") int voteCount) {}

    public record Credits(List<CastMember> cast, List<CrewMember> crew) {}

    public record CastMember(
            Long id,
            String name,
            String character,
            @JsonProperty("profile_path") String profilePath,
            // Billing order: 0 is top billed.
            int order) {}

    public record CrewMember(
            Long id,
            String name,
            String job,
            String department,
            @JsonProperty("profile_path") String profilePath) {}

    public record ListPage(List<TmdbListMovie> results) {}

    public record ReleaseDates(List<CountryReleases> results) {}

    public record CountryReleases(
            @JsonProperty("iso_3166_1") String country,
            @JsonProperty("release_dates") List<ReleaseDate> releaseDates) {}

    // type: 1 premiere, 2 limited theatrical, 3 theatrical, 4 digital, 5 physical, 6 TV.
    // certification is "" when that release has none.
    public record ReleaseDate(String certification, int type) {}

    // Keyed by ISO 3166-1 country code ("US", "GB", ...). TMDB's data comes from JustWatch.
    public record WatchProviders(Map<String, RegionProviders> results) {}

    public record RegionProviders(
            // TMDB's watch page for the film in that region; TMDB has no per-provider deep links.
            String link,
            // flatrate = included with a subscription.
            List<Provider> flatrate,
            List<Provider> free,
            List<Provider> ads,
            List<Provider> rent,
            List<Provider> buy) {}

    public record Provider(
            @JsonProperty("provider_id") Long id,
            @JsonProperty("provider_name") String name,
            @JsonProperty("logo_path") String logoPath,
            @JsonProperty("display_priority") int displayPriority) {}
}
