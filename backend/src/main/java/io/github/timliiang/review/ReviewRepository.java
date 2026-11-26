package io.github.timliiang.review;

import io.github.timliiang.review.dto.MovieReviewResponse;
import io.github.timliiang.review.dto.MyReviewResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    Page<Review> findByUserId(Long userId, Pageable pageable);
    Page<Review> findByMovieId(Long movieId, Pageable pageable);
    boolean existsByUserIdAndMovieId(Long userId, Long movieId);
    Optional<Review> findByUserIdAndMovieId(Long userId, Long movieId);

    // Just the scores, for the film's rating summary: one small column instead of whole entities.
    @Query("select r.rating from Review r where r.movieId = :movieId")
    List<Integer> findRatingsByMovieId(Long movieId);

    // Review rows joined to their author, projected into the public DTO in the query itself (a JPQL
    // "constructor expression"), so no entity is loaded and nothing private leaves the database.
    // Review stores userId as a plain column rather than a @ManyToOne, hence the explicit join on.
    // The count query is given separately: Spring cannot derive a count from a constructor select.
    @Query(value = """
            select new io.github.timliiang.review.dto.MovieReviewResponse(
                r.id, u.username, u.imageUrl, r.rating, r.reviewText, r.watchedDate, r.createdAt)
            from Review r join User u on u.id = r.userId
            where r.movieId = :movieId""",
            countQuery = "select count(r) from Review r where r.movieId = :movieId")
    Page<MovieReviewResponse> findPublicByMovieId(Long movieId, Pageable pageable);

    // One member's reviews joined to their films, for "Your reviews". The order comes from the
    // Pageable (MyReviewSort), which may name either alias: r for the review, m for the film.
    @Query(value = """
            select new io.github.timliiang.review.dto.MyReviewResponse(
                r.id, m.tmdbId, m.title, m.releaseYear, m.posterPath,
                r.rating, r.reviewText, r.watchedDate, r.createdAt)
            from Review r join Movie m on m.id = r.movieId
            where r.userId = :userId""",
            countQuery = "select count(r) from Review r where r.userId = :userId")
    Page<MyReviewResponse> findOwnWithFilm(Long userId, Pageable pageable);
}
