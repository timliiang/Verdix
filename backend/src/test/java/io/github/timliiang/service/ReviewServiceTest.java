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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
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
        ReviewUpdateRequest request = new ReviewUpdateRequest(
                9,
                "",
                LocalDate.of(2026, 6, 29)
        );

        when(reviewRepository.findById(anyLong())).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class,
                () ->reviewService.updateReview(1L, request),
                "Review with id 1 not found");

        verify(reviewRepository, never()).save(any());
    }

    @Test
    void updateReview_shouldThrowWhenUserDoesNotOwnReview() {
        Review review = new Review();
        review.setId(1L);
        review.setUserId(1L);
        review.setRating(3);

        ReviewUpdateRequest request = new ReviewUpdateRequest(
                9,
                "",
                LocalDate.of(2026, 6, 29)
        );

        when(reviewRepository.findById(anyLong())).thenReturn(Optional.of(review));
        when(authService.getCurrentUserId()).thenReturn(2L);

        assertThrows(AccessDeniedException.class,
                () -> reviewService.updateReview(1L, request),
                "You are not authorized to perform this action."
        );
        verify(reviewRepository, never()).save(any());
    }

    @Test
    void deleteReview_shouldReturnNothingOnSuccess() {
        Review review = new Review();
        review.setId(1L);
        review.setUserId(7L);

        when(reviewRepository.findById(anyLong())).thenReturn(Optional.of(review));
        when(authService.getCurrentUserId()).thenReturn(7L);

        reviewService.deleteReview(1L);

        verify(reviewRepository).delete(review);
    }

    @Test
    void deleteReview_shouldThrowWhenReviewNotFound() {
        when(reviewRepository.findById(anyLong())).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> reviewService.deleteReview(1L),
                "Review with id 1 not found");

        verify(reviewRepository, never()).delete(any(Review.class));
    }

    @Test
    void deleteReview_shouldThrowWhenUserDoesNotOwnReview() {
        Review review = new Review();
        review.setId(1L);
        review.setUserId(7L);

        when(reviewRepository.findById(anyLong())).thenReturn(Optional.of(review));
        when(authService.getCurrentUserId()).thenReturn(2L);

        assertThrows(AccessDeniedException.class,
                () -> reviewService.deleteReview(1L),
                "You are not authorized to perform this action.");

        verify(reviewRepository, never()).delete(any(Review.class));
    }

    @Test
    void findByUserId_shouldReturnPageOnSuccess() {
        Review review = new Review();
        review.setUserId(1L);
        review.setRating(3);

        Page<Review> page = new PageImpl<>(List.of(review));
        Pageable pageable = PageRequest.of(0, 10);

        when(reviewRepository.findByUserId(1L, pageable)).thenReturn(page);

        Page<ReviewResponse> response = reviewService.findByUserId(1L, pageable);

        assertEquals(1, response.getTotalElements());
        assertEquals(3, response.getContent().getFirst().rating());
        verify(reviewRepository).findByUserId(1L, pageable);
    }

    @Test
    void findByMovieId_shouldReturnPageOnSuccess() {
        Review review = new Review();
        review.setMovieId(11L);
        review.setRating(3);

        Page<Review> page = new PageImpl<>(List.of(review));
        Pageable pageable = PageRequest.of(0, 10);

        when(reviewRepository.findByMovieId(11L, pageable)).thenReturn(page);

        Page<ReviewResponse> response = reviewService.findByMovieId(11L, pageable);

        assertEquals(1, response.getTotalElements());
        assertEquals(3, response.getContent().getFirst().rating());
        verify(reviewRepository).findByMovieId(11L, pageable);
    }

}
