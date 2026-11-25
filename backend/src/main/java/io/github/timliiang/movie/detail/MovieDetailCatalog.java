package io.github.timliiang.movie.detail;

import io.github.timliiang.common.config.CacheConfig;
import io.github.timliiang.movie.catalog.CatalogGenre;
import io.github.timliiang.movie.catalog.CatalogMovie;
import io.github.timliiang.movie.detail.MovieDetail.*;
import io.github.timliiang.movie.tmdb.TmdbClient;
import io.github.timliiang.movie.tmdb.TmdbListMovie;
import io.github.timliiang.movie.tmdb.TmdbMovieFull;
import lombok.AllArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Stream;

// The TMDB half of the film page: one TMDB request, trimmed to what the page shows, cached.
//
// Its own bean (not a method on MovieDetailService) because @Cacheable works through the proxy
// Spring wraps around a bean: a call from inside the same class skips the proxy and the cache.
//
// Cached per film AND region. TMDB answers with watch providers for ~130 countries; keeping all of
// them would cost ~100 KB per film for data almost nobody reads, so only the viewer's region is
// kept. Nothing here touches our database: viewing a film never stores it.
@Component
@AllArgsConstructor
public class MovieDetailCatalog {

    static final String FALLBACK_REGION = "US";
    static final int MAX_VIDEOS = 6;
    static final int MAX_POSTERS = 16;
    static final int MAX_BACKDROPS = 16;
    static final int MAX_CAST = 18;
    static final int MAX_SIMILAR = 12;
    // Below this many recommendations, TMDB's "similar" list (genre/keyword overlap) fills the rail.
    static final int MIN_RECOMMENDATIONS = 6;
    static final int MAX_PRODUCERS = 4;

    // The crew roles the page shows, in page order, and the TMDB jobs that count as each. TMDB
    // credits writers under many jobs; they merge into one "writer" role with the job as detail.
    record RoleJobs(String role, List<String> jobs) {}

    static final List<RoleJobs> CREW_ROLES = List.of(
            new RoleJobs("director", List.of("Director")),
            new RoleJobs("writer", List.of("Screenplay", "Writer", "Story", "Novel", "Author", "Book", "Characters", "Original Story")),
            new RoleJobs("producer", List.of("Producer")),
            new RoleJobs("composer", List.of("Original Music Composer", "Music")),
            new RoleJobs("cinematographer", List.of("Director of Photography")),
            new RoleJobs("editor", List.of("Editor")));

    private final TmdbClient tmdbClient;

    @Cacheable(cacheNames = CacheConfig.MOVIE_DETAIL, key = "#tmdbId + ':' + #region")
    public MovieDetail load(Long tmdbId, String region) {
        return toDetail(tmdbClient.getMovieFull(tmdbId), region);
    }

    // Package-private and static for tests: the mapping is the logic worth pinning down.
    static MovieDetail toDetail(TmdbMovieFull m, String region) {
        return new MovieDetail(
                m.id(),
                m.title(),
                blankToNull(m.tagline()),
                blankToNull(m.overview()),
                blankToNull(m.releaseDate()),
                m.runtime() == null || m.runtime() <= 0 ? null : m.runtime(),
                certification(m.releaseDates(), region),
                m.originalLanguage(),
                m.status(),
                m.posterPath(),
                m.backdropPath(),
                list(m.genres()).stream().map(g -> new CatalogGenre(g.id(), g.name())).toList(),
                videos(m.videos()),
                artwork(m.images()),
                cast(m.credits()),
                crew(m.credits()),
                similar(m),
                watch(m.watchProviders(), region),
                null);
    }

    // YouTube only (the page embeds YouTube). The lead is the newest official trailer, which is
    // usually the final theatrical cut for new films; teasers follow trailers.
    static List<Video> videos(TmdbMovieFull.Videos videos) {
        if (videos == null) return List.of();
        Comparator<TmdbMovieFull.Video> order = Comparator
                .comparing((TmdbMovieFull.Video v) -> !"Trailer".equals(v.type()))
                .thenComparing(v -> !v.official())
                .thenComparing(TmdbMovieFull.Video::publishedAt, Comparator.nullsLast(Comparator.reverseOrder()));
        return list(videos.results()).stream()
                .filter(v -> "YouTube".equals(v.site()) && v.key() != null)
                .filter(v -> "Trailer".equals(v.type()) || "Teaser".equals(v.type()))
                .sorted(order)
                .limit(MAX_VIDEOS)
                .map(v -> new Video(v.key(), v.name(), v.type()))
                .toList();
    }

    // Best voted first. Backdrops without text come first: they work as a clean page backdrop and
    // read as artwork rather than marketing.
    static Artwork artwork(TmdbMovieFull.Images images) {
        if (images == null) return new Artwork(List.of(), List.of());
        Comparator<TmdbMovieFull.Image> byVotes = Comparator
                .comparingDouble(TmdbMovieFull.Image::voteAverage).reversed()
                .thenComparing(Comparator.comparingInt(TmdbMovieFull.Image::voteCount).reversed());
        List<Image> posters = list(images.posters()).stream()
                .sorted(byVotes)
                .limit(MAX_POSTERS)
                .map(MovieDetailCatalog::image)
                .toList();
        List<Image> backdrops = list(images.backdrops()).stream()
                .sorted(Comparator.comparing((TmdbMovieFull.Image i) -> i.language() != null).thenComparing(byVotes))
                .limit(MAX_BACKDROPS)
                .map(MovieDetailCatalog::image)
                .toList();
        return new Artwork(posters, backdrops);
    }

