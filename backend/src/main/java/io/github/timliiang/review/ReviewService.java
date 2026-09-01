package io.github.timliiang.review;

import io.github.timliiang.movie.MovieService;
import io.github.timliiang.review.dto.ReviewCreateRequest;
import io.github.timliiang.review.dto.ReviewResponse;
import io.github.timliiang.review.dto.ReviewUpdateRequest;
import io.github.timliiang.movie.Movie;
import io.github.timliiang.common.exception.ResourceNotFoundException;
import io.github.timliiang.security.AuthService;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final AuthService authService;
    private final MovieService movieService;

    public Page<ReviewResponse> findByUserId(Long userId, Pageable pageable) {
        return reviewRepository.findByUserId(userId, pageable)
                .map(ReviewResponse::from);
    }

    public Page<ReviewResponse> findByMovieId(Long movieId, Pageable pageable) {
        return reviewRepository.findByMovieId(movieId, pageable)
                .map(ReviewResponse::from);
    }

    public ReviewResponse createReview(ReviewCreateRequest request) {
        // Validate movieId
        Movie movie = movieService.getOrFetchMovie(request.tmdbId());

        Review review = new Review();
        review.setUserId(authService.getCurrentUserId());
        review.setMovieId(movie.getId());
        review.setRating(request.rating());
        review.setReviewText(request.reviewText());
        review.setWatchedDate(request.watchedDate());

        return ReviewResponse.from(reviewRepository.save(review));
    }

    public ReviewResponse updateReview(Long reviewId, ReviewUpdateRequest reviewRequest) {
        Review review = verifyReview(reviewId);
        verifyOwnership(review);

        // Update fields
        review.setRating(reviewRequest.rating());
        review.setReviewText(reviewRequest.reviewText());
        review.setWatchedDate(reviewRequest.watchedDate());

        return ReviewResponse.from(reviewRepository.save(review));
    }

    public void deleteReview(Long reviewId) {
        Review review = verifyReview(reviewId);
        verifyOwnership(review);

        reviewRepository.delete(review);
    }

    private Review verifyReview(Long reviewId) {
        return reviewRepository.findById(reviewId).orElseThrow(
                () -> new ResourceNotFoundException("Review with id " + reviewId + " not found")
        );
    }

    private void verifyOwnership(Review review) {
        if (!review.getUserId().equals(authService.getCurrentUserId()))
            throw new AccessDeniedException("You are not authorized to perform this action.");
    }

}
