package io.github.timliiang.movie.detail;

import io.github.timliiang.review.ReviewService;
import io.github.timliiang.review.dto.MovieReviewResponse;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Locale;
import java.util.regex.Pattern;

// The film page: TMDB's facts (cached, MovieDetailCatalog) plus Verdix's rating (live). Both reads;
// nothing here writes to the database, so opening a film never stores it.
@Service
@AllArgsConstructor
public class MovieDetailService {

    private static final Pattern REGION = Pattern.compile("[A-Za-z]{2}");

    private final MovieDetailCatalog catalog;
    private final ReviewService reviewService;

    public MovieDetail detail(Long tmdbId, String region) {
        return catalog.load(tmdbId, normalizeRegion(region)).withRating(reviewService.summarizeByTmdbId(tmdbId));
    }

    public Page<MovieReviewResponse> reviews(Long tmdbId, Pageable pageable) {
        return reviewService.findPublicByTmdbId(tmdbId, pageable);
    }

    // The region is part of the cache key, so anything but a two-letter country code falls back to
    // the US rather than creating cache entries for arbitrary strings.
    static String normalizeRegion(String region) {
        return region != null && REGION.matcher(region).matches()
                ? region.toUpperCase(Locale.ROOT)
                : MovieDetailCatalog.FALLBACK_REGION;
    }
}
