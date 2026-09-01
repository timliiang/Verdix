package io.github.timliiang.movie;

import io.github.timliiang.movie.tmdb.TmdbSearchResponse;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@AllArgsConstructor
@RequestMapping("/api/movies")
public class MovieController {

    private final MovieService movieService;

    @GetMapping("/search")
    public ResponseEntity<TmdbSearchResponse> searchTmdb (
            @RequestParam String query,
            @RequestParam(defaultValue = "1") int page) {
        return ResponseEntity.ok(movieService.searchTmdb(query, page));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Movie> getMovieDetails(
            @PathVariable Long id) {
        return ResponseEntity.ok(movieService.getOrFetchMovie(id));
    }

    @GetMapping()
    public ResponseEntity<Page<Movie>> listAllMovies(
            @PageableDefault(size = 20, sort="title") Pageable pageable) {
        return ResponseEntity.ok(movieService.listMovies(pageable));
    }

}
