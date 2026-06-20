package io.github.timliiang.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record TmdbMovieDetail(
    Long id,
    String title,
    @JsonProperty("release_date") String releaseDate,
    @JsonProperty("poster_path") String posterPath,
    String overview,
    List<TmdbGenre> genres
) {}
