package io.github.timliiang.review;

import io.github.timliiang.common.exception.BadRequestException;
import io.github.timliiang.review.dto.MyReviewResponse;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

// The signed-in member's own reviews, for the private "Your reviews" page (/reviews).
// Signed-in only: not in SecurityConfig's permitAll list, so no token means 401. "me" is resolved
// from the token in ReviewService, so there is no user id in the URL to swap for someone else's.
@RestController
@AllArgsConstructor
@RequestMapping("/api/users/me/reviews")
public class MyReviewsController {

    static final int MAX_PAGE_SIZE = 50;

    private final ReviewService reviewService;

    // GET /api/users/me/reviews?sort=rating-desc&page=0&size=20
    @GetMapping
    public ResponseEntity<Page<MyReviewResponse>> list(
            @RequestParam(defaultValue = "rating-desc") String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        if (page < 0) throw new BadRequestException("page must be 0 or more");
        if (size < 1 || size > MAX_PAGE_SIZE) throw new BadRequestException("size must be between 1 and " + MAX_PAGE_SIZE);
        PageRequest pageable = PageRequest.of(page, size, MyReviewSort.fromParam(sort).sort());
        return ResponseEntity.ok(reviewService.findMyReviews(pageable));
    }
}
