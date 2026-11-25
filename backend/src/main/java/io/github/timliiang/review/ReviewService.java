package io.github.timliiang.review;

import io.github.timliiang.movie.MovieService;
import io.github.timliiang.movie.detail.RatingSummary;
import io.github.timliiang.review.dto.MovieReviewResponse;
import io.github.timliiang.review.dto.ReviewCreateRequest;
import io.github.timliiang.review.dto.ReviewResponse;
import io.github.timliiang.review.dto.ReviewUpdateRequest;
import io.github.timliiang.movie.Movie;
import io.github.timliiang.common.exception.BadRequestException;
import io.github.timliiang.common.exception.ConflictException;
import io.github.timliiang.common.exception.ResourceNotFoundException;
import io.github.timliiang.security.AuthService;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.Optional;

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

    // The film page's two reads. A film with no reviews has no movies row, so both answer "empty"
    // rather than 404: an unreviewed film is the normal case, not an error.
    public RatingSummary summarizeByTmdbId(Long tmdbId) {
        return movieService.findStored(tmdbId)
                .map(movie -> RatingSummary.of(reviewRepository.findRatingsByMovieId(movie.getId())))
                .orElseGet(RatingSummary::empty);
    }

    public Page<MovieReviewResponse> findPublicByTmdbId(Long tmdbId, Pageable pageable) {
        return movieService.findStored(tmdbId)
                .map(movie -> reviewRepository.findPublicByMovieId(movie.getId(), pageable))
                .orElseGet(() -> Page.empty(pageable));
    }

    // The signed-in member's review of a film, if they wrote one. Empty (not an error) when they
    // haven't, or when nobody has reviewed the film yet (no movies row). Read-only, so looking
    // never stores the film.
    public Optional<ReviewResponse> findMine(Long tmdbId) {
        Long userId = authService.getCurrentUserId();
        return movieService.findStored(tmdbId)
                .flatMap(movie -> reviewRepository.findByUserIdAndMovieId(userId, movie.getId()))
                .map(ReviewResponse::from);
    }

    public ReviewResponse createReview(ReviewCreateRequest request) {
        validateWatchedDate(request.watchedDate());
        Long userId = authService.getCurrentUserId();
        // Validate movieId
        Movie movie = movieService.getOrFetchMovie(request.tmdbId());

        if (reviewRepository.existsByUserIdAndMovieId(userId, movie.getId()))
            throw new ConflictException("You've already reviewed this film. Edit your review instead.");

        Review review = new Review();
        review.setUserId(userId);
        review.setMovieId(movie.getId());
        review.setRating(request.rating());
        review.setReviewText(request.reviewText());
        review.setWatchedDate(request.watchedDate());

        return ReviewResponse.from(reviewRepository.save(review));
    }

    public ReviewResponse updateReview(Long reviewId, ReviewUpdateRequest reviewRequest) {
        validateWatchedDate(reviewRequest.watchedDate());
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

    // No watching films in the future. Not @PastOrPresent on the DTO: that compares against the
    // server's date, and a member east of the server (say UTC+10, early morning) would have their
    // own "today" rejected. Allowing one day past UTC covers every timezone (they run to UTC+14).
    private static void validateWatchedDate(LocalDate watchedDate) {
        if (watchedDate != null && watchedDate.isAfter(LocalDate.now(ZoneOffset.UTC).plusDays(1)))
            throw new BadRequestException("The watched date can't be in the future.");
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
