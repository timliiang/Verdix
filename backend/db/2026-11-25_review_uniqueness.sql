-- One-off migration for an existing dev database (Postgres), for the change that made reviews
-- one-per-member-per-film and the watched date optional.
--
-- Why by hand: spring.jpa.hibernate.ddl-auto=update only ever ADDS schema (tables, columns). It
-- never relaxes a column, so watched_date would stay NOT NULL and every date-less review would
-- fail. It does try to add the unique constraint, but if duplicate rows already exist that attempt
-- fails silently and the database is left unprotected. A fresh database needs none of this.
--
-- Run with:  docker exec -i moviereviewapp_db psql -U <POSTGRES_USER> -d <POSTGRES_DB> < backend/db/2026-11-25_review_uniqueness.sql

BEGIN;

-- 1. Watched date becomes optional.
ALTER TABLE reviews ALTER COLUMN watched_date DROP NOT NULL;

-- 2. Any member who reviewed the same film more than once? If this returns rows, the constraint
--    below fails and the whole transaction rolls back, changing nothing. Decide which to keep
--    first; to keep only each member's newest review per film, uncomment the DELETE.
SELECT user_id, movie_id, count(*) AS reviews
FROM reviews
GROUP BY user_id, movie_id
HAVING count(*) > 1;

-- DELETE FROM reviews r
-- USING reviews newer
-- WHERE r.user_id = newer.user_id
--   AND r.movie_id = newer.movie_id
--   AND (r.created_at, r.id) < (newer.created_at, newer.id);

-- 3. The guarantee. Same name as @UniqueConstraint on Review, so Hibernate sees it already exists.
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS uk_reviews_user_movie;
ALTER TABLE reviews ADD CONSTRAINT uk_reviews_user_movie UNIQUE (user_id, movie_id);

COMMIT;
