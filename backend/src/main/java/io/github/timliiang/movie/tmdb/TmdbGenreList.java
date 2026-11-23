package io.github.timliiang.movie.tmdb;

import java.util.List;

// GET /genre/movie/list wraps the genres in an object: { "genres": [ { "id": 28, "name": "Action" } ] }
public record TmdbGenreList(List<TmdbGenre> genres) {}
