package io.github.timliiang.review;

import io.github.timliiang.movie.Movie;
import io.github.timliiang.movie.MovieRepository;
import io.github.timliiang.movie.tmdb.TmdbClient;
import io.github.timliiang.security.JwtProvider;
import io.github.timliiang.user.User;
import io.github.timliiang.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.hamcrest.Matchers.contains;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

// GET /api/users/me/reviews end to end: real security chain (a real JWT), real H2 database, so the
// JPQL join and every MyReviewSort order are actually executed, not just mocked. Sorting by
// aliases and expressions is exactly the kind of thing that compiles fine and fails at runtime.
@SpringBootTest
@AutoConfigureMockMvc
class MyReviewsIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private MovieRepository movieRepository;
    @Autowired private ReviewRepository reviewRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private JwtProvider jwtProvider;

    // Same mock set as MovieDetailIntegrationTest, so Spring reuses one cached test context.
    @MockitoBean private TmdbClient tmdbClient;

    private String token;

    // The critic reviews three films, inserted in this order (so createdAt and id ascend):
    //   Alien       9  watched 2026-01-10
    //   brazil      6  no watched date      (lower-case on purpose: title sort must ignore case)
    //   Casablanca  9  watched 2026-03-01
    // Someone else also reviewed Alien; that review must never appear.
    @BeforeEach
    void setUp() {
        reviewRepository.deleteAll();
        movieRepository.deleteAll();
        userRepository.deleteAll();

        User critic = user("critic");
        User other = user("someoneelse");
        Movie alien = movie(348L, "Alien", 1979);
        Movie brazil = movie(68L, "brazil", 1985);
        Movie casablanca = movie(289L, "Casablanca", 1942);

        review(critic, alien, 9, LocalDate.of(2026, 1, 10));
        review(critic, brazil, 6, null);
        review(critic, casablanca, 9, LocalDate.of(2026, 3, 1));
        review(other, alien, 2, null);

        token = "Bearer " + jwtProvider.generateToken("critic");
    }

    @Test
    void signedOut_is401() throws Exception {
        mockMvc.perform(get("/api/users/me/reviews")).andExpect(status().isUnauthorized());
    }

    @Test
    void default_isHighestRatedFirst_andOnlyMine() throws Exception {
        // Two 9s tie on rating; the newer review (Casablanca) comes first.
        mockMvc.perform(get("/api/users/me/reviews").header("Authorization", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(3))
                .andExpect(jsonPath("$.content[*].title", contains("Casablanca", "Alien", "brazil")))
                .andExpect(jsonPath("$.content[0].tmdbId").value(289))
                .andExpect(jsonPath("$.content[0].releaseYear").value(1942))
                .andExpect(jsonPath("$.content[0].posterPath").value("/289.jpg"));
    }

    @Test
    void lowestRatedFirst() throws Exception {
        expectOrder("rating-asc", "brazil", "Casablanca", "Alien");
    }

    @Test
    void newestAndOldest() throws Exception {
        expectOrder("newest", "Casablanca", "brazil", "Alien");
        expectOrder("oldest", "Alien", "brazil", "Casablanca");
    }

    @Test
    void recentlyWatched_putsUndatedLast() throws Exception {
        expectOrder("watched", "Casablanca", "Alien", "brazil");
    }

    @Test
    void title_ignoresCase() throws Exception {
        // Case-sensitive would give Alien, Casablanca, brazil (upper case sorts before lower).
        expectOrder("title", "Alien", "brazil", "Casablanca");
    }

    @Test
    void paging_neitherRepeatsNorSkips() throws Exception {
        mockMvc.perform(get("/api/users/me/reviews").param("size", "2").header("Authorization", token))
                .andExpect(jsonPath("$.content[*].title", contains("Casablanca", "Alien")));
        mockMvc.perform(get("/api/users/me/reviews").param("size", "2").param("page", "1").header("Authorization", token))
                .andExpect(jsonPath("$.content[*].title", contains("brazil")));
    }

    @Test
    void unknownSort_is400() throws Exception {
        mockMvc.perform(get("/api/users/me/reviews").param("sort", "userId").header("Authorization", token))
                .andExpect(status().isBadRequest());
    }

    private void expectOrder(String sort, String... titles) throws Exception {
        mockMvc.perform(get("/api/users/me/reviews").param("sort", sort).header("Authorization", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[*].title", contains(titles)));
    }

    private User user(String username) {
        User u = new User();
        u.setUsername(username);
        u.setEmail(username + "@example.com");
        u.setPassword("x");
        return userRepository.save(u);
    }

    private Movie movie(Long tmdbId, String title, int year) {
        Movie m = new Movie();
        m.setTmdbId(tmdbId);
        m.setTitle(title);
        m.setReleaseYear(year);
        m.setPosterPath("/" + tmdbId + ".jpg");
        return movieRepository.save(m);
    }

    private void review(User user, Movie movie, int rating, LocalDate watched) {
        Review r = new Review();
        r.setUserId(user.getId());
        r.setMovieId(movie.getId());
        r.setRating(rating);
        r.setReviewText("");
        r.setWatchedDate(watched);
        reviewRepository.save(r);
    }
}
