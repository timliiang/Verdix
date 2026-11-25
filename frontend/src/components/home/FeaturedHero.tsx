import { Link } from "react-router-dom"
import { motion, useReducedMotion } from "motion/react"
import { Clock, Flame, Loader2, RotateCw, Star } from "lucide-react"
import { buttonClass } from "../ui/buttonClass"
import { ScoreNumeral } from "../ui/ScoreNumeral"
import { cn } from "../../lib/utils"
import { formatRuntime, releaseYear } from "../../lib/format"
import { backdropSrcSet, backdropUrl } from "../../lib/tmdbImage"
import { parseApiError } from "../../api/apiError"
import { useFeaturedFilm } from "./useHomeFilms"

const ease = [0.16, 1, 0.3, 1] as const
const chip = "rounded-full bg-canvas/60 px-2.5 py-1 text-meta text-ink-soft ring-1 ring-inset ring-ink/10 backdrop-blur-sm"

// The same photo stage in every state (loading, error, film), at the same minimum height, so the
// page below never jumps when the film arrives.
const stage = "relative isolate flex min-h-[30rem] items-end overflow-hidden rounded-2xl border border-hairline-soft bg-scrim sm:min-h-[36rem]"

// The home hero: the most popular film in cinemas right now (TMDB's Now Playing #1), with its backdrop, synopsis and Verdix score.
// It follows the live list (useFeaturedFilm), so when TMDB's #1 changes, so does this.
export function FeaturedHero() {
  const reduce = useReducedMotion()
  const { nowPlaying, featured, details } = useFeaturedFilm()
  const film = details.data

  if (nowPlaying.isError || (featured && details.isError && !film)) {
    const failed = nowPlaying.isError ? nowPlaying : details
    return (
      <section data-surface="stage" aria-labelledby="home-hero" className={cn(stage, "items-center justify-center p-8 text-center")}>
        <div className="flex flex-col items-center gap-4">
          <h1 id="home-hero" className="text-heading-md font-bold text-ink">
            Films in cinemas could not be loaded
          </h1>
          <p className="max-w-[44ch] text-body text-graphite">
            {parseApiError(failed.error, { server: "The film catalogue is busy. Wait a moment, then try again." }).message}
          </p>
          <button
            type="button"
            onClick={() => failed.refetch()}
            disabled={failed.isFetching}
            className={buttonClass("primary", "disabled:cursor-wait")}
          >
            {failed.isFetching ? <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" /> : <RotateCw className="size-4" aria-hidden="true" />}
            {failed.isFetching ? "Retrying…" : "Try Again"}
          </button>
        </div>
      </section>
    )
  }

  // Waiting on the list, or on the first film's details.
  if (!film) {
    return (
      <section data-surface="stage" aria-busy="true" aria-label="Loading the top film in cinemas" className={stage}>
        <div aria-hidden="true" className="absolute inset-0 -z-10 animate-pulse bg-hairline motion-reduce:animate-none" />
        <div aria-hidden="true" className="flex w-full flex-col gap-5 px-6 pb-8 sm:px-10 sm:pb-10">
          <div className="flex gap-2">
            <div className="h-7 w-36 rounded-full bg-surface-cool" />
            <div className="h-7 w-16 rounded-full bg-surface-cool" />
          </div>
          <div className="h-12 w-2/3 max-w-lg rounded-lg bg-surface-cool" />
          <div className="h-4 w-full max-w-md rounded bg-surface-cool" />
          <div className="h-10 w-32 rounded-xl bg-surface-cool" />
        </div>
      </section>
    )
  }

  const year = releaseYear(film.releaseDate)
  const runtime = formatRuntime(film.runtime)
  const genre = film.genres[0]?.name
  const blurb = film.tagline ?? film.overview
  const { median, reviewCount } = film.rating

  return (
    <section data-surface="stage" aria-labelledby="home-hero" className={stage}>
      {film.backdropPath && (
        // Keyed by image: when the #1 film changes, the new backdrop settles in like the first did.
        <motion.img
          key={film.backdropPath}
          src={backdropUrl(film.backdropPath, 1280)}
          srcSet={backdropSrcSet(film.backdropPath)}
          sizes="(min-width: 1280px) 1232px, 100vw"
          alt=""
          width={1280}
          height={720}
          fetchPriority="high"
          className="absolute inset-0 -z-10 h-full w-full object-cover object-[50%_30%]"
          initial={reduce ? false : { scale: 1.08, opacity: 0.6 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.6, ease }}
        />
      )}
      {/* Legibility scrims, not decoration: a floor under the copy, and the side-light from "/".
          Phones hold the dark stop higher because the copy sits mid-frame there. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-t from-canvas from-40% via-canvas/75 via-65% to-canvas/20 sm:from-0% sm:via-canvas/50 sm:via-50% sm:to-canvas/10"
      />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-canvas/90 via-canvas/50 to-transparent" />

      <motion.div
        key={film.tmdbId}
        className="grid w-full grid-cols-1 gap-10 px-6 pb-8 pt-40 sm:px-10 sm:pb-10 sm:pt-56 lg:grid-cols-[1fr_auto] lg:items-end"
        initial={reduce ? false : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.3, ease }}
      >
        <div className="flex max-w-2xl flex-col gap-5">
          <ul className="flex flex-wrap items-center gap-2" aria-label="About this film">
            <li className="inline-flex items-center gap-1.5 rounded-full bg-canvas/60 px-3 py-1 text-link-sm text-highlight ring-1 ring-action/40 backdrop-blur-sm">
              <Flame className="size-3.5" aria-hidden="true" />
              #1 in cinemas
            </li>
            {genre && <li className={chip}>{genre}</li>}
            {year && <li className={cn(chip, "tabular-nums")}>{year}</li>}
            {runtime && (
              <li className={cn(chip, "inline-flex items-center gap-1")}>
                <Clock className="size-3.5" aria-hidden="true" />
                {runtime}
              </li>
            )}
          </ul>
          <h1 id="home-hero" className="text-balance break-words text-display-sm font-bold text-ink sm:text-display night:text-glow-action">
            {film.title}
          </h1>
          {blurb && <p className="line-clamp-3 max-w-[46ch] text-pretty text-body text-graphite">{blurb}</p>}
          <div className="flex flex-wrap items-center gap-3">
            <Link to={`/movies/${film.tmdbId}`} className={buttonClass("primary")}>
              View Film
            </Link>
          </div>
        </div>
        <div className="flex flex-col gap-2 border-t border-ink/10 pt-6 lg:items-end lg:border-t-0 lg:pt-0">
          {median !== null ? (
            <>
              <ScoreNumeral score={median} tone="accent" className="night:text-glow-action" />
              <p className="inline-flex items-center gap-1.5 text-meta text-ash">
                <Star className="size-3.5 fill-highlight text-highlight" aria-hidden="true" />
                Verdix median of {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
              </p>
            </>
          ) : (
            <p className="inline-flex items-center gap-1.5 text-meta text-ash">
              <Star className="size-3.5 text-highlight" aria-hidden="true" />
              No Verdix reviews yet
            </p>
          )}
        </div>
      </motion.div>
    </section>
  )
}
