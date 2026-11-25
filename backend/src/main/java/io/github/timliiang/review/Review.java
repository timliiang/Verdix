package io.github.timliiang.review;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
// One review per member per film. The service checks first so the user gets a clear 409; the
// constraint is the guarantee, catching two requests that race past that check (also a 409, via
// GlobalExceptionHandler's DataIntegrityViolationException handler).
@Table(name = "reviews",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_reviews_user_movie", columnNames = {"userId", "movieId"}))
@Data
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private Long movieId;

    @Column(nullable = false)
    private int rating;

    @Column(columnDefinition = "TEXT")
    private String reviewText;

    // Optional: null when the member didn't say when they watched it.
    private LocalDate watchedDate;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

}
