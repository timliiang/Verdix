package io.github.timliiang.common.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;

// @EnableCaching makes Spring wrap beans that use @Cacheable in a proxy: a call first looks up
// its arguments in the named cache and only runs the method on a miss. Caffeine holds the entries
// in this JVM's memory and expires them, so lists refresh. (A ConcurrentMap cache never expires;
// Redis would be the move once there is more than one backend instance sharing a cache.)
@Configuration
@EnableCaching
public class CacheConfig {

    public static final String CATALOG = "catalog";
    public static final String GENRES = "genres";

    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager manager = new CaffeineCacheManager();
        // TMDB recomputes popularity a few times a day, so 10 minutes is fresh enough and turns
        // many visitors into one upstream call per distinct query. The size cap bounds memory:
        // each entry is one page of 20 films, so 2,000 entries is a few MB at most.
        manager.registerCustomCache(CATALOG, Caffeine.newBuilder()
                .expireAfterWrite(Duration.ofMinutes(10))
                .maximumSize(2_000)
                .build());
        // TMDB's genre list practically never changes.
        manager.registerCustomCache(GENRES, Caffeine.newBuilder()
                .expireAfterWrite(Duration.ofHours(24))
                .build());
        return manager;
    }
}
