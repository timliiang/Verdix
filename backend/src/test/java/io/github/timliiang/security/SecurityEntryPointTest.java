package io.github.timliiang.security;

import io.github.timliiang.movie.catalog.CatalogPage;
import io.github.timliiang.movie.catalog.CatalogService;
import io.github.timliiang.movie.detail.MovieDetailService;
import org.springframework.data.domain.Page;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

// Full context with the real security filter chain (the controller tests turn filters off), so
// this checks what the browser actually gets back when its token is missing or no longer valid.
@SpringBootTest
@AutoConfigureMockMvc
class SecurityEntryPointTest {

    @Autowired
    private MockMvc mockMvc;

    // Stands in for TMDB, so the public-route tests check access only.
    @MockitoBean
    private CatalogService catalogService;

    @MockitoBean
    private MovieDetailService movieDetailService;

    // Film pages are public too, but only their two GET reads.
    @Test
    void filmPage_withoutToken_isPublic() throws Exception {
        when(movieDetailService.reviews(any(), any())).thenReturn(Page.empty());

        mockMvc.perform(get("/api/movies/550/details")).andExpect(status().isOk());
        mockMvc.perform(get("/api/movies/550/reviews")).andExpect(status().isOk());
        mockMvc.perform(post("/api/movies/550/reviews")).andExpect(status().isUnauthorized());
        // "*" matches one path segment, so a deeper path does not slip through.
        mockMvc.perform(get("/api/movies/550/x/details")).andExpect(status().isUnauthorized());
    }

    @Test
    void protectedRoute_withoutToken_shouldReturn401() throws Exception {
        mockMvc.perform(get("/api/reviews/user/1"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void protectedRoute_withInvalidToken_shouldReturn401() throws Exception {
        mockMvc.perform(get("/api/reviews/user/1")
                        .header("Authorization", "Bearer not.a.valid-token"))
                .andExpect(status().isUnauthorized());
    }

    // The /movies catalog is public: no token, or a stale one, still browses.
    @Test
    void catalog_withoutToken_isPublic() throws Exception {
        when(catalogService.discover(any())).thenReturn(new CatalogPage(1, 1, 0, List.of()));
        when(catalogService.genres()).thenReturn(List.of());
        when(catalogService.search(any())).thenReturn(new CatalogPage(1, 0, 0, List.of()));

        mockMvc.perform(get("/api/movies/discover")).andExpect(status().isOk());
        mockMvc.perform(get("/api/movies/genres")).andExpect(status().isOk());
        mockMvc.perform(get("/api/movies/search").param("query", "alien")).andExpect(status().isOk());
        mockMvc.perform(get("/api/movies/discover")
                        .header("Authorization", "Bearer not.a.valid-token"))
                .andExpect(status().isOk());
    }

    // permitAll is narrow: the rest of /api/movies, and other methods on the same path, stay closed.
    @Test
    void otherMovieRoutes_withoutToken_shouldReturn401() throws Exception {
        mockMvc.perform(get("/api/movies/550")).andExpect(status().isUnauthorized());
        mockMvc.perform(post("/api/movies/search")).andExpect(status().isUnauthorized());
        mockMvc.perform(post("/api/movies/discover")).andExpect(status().isUnauthorized());
    }
}
