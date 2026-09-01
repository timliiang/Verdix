package io.github.timliiang.review;

import io.github.timliiang.review.dto.ReviewCreateRequest;
import io.github.timliiang.review.dto.ReviewResponse;
import io.github.timliiang.review.dto.ReviewUpdateRequest;
import io.github.timliiang.common.exception.ResourceNotFoundException;
import io.github.timliiang.security.JwtAuthFilter;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.security.autoconfigure.SecurityAutoConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.ObjectMapper;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = ReviewController.class,
        excludeAutoConfiguration = SecurityAutoConfiguration.class)
@AutoConfigureMockMvc(addFilters = false)
public class ReviewControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private JwtAuthFilter jwtAuthFilter;

    @MockitoBean
    private ReviewService reviewService;

    // POST /api/reviews
    @Test
    void create_shouldReturn201OnSuccess() throws Exception {
        ReviewCreateRequest request = new ReviewCreateRequest(
                11L, 7, "",
                LocalDate.of(2026, 7, 2));
        ReviewResponse response = buildMockResponse();

        when(reviewService.createReview(any())).thenReturn(response);

        mockMvc.perform(post("/api/reviews")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.rating").value(7));
    }

    @Test
    void create_shouldReturn400WhenInvalidRequest() throws Exception {
        ReviewCreateRequest request = new ReviewCreateRequest(
                11L, 11, "",
                LocalDate.of(2026, 7, 2));
        ReviewResponse response = buildMockResponse();

        when(reviewService.createReview(any())).thenReturn(response);

        mockMvc.perform(post("/api/reviews")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.rating").exists());
    }

    // GET /api/reviews/user/{userId}
    @Test
    void getReviews_shouldReturn200OnSuccess() throws Exception {
        ReviewResponse response = buildMockResponse();
        Page<ReviewResponse> page = new PageImpl<>(List.of(response));
        Pageable pageable = PageRequest.of(0, 10);

        when(reviewService.findByUserId(1L, pageable)).thenReturn(page);

        mockMvc.perform(get("/api/reviews/user/1")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].rating").value(7))
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    // GET /api/reviews/movie/{movieId}
    @Test
    void getReviewsByMovie_shouldReturn200OnSuccess() throws Exception {
        ReviewResponse response = buildMockResponse();
        Page<ReviewResponse> page = new PageImpl<>(List.of(response));
        Pageable pageable = PageRequest.of(0, 10);

        when(reviewService.findByMovieId(11L, pageable)).thenReturn(page);

        mockMvc.perform(get("/api/reviews/movie/11")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].rating").value(7));
    }

    // PUT /api/reviews/{id}
    @Test
    void updateReview_shouldReturn200OnSuccess() throws Exception {
        ReviewUpdateRequest request = new ReviewUpdateRequest(
                7, "text", LocalDate.of(2026, 7, 2));
        ReviewResponse response = buildMockResponse();

        when(reviewService.updateReview(eq(1L), any())).thenReturn(response);

        mockMvc.perform(put("/api/reviews/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.rating").value(7));
    }

    @Test
    void updateReview_shouldReturn403WhenInvalidAuthorization() throws Exception {
        ReviewUpdateRequest request = new ReviewUpdateRequest(
                7, "text", LocalDate.of(2026, 7, 2));

        when(reviewService.updateReview(eq(1L), any()))
                .thenThrow(new AccessDeniedException("You are not authorized to perform this action."));

        mockMvc.perform(put("/api/reviews/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("You are not authorized to perform this action."));
    }

    @Test
    void updateReview_shouldReturn404WhenInvalidId() throws Exception {
        ReviewUpdateRequest request = new ReviewUpdateRequest(
                7, "text", LocalDate.of(2026, 7, 2));

        when(reviewService.updateReview(eq(1L), any()))
                .thenThrow(new ResourceNotFoundException("Review with id 1 not found"));

        mockMvc.perform(put("/api/reviews/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Review with id 1 not found"));
    }

    // DELETE /api/reviews/{id}
    @Test
    void deleteReview_shouldReturn204OnSuccess() throws Exception {
        mockMvc.perform(delete("/api/reviews/1"))
                .andExpect(status().isNoContent());

        verify(reviewService).deleteReview(1L);
    }

    @Test
    void deleteReview_shouldReturn403WhenInvalidAuthorization() throws Exception {
        doThrow(new AccessDeniedException("You are not authorized to perform this action."))
                .when(reviewService).deleteReview(eq(1L));

        mockMvc.perform(delete("/api/reviews/1"))
                .andExpect(status().isForbidden());
    }

    @Test
    void deleteReview_shouldReturn404WhenInvalidId() throws Exception{
        doThrow(new ResourceNotFoundException("Review with id 1 not found"))
                .when(reviewService).deleteReview(eq(1L));

        mockMvc.perform(delete("/api/reviews/1"))
                .andExpect(status().isNotFound());
    }


    private ReviewResponse buildMockResponse() {
        return new ReviewResponse(
                1L, 1L, 11L, 7, "text",
                LocalDate.of(2026, 7, 2),
                LocalDateTime.of(2026, 6, 27, 12, 0)
        );
    }

}
