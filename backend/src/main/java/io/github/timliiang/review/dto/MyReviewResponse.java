package io.github.timliiang.review.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

// One row of the signed-in member's "Your reviews" page: their review plus the film it is about,
// from the movies table (filled when the film was first reviewed), so the page needs no TMDB calls.
// Built straight from a JPQL constructor query in ReviewRepository.
// Mirrors MyReview in frontend/src/api/reviewApi.ts.
public record MyReviewResponse(
        Long id,
        Long tmdbId,
        String title,
        // Null when TMDB had no release date.
        Integer releaseYear,
        // Null when TMDB had no poster.
        String posterPath,
        int rating,
        String reviewText,
        LocalDate watchedDate,
        LocalDateTime createdAt
) {}
