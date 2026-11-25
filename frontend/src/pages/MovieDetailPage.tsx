import "@fontsource-variable/geist"
import { useEffect, useRef, useState, type ReactNode } from "react"
import { Link, useParams } from "react-router-dom"
import { Clapperboard, Loader2, RotateCw } from "lucide-react"
import { HomeFooter, HomeNav } from "../components/home/HomeChrome"
import { useTheme } from "../components/home/useTheme"
import { buttonClass } from "../components/ui/buttonClass"
import { PosterCard } from "../components/catalog/PosterCard"
import { MovieHero } from "../components/movie/MovieHero"
import { MovieSkeleton } from "../components/movie/MovieSkeleton"
import { TrailerPlayer } from "../components/movie/TrailerPlayer"
import { CastRail, CrewList } from "../components/movie/People"
import { ArtworkGallery } from "../components/movie/ArtworkGallery"
import { MovieFacts, RatingPanel, WatchPanel } from "../components/movie/Sidebar"
import { ReviewsSection } from "../components/movie/ReviewsSection"
import { ReviewAction, ReviewEditorLayer } from "../components/movie/ReviewEditor"
import { useReviewEditor } from "../components/movie/useReviewEditor"
import { Section } from "../components/movie/Section"
import { useMovieDetail } from "../components/movie/useMovieDetail"
import { releaseYear } from "../lib/format"
import type { MovieDetail } from "../lib/movieTypes"
import NotFoundPage from "./NotFoundPage"

// /movies/:tmdbId, public. Everything comes from GET /api/movies/{tmdbId}/details, which reads
// TMDB (cached) and Verdix's own reviews without storing the film: a film enters the database only
// when someone reviews it. Same frame as /movies: themed root, ambient glow, HomeNav, HomeFooter.
export default function MovieDetailPage() {
  const { tmdbId: param } = useParams()
  const tmdbId = Number(param)
  // Only positive whole numbers are TMDB ids; anything else is a bad URL, answered without a request.
  if (!param || !/^\d+$/.test(param) || tmdbId <= 0) return <NotFoundPage />
  return <MovieDetailView key={tmdbId} tmdbId={tmdbId} />
}

// Keyed by film in the parent, so opening a similar film starts fresh: trailer stopped, artwork
// tab reset, scrolled to the top.
function MovieDetailView({ tmdbId }: { tmdbId: number }) {
  const { theme, toggleTheme } = useTheme()
  const { query, region, error } = useMovieDetail(tmdbId)
  // Data wins over error: if a background refetch fails (say, after a review was posted), the film
  // already on screen stays; the error screens below are only for "nothing to show yet".
  const movie = query.data ?? null

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [tmdbId])

  useEffect(() => {
    if (!movie) return
    const year = releaseYear(movie.releaseDate)
    document.title = `${movie.title}${year ? ` (${year})` : ""} | Verdix`
    return () => {
      document.title = "Verdix"
    }
  }, [movie])

  if (!movie && error?.kind === "not-found") return <NotFoundPage />

  return (
    <div data-theme={theme} className="flex min-h-[100dvh] flex-col font-display text-ink antialiased">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-40 top-0 size-96 rounded-full bg-action/10 blur-[120px]" />
        <div className="absolute -right-40 top-1/2 size-96 rounded-full bg-action/5 blur-[140px]" />
      </div>

      <HomeNav theme={theme} onToggleTheme={toggleTheme} />

      <main id="main" className="mx-auto w-full max-w-page flex-1 px-4 pb-section pt-6 sm:px-6 lg:px-12">
        <nav aria-label="Breadcrumb" className="mb-4">
          <Link to="/movies" className={buttonClass("text-link", "-ml-1 text-slate hover:text-ink")}>
            Films
          </Link>
          {movie && (
            <>
              <span aria-hidden="true" className="px-1 text-slate">
                /
              </span>
              <span aria-current="page" className="text-link-sm font-normal text-ink">
                {movie.title}
              </span>
            </>
          )}
        </nav>

        {!movie && query.isPending && (
          <>
            <p className="sr-only" role="status">
              Loading film…
            </p>
            <MovieSkeleton />
          </>
        )}
        {/* Reached only after Query's automatic retries (2, with backoff) have also failed. */}
        {!movie && error && (
          <StatusPanel
            title="This film could not be loaded"
            body={
              error.kind === "network"
                ? error.message
                : "The film catalogue may be busy. Wait a moment, then try again."
            }
            action={
              <button
                type="button"
                onClick={() => query.refetch()}
                disabled={query.isFetching}
                className={buttonClass("primary", "disabled:cursor-wait")}
              >
                {query.isFetching ? (
                  <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                ) : (
                  <RotateCw className="size-4" aria-hidden="true" />
                )}
                {query.isFetching ? "Retrying…" : "Try Again"}
              </button>
            }
          />
        )}
        {movie && <MovieContent movie={movie} region={region} />}

        {/* TMDB's terms require this notice wherever its data is shown. */}
        <p className="mt-section max-w-[60ch] text-meta text-ash">
          Film data and images from{" "}
          <a href="https://www.themoviedb.org/" target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-ink" translate="no">
            TMDB
          </a>
          . This product uses the TMDB API but is not endorsed or certified by TMDB.
        </p>
      </main>

      <HomeFooter />
    </div>
  )
}

