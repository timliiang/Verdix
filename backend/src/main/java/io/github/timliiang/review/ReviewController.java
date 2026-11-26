package io.github.timliiang.review;

import io.github.timliiang.review.dto.ReviewCreateRequest;
import io.github.timliiang.review.dto.ReviewResponse;
import io.github.timliiang.review.dto.ReviewUpdateRequest;
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

    // GET /api/reviews/mine?tmdbId=550. Signed-in only (not in SecurityConfig's permitAll list):
    // "mine" needs a token to know who is asking. 200 with the review, or 204 No Content when the
    // member hasn't reviewed the film: not having a review is a normal state, not a 404.
    @GetMapping("/mine")
    public ResponseEntity<ReviewResponse> getMine(@RequestParam Long tmdbId) {
        return reviewService.findMine(tmdbId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.noContent().build());
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