    static List<CastCredit> cast(TmdbMovieFull.Credits credits) {
        if (credits == null) return List.of();
        return list(credits.cast()).stream()
                .sorted(Comparator.comparingInt(TmdbMovieFull.CastMember::order))
                .limit(MAX_CAST)
                .map(c -> new CastCredit(c.id(), c.name(), blankToNull(c.character()), c.profilePath()))
                .toList();
    }

    // One entry per role, each person once per role. A person credited for "Screenplay" and
    // "Story" becomes one writer with detail "Screenplay, Story".
    static List<CrewRole> crew(TmdbMovieFull.Credits credits) {
        if (credits == null) return List.of();
        List<CrewRole> roles = new ArrayList<>();
        for (RoleJobs roleJobs : CREW_ROLES) {
            String role = roleJobs.role();
            List<String> jobs = roleJobs.jobs();
            Map<Long, List<TmdbMovieFull.CrewMember>> byPerson = new LinkedHashMap<>();
            list(credits.crew()).stream()
                    .filter(c -> jobs.contains(c.job()))
                    // Writers in the order their job appears above (screenplay before novel).
                    .sorted(Comparator.comparingInt(c -> jobs.indexOf(c.job())))
                    .forEach(c -> byPerson.computeIfAbsent(c.id(), id -> new ArrayList<>()).add(c));
            Stream<CrewCredit> people = byPerson.values().stream().map(jobsHeld -> {
                TmdbMovieFull.CrewMember first = jobsHeld.getFirst();
                String detail = "writer".equals(role)
                        ? String.join(", ", jobsHeld.stream().map(TmdbMovieFull.CrewMember::job).distinct().toList())
                        : null;
                return new CrewCredit(first.id(), first.name(), first.profilePath(), detail);
            });
            List<CrewCredit> list = ("producer".equals(role) ? people.limit(MAX_PRODUCERS) : people).toList();
            if (!list.isEmpty()) roles.add(new CrewRole(role, list));
        }
        return roles;
    }

    // TMDB's recommendations (what people who liked this also liked) read better than "similar"
    // (shared genres and keywords), so they lead; similar only tops up a short list. Films with no
    // poster are skipped since the rail is all posters.
    static List<CatalogMovie> similar(TmdbMovieFull m) {
        List<TmdbListMovie> recs = m.recommendations() == null ? List.of() : list(m.recommendations().results());
        List<TmdbListMovie> pool = new ArrayList<>(recs);
        if (recs.stream().filter(r -> r.posterPath() != null).count() < MIN_RECOMMENDATIONS && m.similar() != null) {
            pool.addAll(list(m.similar().results()));
        }
        Set<Long> seen = new HashSet<>();
        return pool.stream()
                .filter(r -> r.posterPath() != null && !Objects.equals(r.id(), m.id()) && seen.add(r.id()))
                .limit(MAX_SIMILAR)
                .map(CatalogMovie::from)
                .toList();
    }

    // The viewer's own board first, then the US, since many countries have no rating on TMDB.
    // Within a country, the theatrical release's rating wins over premieres and home video.
    static Certification certification(TmdbMovieFull.ReleaseDates releaseDates, String region) {
        if (releaseDates == null) return null;
        for (String country : region.equals(FALLBACK_REGION) ? List.of(region) : List.of(region, FALLBACK_REGION)) {
            Optional<String> rating = list(releaseDates.results()).stream()
                    .filter(c -> country.equals(c.country()))
                    .flatMap(c -> list(c.releaseDates()).stream())
                    .filter(d -> d.certification() != null && !d.certification().isBlank())
                    .min(Comparator.comparingInt(d -> d.type() == 3 ? 0 : d.type() == 2 ? 1 : 2))
                    .map(TmdbMovieFull.ReleaseDate::certification);
            if (rating.isPresent()) return new Certification(rating.get().trim(), country);
        }
        return null;
    }

    // No fallback region here: providers in another country are not watchable by this viewer.
    static WatchOptions watch(TmdbMovieFull.WatchProviders providers, String region) {
        if (providers == null || providers.results() == null) return null;
        TmdbMovieFull.RegionProviders r = providers.results().get(region);
        if (r == null) return null;
        List<Provider> free = providers(Stream.concat(list(r.free()).stream(), list(r.ads()).stream()).toList());
        WatchOptions options = new WatchOptions(region, r.link(),
                providers(r.flatrate()), free, providers(r.rent()), providers(r.buy()));
        boolean none = options.stream().isEmpty() && options.free().isEmpty()
                && options.rent().isEmpty() && options.buy().isEmpty();
        return none ? null : options;
    }

    private static List<Provider> providers(List<TmdbMovieFull.Provider> providers) {
        Set<Long> seen = new HashSet<>();
        return list(providers).stream()
                .sorted(Comparator.comparingInt(TmdbMovieFull.Provider::displayPriority))
                .filter(p -> seen.add(p.id()))
                .map(p -> new Provider(p.id(), p.name(), p.logoPath()))
                .toList();
    }

    private static Image image(TmdbMovieFull.Image i) {
        return new Image(i.filePath(), i.width(), i.height());
    }

    private static <T> List<T> list(List<T> list) {
        return list == null ? List.of() : list;
    }

    private static String blankToNull(String s) {
        return s == null || s.isBlank() ? null : s;
    }
}
