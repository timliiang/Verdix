package io.github.timliiang.service;

import io.github.timliiang.dto.ReviewCreateRequest;
import io.github.timliiang.dto.ReviewResponse;
import io.github.timliiang.entities.Movie;
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

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;

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
    void createReview_shouldThrowWhenTmbdNotFound() {

    }

    @Test
    void updateReview_shouldReturnResponseOnSuccess() {

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
