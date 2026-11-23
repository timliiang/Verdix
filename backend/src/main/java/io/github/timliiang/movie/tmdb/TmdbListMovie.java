package io.github.timliiang.movie.tmdb;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

// One film as TMDB's list endpoints (/discover/movie, /movie/popular, ...) return it. Unlike the
// detail endpoint, lists carry genre ids rather than genre objects. Only the fields we use.
public record TmdbListMovie(
        Long id,
        String title,
        // "" (not null) when TMDB has no date yet, typically for unreleased films.
        @JsonProperty("release_date") String releaseDate,
        @JsonProperty("poster_path") String posterPath,
        @JsonProperty("genre_ids") List<Long> genreIds,
        double popularity
) {}
