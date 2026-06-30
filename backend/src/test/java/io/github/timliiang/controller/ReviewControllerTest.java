package io.github.timliiang.controller;

import io.github.timliiang.services.ReviewService;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.boot.security.autoconfigure.SecurityAutoConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@WebMvcTest(controllers = ReviewController.class,
        excludeAutoConfiguration = SecurityAutoConfiguration.class)
@AutoConfigureMockMvc(addFilters = false)
public class ReviewControllerTest {

    @MockitoBean
    private ReviewService reviewService;

    // POST /api/reviews
    @Test
    void create_shouldReturn201OnSuccess() {

    }

    @Test
    void create_shouldReturn400WhenInvalidRequest() {
    }

    @Test
    void create_shouldReturn403WhenInvalidAuthorization() {
    }


    // GET /api/reviews/user/{userId}
    @Test
    void getReviews_shouldReturn200OnSuccess() {
    }

    @Test
    void getReviews_shouldReturn401WhenAuthorizationFails() {
    }


    // GET /api/reviews/movie/{movieId}
    @Test
    void getReviewsByMovie_shouldReturn200OnSuccess() {
    }


    // PUT /api/reviews/{id}
    @Test
    void updateReview_shouldReturn200OnSuccess() {
    }

    @Test
    void updateReview_shouldReturn403WhenInvalidAuthorization() {
    }

    @Test
    void updateReview_shouldReturn404WhenInvalidId() {

    }

    // DELETE /api/reviews/{id}
    @Test
    void deleteReview_shouldReturn204OnSuccess() {

    }

    @Test
    void deleteReview_shouldReturn403WhenInvalidAuthorization() {

    }

    @Test
    void deleteReview_shouldReturn404WhenInvalidId() {
    }


}
