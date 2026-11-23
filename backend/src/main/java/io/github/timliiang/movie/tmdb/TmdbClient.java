package io.github.timliiang.movie.tmdb;

import io.github.timliiang.common.exception.ResourceNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.function.Supplier;

@Slf4j
@Service
public class TmdbClient {

    private final RestClient restClient;

    public TmdbClient(RestClient.Builder builder,
                      @Value("${tmdb.base.url}") String baseUrl,
                      @Value("${tmdb.read.access.token}") String accessToken) {
        this.restClient = builder
                .baseUrl(baseUrl)
                .defaultHeader("Authorization", "Bearer " + accessToken)
                .build();
    }

    public TmdbSearchResponse searchMovies(String query, int page) {
        return restClient.get()
                .uri("/search/movie?query={q}&page={p}", query, page)
                .retrieve()
                .body(TmdbSearchResponse.class);
    }

    public TmdbMovieDetail getMovieById(Long tmdbId) {
        return restClient.get()
                .uri("/movie/{id}", tmdbId)
                .retrieve()
                .onStatus(HttpStatusCode::is4xxClientError, (request, response) -> {
                    if (response.getStatusCode().equals(HttpStatus.NOT_FOUND)) {
                        throw new ResourceNotFoundException("TMDB id does not exist");
                    }
                    throw new RuntimeException("TMDB client error: " + response.getStatusCode());
                })
                .body(TmdbMovieDetail.class);
    }

    // /discover/movie is TMDB's general film query; popular, top rated, etc. are presets of it.
    // The caller builds the parameters (see CatalogService), so this stays a thin transport.
    public TmdbDiscoverResponse discover(MultiValueMap<String, String> params) {
        return upstream(() -> restClient.get()
                .uri(uri -> uri.path("/discover/movie").queryParams(params).build())
                .retrieve()
                .body(TmdbDiscoverResponse.class));
    }

    public List<TmdbGenre> getGenres() {
        TmdbGenreList list = upstream(() -> restClient.get()
                .uri("/genre/movie/list?language=en")
                .retrieve()
                .body(TmdbGenreList.class));
        return list == null || list.genres() == null ? List.of() : list.genres();
    }

    // RestClientException covers TMDB answering 4xx/5xx and TMDB not answering at all (timeout,
    // DNS, refused). Either way it is TMDB's failure, not ours or the caller's, so 502 Bad Gateway
    // rather than the 500 catch-all. The cause is logged; the client gets a plain message.
    private <T> T upstream(Supplier<T> request) {
        try {
            return request.get();
        } catch (RestClientException ex) {
            log.warn("TMDB request failed: {}", ex.getMessage());
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "The film catalogue is unavailable right now", ex);
        }
    }
}
