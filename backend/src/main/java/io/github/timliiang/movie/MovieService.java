package io.github.timliiang.movie;

import io.github.timliiang.movie.tmdb.TmdbClient;
import io.github.timliiang.movie.tmdb.TmdbGenre;
import io.github.timliiang.movie.tmdb.TmdbMovieDetail;
import io.github.timliiang.movie.tmdb.TmdbSearchResponse;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

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

    // Read-only: the film page uses this to find Verdix's own data for a film. Unlike
    // getOrFetchMovie it never inserts, so a film enters the movies table only through a review.
    @Transactional(readOnly = true)
    public Optional<Movie> findStored(Long tmdbId) {
        return movieRepository.findByTmdbId(tmdbId);
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
