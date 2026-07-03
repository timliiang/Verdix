package io.github.timliiang.controller;

import io.github.timliiang.dto.ReviewCreateRequest;
import io.github.timliiang.dto.ReviewResponse;
import io.github.timliiang.dto.ReviewUpdateRequest;
import io.github.timliiang.services.ReviewService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @PostMapping()
    public ResponseEntity<ReviewResponse> create(
            @Valid @RequestBody ReviewCreateRequest request) {
        ReviewResponse response = reviewService.createReview(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<Page<ReviewResponse>> getReviews(
            @PathVariable Long userId, Pageable pageable) {
        Page<ReviewResponse> reviews = reviewService.findByUserId(userId, pageable);
        return ResponseEntity.ok(reviews);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ReviewResponse> updateReview(
            @PathVariable Long id,
            @Valid @RequestBody ReviewUpdateRequest request) {
        ReviewResponse response = reviewService.updateReview(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReview(@PathVariable Long id) {
        reviewService.deleteReview(id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @GetMapping("/movie/{movieId}")
    public ResponseEntity<Page<ReviewResponse>> getReviewsByMovie(
            @PathVariable Long movieId, Pageable pageable) {
        Page<ReviewResponse> reviews = reviewService.findByMovieId(movieId, pageable);
        return ResponseEntity.ok(reviews);
    }

}
