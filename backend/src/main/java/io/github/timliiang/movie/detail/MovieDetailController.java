package io.github.timliiang.movie.detail;

import io.github.timliiang.review.dto.MovieReviewResponse;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

// Public (see SecurityConfig), like the /movies catalog: anyone can open a film page. Both routes
// only read. GET /api/movies/{id} (MovieController) is the older lookup that stores the film; the
// page does not use it.
@RestController
@AllArgsConstructor
@RequestMapping("/api/movies/{tmdbId}")
public class MovieDetailController {

    private final MovieDetailService movieDetailService;

    // GET /api/movies/550/details?region=GB
    // region picks the age rating and where-to-watch country; the frontend sends the browser's.
    @GetMapping("/details")
    public ResponseEntity<MovieDetail> details(
            @PathVariable Long tmdbId,
            @RequestParam(required = false) String region) {
        return ResponseEntity.ok(movieDetailService.detail(tmdbId, region));
    }

    // GET /api/movies/550/reviews?page=0&size=10. Newest first. Empty (not 404) for an unreviewed film.
    @GetMapping("/reviews")
    public ResponseEntity<Page<MovieReviewResponse>> reviews(
            @PathVariable Long tmdbId,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(movieDetailService.reviews(tmdbId, pageable));
    }
}
