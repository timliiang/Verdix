package io.github.timliiang.service;

import io.github.timliiang.dto.ReviewCreateRequest;
import io.github.timliiang.dto.ReviewResponse;
import io.github.timliiang.dto.ReviewUpdateRequest;
import io.github.timliiang.entities.Movie;
import io.github.timliiang.entities.Review;
import io.github.timliiang.exception.ResourceNotFoundException;
import io.github.timliiang.repositories.ReviewRepository;
import io.github.timliiang.services.AuthService;
import io.github.timliiang.services.MovieService;
import io.github.timliiang.services.ReviewService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ReviewServiceTest {

    @Mock
    private ReviewRepository reviewRepository;

    @Mock
    private AuthService authService;

    @Mock
    private MovieService movieService;

    @InjectMocks
    private ReviewService reviewService;

    public void createReview_shouldReturnResponseOnSuccess() {
        ReviewCreateRequest request = new ReviewCreateRequest(
                11L,
                8,
                "",
                LocalDate.of(2026, 6, 27)
        );

        when(movieService.getOrFetchMovie(anyLong())).thenReturn(any(Movie.class));

        ReviewResponse response = reviewService.createReview(request);
        assertNotNull(response);
        assert(response.rating() == 8);
        assert(response.reviewText().isEmpty());
        assert(response.watchedDate().isEqual(LocalDate.of(2026, 6, 27)));
    }

    @Test
    void createReview_shouldThrowWhenTmdbNotFound() {
        ReviewCreateRequest request = new ReviewCreateRequest(
                11L,
                8,
                "",
                LocalDate.of(2026, 6, 27)
        );

        when(movieService.getOrFetchMovie(anyLong())).thenThrow(new ResourceNotFoundException("TMDB id does not exist"));

        assertThrows(ResourceNotFoundException.class,
                () -> reviewService.createReview(request), "TMDB id does not exist");
        verify(reviewRepository, never()).save(any());
    }

    @Test
    void updateReview_shouldReturnResponseOnSuccess() {
        Review review = new Review();
        review.setUserId(1L);
        review.setRating(3);

        ReviewUpdateRequest request = new ReviewUpdateRequest(
            9,
            "",
            LocalDate.of(2026, 6, 29)
        );

        when(reviewRepository.findById(anyLong())).thenReturn(Optional.of(review));
        when(authService.getCurrentUserId()).thenReturn(1L);
        when(reviewRepository.save(any(Review.class))).thenReturn(review);

        ReviewResponse response = reviewService.updateReview(1L, request);

        assertNotNull(response);
        assert(response.rating() == 9);
        verify(reviewRepository).save(any());
    }

    @Test
    void updateReview_shouldThrowWhenReviewNotFound() {

    }

    @Test
    void updateReview_shouldThrowWhenUserDoesNotOwnReview() {

    }

    @Test
    void deleteReview_shouldReturnNothingOnSuccess() {

    }

    @Test
    void deleteReview_shouldThrowWhenReviewNotFound() {

    }

    @Test
    void deleteReview_shouldThrowWhenUserDoesNotOwnReview() {

    }

    @Test
    void findByUserId_shouldReturnPageOnSuccess() {

    }

    @Test
    void findByMovieId_shouldReturnPageOnSuccess() {

    }

}
