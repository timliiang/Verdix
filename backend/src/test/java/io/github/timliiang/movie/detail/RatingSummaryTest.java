package io.github.timliiang.movie.detail;

import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class RatingSummaryTest {

    @Test
    void noReviews_hasNoMedian() {
        RatingSummary s = RatingSummary.of(List.of());

        assertThat(s.reviewCount()).isZero();
        assertThat(s.median()).isNull();
        assertThat(s.distribution()).hasSize(10).containsOnly(0);
    }

    @Test
    void oddCount_takesTheMiddleScore() {
        assertThat(RatingSummary.of(List.of(9, 2, 7)).median()).isEqualTo(7.0);
    }

    @Test
    void evenCount_averagesTheTwoMiddleScores() {
        assertThat(RatingSummary.of(List.of(8, 7, 10, 1)).median()).isEqualTo(7.5);
    }

    // The reason for the median: a few 1s do not drag a well-liked film down (the mean here is 6.4).
    @Test
    void outliers_barelyMoveTheMedian() {
        assertThat(RatingSummary.of(List.of(9, 9, 8, 9, 8, 1, 1)).median()).isEqualTo(8.0);
    }

    @Test
    void distribution_countsEachScore() {
        RatingSummary s = RatingSummary.of(List.of(10, 10, 3));

        assertThat(s.distribution()).containsExactly(0, 0, 1, 0, 0, 0, 0, 0, 0, 2);
        assertThat(s.reviewCount()).isEqualTo(3);
    }

    @Test
    void outOfRangeScores_areIgnored() {
        RatingSummary s = RatingSummary.of(Arrays.asList(0, 11, null, 6));

        assertThat(s.reviewCount()).isEqualTo(1);
        assertThat(s.median()).isEqualTo(6.0);
    }
}
