package io.github.timliiang.movie.detail;

import io.github.timliiang.common.config.CacheConfig;
import io.github.timliiang.movie.Movie;
import io.github.timliiang.movie.MovieRepository;
import io.github.timliiang.movie.tmdb.TmdbClient;
import io.github.timliiang.review.Review;
import io.github.timliiang.review.ReviewRepository;
import io.github.timliiang.user.User;
import io.github.timliiang.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.cache.CacheManager;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.List;
import java.util.Objects;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

// End to end through the real security chain, cache and H2 database, with TMDB mocked. Pins the
// rule the film page is built around: viewing a film never stores it; a review does, and then the
// page's rating and review list fill in.
@SpringBootTest
@AutoConfigureMockMvc
class MovieDetailIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private MovieRepository movieRepository;
    @Autowired private ReviewRepository reviewRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private CacheManager cacheManager;

    @MockitoBean private TmdbClient tmdbClient;

    @BeforeEach
    void setUp() {
        reviewRepository.deleteAll();
        movieRepository.deleteAll();
        userRepository.deleteAll();
        Objects.requireNonNull(cacheManager.getCache(CacheConfig.MOVIE_DETAIL)).clear();
        when(tmdbClient.getMovieFull(anyLong()))
                .thenReturn(MovieDetailCatalogTest.film(null, null, null, null, null, null));
    }

    @Test
    void viewingAnUnreviewedFilm_storesNothing_andHasNoRating() throws Exception {
        mockMvc.perform(get("/api/movies/550/details"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Fight Club"))
                .andExpect(jsonPath("$.rating.reviewCount").value(0))
                .andExpect(jsonPath("$.rating.median").doesNotExist());
        mockMvc.perform(get("/api/movies/550/reviews"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isEmpty());

        assertThat(movieRepository.count()).isZero();
    }

    @Test
    void reviewedFilm_showsMedianAndAuthors() throws Exception {
        Movie movie = new Movie();
        movie.setTmdbId(550L);
        movie.setTitle("Fight Club");
        movie = movieRepository.save(movie);

        // Two members, one review each: a member can review a film only once (uk_reviews_user_movie).
        for (int score : List.of(9, 6)) {
            User user = new User();
            user.setUsername(score == 9 ? "marlasinger" : "tylerdurden");
            user.setEmail(user.getUsername() + "@example.com");
            user.setPassword("x");
            user = userRepository.save(user);

            Review r = new Review();
            r.setUserId(user.getId());
            r.setMovieId(movie.getId());
            r.setRating(score);
            r.setReviewText("Score " + score);
            r.setWatchedDate(LocalDate.of(2026, 11, 1));
            reviewRepository.save(r);
        }

        mockMvc.perform(get("/api/movies/550/details"))
                .andExpect(jsonPath("$.rating.reviewCount").value(2))
                .andExpect(jsonPath("$.rating.median").value(7.5))
                .andExpect(jsonPath("$.rating.distribution[8]").value(1));
        mockMvc.perform(get("/api/movies/550/reviews"))
                .andExpect(jsonPath("$.content.length()").value(2))
                // Both rows can share a createdAt, so the newest-first order between them isn't fixed.
                .andExpect(jsonPath("$.content[*].username", hasItem("marlasinger")))
                .andExpect(jsonPath("$.content[0].email").doesNotExist());
    }

    @Test
    void tmdbFacts_areCachedPerRegion() throws Exception {
        mockMvc.perform(get("/api/movies/550/details").param("region", "us"));
        mockMvc.perform(get("/api/movies/550/details").param("region", "US"));
        mockMvc.perform(get("/api/movies/550/details").param("region", "GB"));

        verify(tmdbClient, times(2)).getMovieFull(550L);
    }
}
