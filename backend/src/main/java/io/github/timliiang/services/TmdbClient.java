package io.github.timliiang.services;

import io.github.timliiang.dto.TmdbMovieDetail;
import io.github.timliiang.dto.TmdbSearchResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

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
                .body(TmdbMovieDetail.class);
    }

}
