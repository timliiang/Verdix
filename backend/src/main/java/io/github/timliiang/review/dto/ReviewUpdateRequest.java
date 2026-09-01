package io.github.timliiang.review.dto;

import jakarta.validation.constraints.*;

import java.time.LocalDate;

public record ReviewUpdateRequest(

        @Min(1)
        @Max(10)
        @NotNull(message = "Rating is required")
        Integer rating,

        @Size(max = 1000)
        @NotNull
        String reviewText,

        @NotNull(message = "Watched date is required")
        LocalDate watchedDate
) {}
