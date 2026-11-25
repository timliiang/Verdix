package io.github.timliiang.movie.catalog;

import io.github.timliiang.movie.tmdb.TmdbClient;
import io.github.timliiang.movie.tmdb.TmdbDiscoverResponse;
import io.github.timliiang.movie.tmdb.TmdbGenre;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.*;

// Full context, because @Cacheable only works through the proxy Spring wraps around the bean.
// (Calling a @Cacheable method from inside the same class skips the proxy, and with it the cache.)
@SpringBootTest
class CatalogCacheTest {

    @Autowired
    private CatalogService catalogService;

    @MockitoBean
    private TmdbClient tmdbClient;

    @Test
    void equalQueries_hitTmdbOnce() {
        when(tmdbClient.discover(any())).thenReturn(new TmdbDiscoverResponse(1, List.of(), 0, 0));

        // Same query, genres in a different order: one cache key after normalisation.
        catalogService.discover(new CatalogQuery(CatalogList.TOP_RATED, CatalogSort.LIST, List.of(53L, 18L), null, 1));
        catalogService.discover(new CatalogQuery(CatalogList.TOP_RATED, CatalogSort.LIST, List.of(18L, 53L), null, 1));
        // A different page is a different key.
        catalogService.discover(new CatalogQuery(CatalogList.TOP_RATED, CatalogSort.LIST, List.of(18L, 53L), null, 2));

        verify(tmdbClient, times(2)).discover(any());
    }

    @Test
    void searchesDifferingOnlyInCaseAndSpacing_hitTmdbOnce_andBlankNever() {
        when(tmdbClient.searchMovies(any(), anyInt())).thenReturn(new TmdbDiscoverResponse(1, List.of(), 0, 0));

        catalogService.search(new SearchQuery("Alien", 1));
        catalogService.search(new SearchQuery("  alien ", 1));
        catalogService.search(new SearchQuery("   ", 1));

        verify(tmdbClient, times(1)).searchMovies("alien", 1);
        verify(tmdbClient, times(1)).searchMovies(any(), anyInt());
    }

    @Test
    void genres_areFetchedOnce() {
        when(tmdbClient.getGenres()).thenReturn(List.of(new TmdbGenre(28L, "Action")));

        catalogService.genres();
        catalogService.genres();

        verify(tmdbClient, times(1)).getGenres();
    }
}
