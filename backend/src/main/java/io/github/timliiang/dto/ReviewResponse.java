package io.github.timliiang.dto;

import io.github.timliiang.entities.Review;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record ReviewResponse(
    Long id,
    Long userId,
    Long movieId,
    int rating,
    String reviewText,
    LocalDate watchedDate,
    LocalDateTime createdAt
) {
    public static ReviewResponse from(Review review) {
        return new ReviewResponse(
                review.getId(),
                review.getUserId(),
                review.getMovieId(),
                review.getRating(),
                review.getReviewText(),
                review.getWatchedDate(),
                review.getCreatedAt()
        );
    }
}
