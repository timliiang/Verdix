package io.github.timliiang.service;

import io.github.timliiang.dto.TmdbMovieDetail;
import io.github.timliiang.entities.Movie;
import io.github.timliiang.repositories.MovieRepository;
import io.github.timliiang.services.MovieService;
import io.github.timliiang.services.TmdbClient;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class MovieServiceTest {

    @Mock
    private MovieRepository movieRepository;

    @Mock
    private TmdbClient tmdbClient;

    @InjectMocks
    private MovieService movieService;

    @Test
    void getOrFetchMovie_returnsExistingFromDb() {
        Movie existing = new Movie();
        existing.setTmdbId(550L);
        existing.setTitle("Fight Club");

        when(movieRepository.findByTmdbId(550L)).thenReturn(Optional.of(existing));

        Movie result = movieService.getOrFetchMovie(550L);

        assertThat(result.getTitle()).isEqualTo("Fight Club");

        // Movie in DB, tmdb api not called
        verifyNoInteractions(tmdbClient);
    }

    @Test
    void getOrFetchMovie_fetchesFromTmdbWhenNotInDb() {
         TmdbMovieDetail detail = new TmdbMovieDetail(
                 550L, "Fight Club", "1999-10-15",
                 "/poster.jpg", "An overview", List.of());

         when(movieRepository.findByTmdbId(550L)).thenReturn(Optional.empty());
         when(tmdbClient.getMovieById(550L)).thenReturn(detail);
         when(movieRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

         Movie result = movieService.getOrFetchMovie(550L);

         assertThat(result.getTitle()).isEqualTo("Fight Club");
         assertThat(result.getReleaseYear()).isEqualTo(1999);
         verify(movieRepository).save(any(Movie.class));
    }

    @Test
    void listMovies_delegatesToRepository() {
        Pageable pageable = PageRequest.of(0, 20);
        Page<Movie> page = new PageImpl<>(List.of());
        when(movieRepository.findAll(pageable)).thenReturn(page);

        Page<Movie> result = movieService.listMovies(pageable);

        assertThat(result).isEqualTo(page);
    }

}
