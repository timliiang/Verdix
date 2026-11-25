package io.github.timliiang.review.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

// A review as the public film page shows it: the author's username instead of their user id, and
// nothing private (no email). Built straight from a JPQL constructor query in ReviewRepository.
// Mirrors MovieReview in frontend/src/lib/movieTypes.ts.
public record MovieReviewResponse(
        Long id,
        String username,
        String userImageUrl,
        int rating,
        String reviewText,
        LocalDate watchedDate,
        LocalDateTime createdAt
) {}
