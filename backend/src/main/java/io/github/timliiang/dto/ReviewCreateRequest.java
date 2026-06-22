package io.github.timliiang.dto;

import jakarta.validation.constraints.*;

import java.time.LocalDate;

public record ReviewCreateRequest(

        @NotNull(message = "TmdbId is required")
        Long tmdbId,

        @Min(1)
        @Max(10)
        @NotNull(message = "Rating is required")
        Integer rating,

        @Size(max = 1000)
        @NotNull(message = "Review text is required. Can be an empty string")
        String reviewText,

        @NotNull(message = "Watched date is required")
        LocalDate watchedDate
) {}
