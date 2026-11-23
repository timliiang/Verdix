package io.github.timliiang.movie.tmdb;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record TmdbDiscoverResponse(
        int page,
        List<TmdbListMovie> results,
        // Can exceed 500, but TMDB refuses any page past 500.
        @JsonProperty("total_pages") int totalPages,
        @JsonProperty("total_results") int totalResults
) {}
