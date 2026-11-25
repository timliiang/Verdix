package io.github.timliiang.movie.catalog;

import io.github.timliiang.security.JwtAuthFilter;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.security.autoconfigure.SecurityAutoConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

// Web slice: checks parameter binding (URL spellings, comma lists, defaults) and status codes.
// Security is covered by SecurityEntryPointTest, so filters are off here.
@WebMvcTest(controllers = CatalogController.class,
        excludeAutoConfiguration = SecurityAutoConfiguration.class)
@AutoConfigureMockMvc(addFilters = false)
class CatalogControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private JwtAuthFilter jwtAuthFilter;

    @MockitoBean
    private CatalogService catalogService;

    private static final CatalogPage ONE_FILM = new CatalogPage(1, 1, 1,
            List.of(new CatalogMovie(550L, "Fight Club", "1999-10-15", "/p.jpg", List.of(18L), 61.2)));

    @Test
    void discover_withNoParams_usesDefaults() throws Exception {
        when(catalogService.discover(any())).thenReturn(ONE_FILM);

        mockMvc.perform(get("/api/movies/discover"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.results[0].tmdbId").value(550))
                .andExpect(jsonPath("$.results[0].releaseDate").value("1999-10-15"))
                .andExpect(jsonPath("$.totalPages").value(1));

        verify(catalogService).discover(new CatalogQuery(CatalogList.POPULAR, CatalogSort.LIST, List.of(), null, 1));
    }

    @Test
    void discover_bindsUrlSpellingsAndCommaLists() throws Exception {
        when(catalogService.discover(any())).thenReturn(ONE_FILM);

        mockMvc.perform(get("/api/movies/discover")
                        .param("list", "now_playing")
                        .param("sort", "title_asc")
                        .param("genres", "53,18")
                        .param("decade", "2010")
                        .param("page", "2"))
                .andExpect(status().isOk());

        verify(catalogService).discover(new CatalogQuery(CatalogList.NOW_PLAYING, CatalogSort.TITLE_ASC, List.of(18L, 53L), 2010, 2));
    }

    @Test
    void discover_unknownList_is400() throws Exception {
        mockMvc.perform(get("/api/movies/discover").param("list", "trending"))
                .andExpect(status().isBadRequest());
        verifyNoInteractions(catalogService);
    }

    @Test
    void discover_pagePastTmdbLimit_is400WithReason() throws Exception {
        mockMvc.perform(get("/api/movies/discover").param("page", "501"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Page must be between 1 and 500"));
    }

    @Test
    void discover_nonNumericGenre_is400() throws Exception {
        mockMvc.perform(get("/api/movies/discover").param("genres", "drama"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void discover_tmdbDown_is502() throws Exception {
        when(catalogService.discover(any()))
                .thenThrow(new ResponseStatusException(HttpStatus.BAD_GATEWAY, "The film catalogue is unavailable right now"));

        mockMvc.perform(get("/api/movies/discover"))
                .andExpect(status().isBadGateway())
                .andExpect(jsonPath("$.error").value("The film catalogue is unavailable right now"));
    }

    @Test
    void search_normalisesTextAndBindsPage() throws Exception {
        when(catalogService.search(any())).thenReturn(ONE_FILM);

        mockMvc.perform(get("/api/movies/search").param("query", "  Fight   CLUB ").param("page", "2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.results[0].title").value("Fight Club"));

        verify(catalogService).search(new SearchQuery("fight club", 2));
    }

    @Test
    void search_tooLong_is400WithReason() throws Exception {
        mockMvc.perform(get("/api/movies/search").param("query", "a".repeat(101)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Search text must be at most 100 characters"));
        verifyNoInteractions(catalogService);
    }

    @Test
    void genres_returnsList() throws Exception {
        when(catalogService.genres()).thenReturn(List.of(new CatalogGenre(28L, "Action")));

        mockMvc.perform(get("/api/movies/genres"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Action"));
    }
}
