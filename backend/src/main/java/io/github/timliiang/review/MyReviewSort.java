package io.github.timliiang.review;

import io.github.timliiang.common.exception.BadRequestException;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.JpaSort;

import java.util.Arrays;
import java.util.stream.Collectors;

// The orders "Your reviews" offers, as a whitelist. The client sends a public name (?sort=title);
// each maps to an exact ORDER BY. Not Spring's generic ?sort=property,dir: that lets a client sort
// on any entity field, including ones never meant to be offered, and couples the URL to the schema.
//
// JpaSort.unsafe because the orders name query aliases (r = Review, m = Movie) and an expression;
// "unsafe" only means Spring doesn't check them against the entity. They are constants here, never
// client input, so nothing from the request reaches the query text.
//
// Every order ends in r.id: paging by offset needs a total order. Without a final unique key, two
// reviews with the same score could swap between page 1 and page 2, so one repeats and one is lost.
public enum MyReviewSort {

    RATING_DESC("rating-desc", JpaSort.unsafe(Sort.Direction.DESC, "r.rating")
            .andUnsafe(Sort.Direction.DESC, "r.createdAt", "r.id")),
    RATING_ASC("rating-asc", JpaSort.unsafe(Sort.Direction.ASC, "r.rating")
            .andUnsafe(Sort.Direction.DESC, "r.createdAt", "r.id")),
    NEWEST("newest", JpaSort.unsafe(Sort.Direction.DESC, "r.createdAt", "r.id")),
    OLDEST("oldest", JpaSort.unsafe(Sort.Direction.ASC, "r.createdAt", "r.id")),
    // Undated reviews last, spelled out with NULLS LAST: databases disagree on where NULL sorts by
    // default (Postgres puts it first in DESC, H2 last), so leaving it implicit would make dev and
    // tests differ. Plain property names here: Spring prefixes the query's main alias (r.) itself.
    WATCHED("watched", Sort.by(
            Sort.Order.desc("watchedDate").nullsLast(),
            Sort.Order.desc("createdAt"),
            Sort.Order.desc("id"))),
    TITLE("title", JpaSort.unsafe(Sort.Direction.ASC, "lower(m.title)")
            .andUnsafe(Sort.Direction.DESC, "r.id"));

    public static final MyReviewSort DEFAULT = RATING_DESC;

    private final String param;
    private final Sort sort;

    MyReviewSort(String param, Sort sort) {
        this.param = param;
        this.sort = sort;
    }

    public Sort sort() {
        return sort;
    }

    public static MyReviewSort fromParam(String value) {
        return Arrays.stream(values())
                .filter(s -> s.param.equals(value))
                .findFirst()
                .orElseThrow(() -> new BadRequestException("Unknown sort. Use one of: " +
                        Arrays.stream(values()).map(s -> s.param).collect(Collectors.joining(", "))));
    }
}
