package io.github.timliiang.movie.detail;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

// A film's Verdix rating, from its reviews' 1-10 scores.
//
// The headline is the median, not the mean: the mean moves with every rating, so a handful of 1s
// ("review bombing") drags an 8.5 film into the 6s; the median moves only when over half the
// ratings do. The cost is coarseness: medians of whole numbers land on whole or half steps (8, 8.5),
// so the distribution is returned too, letting the page show the spread behind the number.
public record RatingSummary(
        int reviewCount,
        // Null when there are no reviews: "no rating yet", not a score of 0.
        Double median,
        // distribution.get(i) = how many reviews gave a score of i + 1; always 10 entries.
        List<Integer> distribution
) {
    public static final int MIN_SCORE = 1;
    public static final int MAX_SCORE = 10;

    public static RatingSummary empty() {
        return new RatingSummary(0, null, Collections.nCopies(MAX_SCORE, 0));
    }

    public static RatingSummary of(List<Integer> ratings) {
        if (ratings == null || ratings.isEmpty()) return empty();

        Integer[] counts = new Integer[MAX_SCORE];
        Arrays.fill(counts, 0);
        List<Integer> sorted = new ArrayList<>(ratings.size());
        for (Integer r : ratings) {
            // The database enforces 1-10 through ReviewCreateRequest, but a stray value must not
            // crash the page or skew the median.
            if (r == null || r < MIN_SCORE || r > MAX_SCORE) continue;
            sorted.add(r);
            counts[r - 1]++;
        }
        if (sorted.isEmpty()) return empty();
        Collections.sort(sorted);

        // Odd count: the middle value. Even: the mean of the two middle values (so 7 and 8 -> 7.5).
        int n = sorted.size();
        double median = n % 2 == 1
                ? sorted.get(n / 2)
                : (sorted.get(n / 2 - 1) + sorted.get(n / 2)) / 2.0;

        return new RatingSummary(n, median, List.of(counts));
    }
}
