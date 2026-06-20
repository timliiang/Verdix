package io.github.timliiang.services;

import io.github.timliiang.dto.TmdbGenre;
import io.github.timliiang.dto.TmdbMovieDetail;
import io.github.timliiang.dto.TmdbSearchResponse;
import io.github.timliiang.entities.Movie;
import io.github.timliiang.repositories.MovieRepository;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@AllArgsConstructor
public class MovieService {

    private final MovieRepository movieRepository;
    private final TmdbClient tmdbClient;

    public TmdbSearchResponse searchTmdb(String query, int page) {
        return tmdbClient.searchMovies(query, page);
    }

    public Movie getOrFetchMovie(Long tmdbId) {
        return movieRepository.findByTmdbId(tmdbId)
                .orElseGet(() -> {
                    TmdbMovieDetail detail = tmdbClient.getMovieById(tmdbId);
                    return movieRepository.save(mapToEntity(detail));
                });
    }

    public Page<Movie> listMovies(Pageable pageable) {
        return movieRepository.findAll(pageable);
    }

    private Movie mapToEntity(TmdbMovieDetail detail) {
        Movie movie = new Movie();
        movie.setTmdbId(detail.id());
        movie.setTitle(detail.title());
        movie.setPosterPath(detail.posterPath());
        movie.setOverview(detail.overview());
        movie.setReleaseYear(parseYear(detail.releaseDate()));
        movie.setGenres(detail.genres().stream()
                .map(TmdbGenre::name)
                .toList());
        return movie;
    }

    private Integer parseYear(String releaseDate) {
        if (releaseDate == null || releaseDate.isBlank()) return null;
        return Integer.parseInt(releaseDate.substring(0, 4));
    }
}
