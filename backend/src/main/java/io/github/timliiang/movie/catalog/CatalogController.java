package io.github.timliiang.movie.catalog;

import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

// Public (see SecurityConfig): browsing /movies needs no account. Shares /api/movies with
// MovieController; Spring prefers literal paths like /discover over its /{id} pattern.
@RestController
@AllArgsConstructor
@RequestMapping("/api/movies")
public class CatalogController {

    private final CatalogService catalogService;

    // GET /api/movies/discover?list=top_rated&sort=title_asc&genres=18,53&decade=2010&page=2
    // Every parameter is optional. genres is comma-separated, which Spring splits into the list.
    @GetMapping("/discover")
    public ResponseEntity<CatalogPage> discover(
            @RequestParam(defaultValue = "popular") CatalogList list,
            @RequestParam(defaultValue = "list") CatalogSort sort,
            @RequestParam(required = false) List<Long> genres,
            @RequestParam(required = false) Integer decade,
            @RequestParam(defaultValue = "1") int page) {
        return ResponseEntity.ok(catalogService.discover(new CatalogQuery(list, sort, genres, decade, page)));
    }

    // GET /api/movies/search?query=alien&page=2. Same page shape as /discover, so the frontend
    // renders results with the same card. A blank query answers an empty page (no TMDB call).
    @GetMapping("/search")
    public ResponseEntity<CatalogPage> search(
            @RequestParam(defaultValue = "") String query,
            @RequestParam(defaultValue = "1") int page) {
        return ResponseEntity.ok(catalogService.search(new SearchQuery(query, page)));
    }

    @GetMapping("/genres")
    public ResponseEntity<List<CatalogGenre>> genres() {
        return ResponseEntity.ok(catalogService.genres());
    }
}
