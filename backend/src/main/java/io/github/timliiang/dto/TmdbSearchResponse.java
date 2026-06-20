package io.github.timliiang.dto;


import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record TmdbSearchResponse(
    int page,
    @JsonProperty("results") List<TmdbMovieDetail> results,
    @JsonProperty("total_pages") int totalPages,
    @JsonProperty("total_results") int totalResults
) {}