function MovieContent({ movie, region }: { movie: MovieDetail; region: string }) {
  const [trailerPlaying, setTrailerPlaying] = useState(false)
  const trailerRef = useRef<HTMLDivElement>(null)
  // Shared by the hero's review button and the member's own card in Reviews; see useReviewEditor.
  const reviewEditor = useReviewEditor(movie.tmdbId)

  // The hero's Play Trailer scrolls the player into view and starts it, rather than opening a
  // modal: the player stays in the page where the viewer can pause, scroll and come back.
  const playTrailer = () => {
    setTrailerPlaying(true)
    trailerRef.current?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" })
  }

  const hasArtwork = movie.artwork.posters.length + movie.artwork.backdrops.length > 0

  return (
    <>
      <MovieHero
        movie={movie}
        onPlayTrailer={playTrailer}
        // Solid only when there is no trailer button to be the hero's main action.
        reviewAction={<ReviewAction editor={reviewEditor} primary={movie.videos.length === 0} />}
      />
      <ReviewEditorLayer editor={reviewEditor} tmdbId={movie.tmdbId} title={movie.title} releaseDate={movie.releaseDate} />

      {/* Two columns from lg: the film itself on the left, the score and where-to-watch on the
          right (sticky, so they stay in reach while reading). One column below lg, sidebar first
          after the overview so the score and providers are not buried under the cast. */}
      <div className="mt-12 grid grid-cols-1 gap-x-12 gap-y-14 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex min-w-0 flex-col gap-14">
          <Section id="overview" title="Overview">
            {movie.overview ? (
              <p className="max-w-[68ch] text-pretty text-body text-graphite">{movie.overview}</p>
            ) : (
              <p className="text-body text-slate">TMDB has no synopsis for this film yet.</p>
            )}
            {movie.genres.length > 0 && (
              <ul className="mt-5 flex flex-wrap gap-2" aria-label="Genres">
                {movie.genres.map((g) => (
                  <li key={g.id}>
                    <Link
                      to={`/movies?genres=${g.id}`}
                      className="inline-flex rounded-full border border-hairline-soft bg-hairline px-3 py-1 text-meta text-ink-soft transition-colors hover:border-highlight/50 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-highlight"
                    >
                      {g.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <aside aria-label="Score and availability" className="flex flex-col gap-6 lg:hidden">
            <SidebarPanels movie={movie} region={region} />
          </aside>

          {movie.videos.length > 0 && (
            <Section id="trailer" title={movie.videos.length > 1 ? "Trailers" : "Trailer"}>
              <div ref={trailerRef}>
                <TrailerPlayer title={movie.title} videos={movie.videos} playing={trailerPlaying} onPlay={() => setTrailerPlaying(true)} />
              </div>
            </Section>
          )}

          {movie.cast.length > 0 && (
            <Section id="cast" title="Cast">
              <CastRail cast={movie.cast} />
            </Section>
          )}

          {movie.crew.length > 0 && (
            <Section id="crew" title="Crew">
              <CrewList crew={movie.crew} />
            </Section>
          )}

          {hasArtwork && (
            <Section id="artwork" title="Artwork">
              <ArtworkGallery title={movie.title} posters={movie.artwork.posters} backdrops={movie.artwork.backdrops} />
            </Section>
          )}

          <ReviewsSection tmdbId={movie.tmdbId} title={movie.title} reviewCount={movie.rating.reviewCount} editor={reviewEditor} />
        </div>

        <aside aria-label="Score and availability" className="hidden lg:block">
          {/* Sticky only on tall screens: the panels are ~860px, and on a shorter viewport a pinned
              column would hold its bottom panel off-screen while the page scrolls. */}
          <div className="flex flex-col gap-6 [@media(min-height:64rem)]:sticky [@media(min-height:64rem)]:top-24">
            <SidebarPanels movie={movie} region={region} />
          </div>
        </aside>
      </div>

      {movie.similar.length > 0 && (
        <Section id="similar" title="More like this" className="mt-section">
          <ul className="no-scrollbar -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 pt-1 sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-6 lg:gap-6 lg:overflow-visible lg:px-0">
            {movie.similar.map((m) => (
              <li key={m.tmdbId} className="w-[42vw] max-w-[12rem] shrink-0 snap-start lg:w-auto lg:max-w-none">
                <PosterCard movie={m} />
              </li>
            ))}
          </ul>
        </Section>
      )}
    </>
  )
}

function SidebarPanels({ movie, region }: { movie: MovieDetail; region: string }) {
  return (
    <>
      <RatingPanel rating={movie.rating} title={movie.title} />
      <WatchPanel watch={movie.watch} region={region} />
      <MovieFacts movie={movie} region={region} />
    </>
  )
}

function StatusPanel({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-hairline-soft px-6 py-16 text-center sm:py-24">
      <Clapperboard className="size-10 text-slate" strokeWidth={1.5} aria-hidden="true" />
      <div className="flex flex-col gap-2">
        <h1 className="text-heading-sm font-semibold text-ink">{title}</h1>
        <p className="max-w-[40ch] text-body text-graphite">{body}</p>
      </div>
      {action}
    </div>
  )
}
